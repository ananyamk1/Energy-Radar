import OpenAI from "openai";
import { ProjectSchema } from "./types";
import { z } from "zod";
import { Client, AddressType } from "@googlemaps/google-maps-services-js";

// Initialize Clients
// Constructed lazily: building the client at module scope throws on import when
// the key is absent, which takes down every route that transitively imports this file.
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    // OPEN_API_KEY is the legacy name used by this project's .env; prefer the standard one.
    const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPEN_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY (or OPEN_API_KEY) is not set.");
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

const mapsClient = new Client({});

// A sync geocodes every project in the ERCOT report, and many share a county /
// POI. Caching by query address keeps that from turning into thousands of
// billable Geocoding calls per run.
const geoCache = new Map<string, Awaited<ReturnType<typeof geocodeUncached>>>();

// 1. Geolocation Function (FUNC)
export async function fetchGeo(county: string, state: string, poiLocation: string) {
  const queryAddress = `${poiLocation}, ${county} County, ${state}`;

  if (geoCache.has(queryAddress)) return geoCache.get(queryAddress)!;

  const result = await geocodeUncached(queryAddress, state);
  geoCache.set(queryAddress, result);
  return result;
}

async function geocodeUncached(queryAddress: string, state: string) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY is not set — skipping geocoding; coordinates will be unreliable.");
    return null;
  }

  try {
    const response = await mapsClient.geocode({
      params: {
        address: queryAddress,
        key: process.env.GOOGLE_MAPS_API_KEY as string,
      },
      timeout: 2500,
    });

    if (response.data.results.length === 0) {
      console.warn(`No geocode results found for: ${queryAddress}`);
      return null;
    }

    const bestMatch = response.data.results[0];
    const { lat, lng } = bestMatch.geometry.location;

    const cityComponent = bestMatch.address_components.find((component) =>
      component.types.includes(AddressType.locality) || 
      component.types.includes(AddressType.administrative_area_level_3)
    );
    
    const city = cityComponent ? cityComponent.long_name : "Unknown";

    return { city, state, lat, lng };
  } catch (error: any) {
    console.error(`Google Maps Geocoding failed for ${queryAddress}:`, error.message);
    return null;
  }
}

// 2. Mock Enrichment Functions (Step 2 of Workflow)
async function fetchSignalData(projectName: string) {
  // In production, this would query news or regulatory APIs
  return { recentSignalsCount: 4, lastMentionDaysAgo: 2 };
}

// 3. Main Extraction & Retry Loop
export async function extractProjectData(rawErcotJson: any, maxRetries = 3): Promise<z.infer<typeof ProjectSchema>> {
  // Step A: Gather deterministic enrichment data using FUNC
  // We pass in the POI location from the raw JSON to give the geocoder exact context
  const location = await fetchGeo(rawErcotJson.county, "TX", rawErcotJson.poi_location);
  const signals = await fetchSignalData(rawErcotJson.project_name);

  const enrichedContext = {
    rawPayload: rawErcotJson,
    externalData: { location, signals }
  };

  // Step B: Set up the LLM Conversation
  const systemPrompt = `
    You are an expert energy infrastructure analyst. 
    Transform the provided raw ERCOT project data and external context into a strict JSON object.
    
    Rules for synthesis:
    - Assess the 'stage' based on the completion of SS, FIS, and IA, plus energization dates.
    - Calculate a 'score' (0-100) based on project maturity.
    - Generate a concise, analyst-style 'whyNow' summary.
    - The output MUST exactly match the requested JSON schema.
  `;

  let messages: any[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(enrichedContext) }
  ];

  // Step C: The Zod Validation & Retry Loop
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`LLM Extraction Attempt ${attempt}...`);
      
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o", 
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.1, 
      });

      const llmOutput = completion.choices[0].message.content;
      if (!llmOutput) throw new Error("LLM returned an empty response.");

      // Parse the JSON string from the LLM
      const parsedJson = JSON.parse(llmOutput);

      // Validate against the Zod schema
      const validProjectData = ProjectSchema.parse(parsedJson);

      console.log("Success! Data successfully mapped and validated.");

      // The upsert in syncProjects() conflicts on `id`. An LLM-invented id is not
      // stable across runs, so every sync would insert duplicates instead of
      // updating. ERCOT's INR is the real primary key — always prefer it.
      return rawErcotJson.inr
        ? { ...validProjectData, id: String(rawErcotJson.inr) }
        : validProjectData;

    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed.`);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to extract project data after ${maxRetries} attempts. Last error: ${error.message}`);
      }

      // If it's a Zod validation error, tell the LLM exactly what it got wrong
      if (error instanceof z.ZodError) {
        const errorMessage = `Your last JSON output failed validation. Please fix the following errors and return ONLY the corrected JSON: ${error.message}`;
        messages.push({ role: "user", content: errorMessage });
      } else {
        // Handle generic JSON parsing errors
        messages.push({ role: "user", content: `Failed to parse JSON. Ensure your output is valid, unescaped JSON. Error: ${error.message}` });
      }
    }
  }
  
  throw new Error("Unexpected end of extraction loop.");
}