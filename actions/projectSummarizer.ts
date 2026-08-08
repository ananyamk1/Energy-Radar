import OpenAI from "openai";
import { ProjectSchema } from "./types";
import { z } from "zod";
import { Client, AddressType } from "@googlemaps/google-maps-services-js";

// Initialize Clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const mapsClient = new Client({});

// 1. Geolocation Function (FUNC)
export async function fetchGeo(county: string, state: string, poiLocation: string) {
  const queryAddress = `${poiLocation}, ${county} County, ${state}`;

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
      
      const completion = await openai.chat.completions.create({
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
      return validProjectData;

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