import { createClient } from "@supabase/supabase-js";
import { SignalSchema, ProjectSchema } from "./types";
import z, { unknown } from "zod";

import { fetchProjects } from "./scrape";
import { extractProjectData } from "./projectSummarizer";


const ProjectArray = z.array(ProjectSchema);
const SignalArray = z.array(SignalSchema);

export async function getClient()
{
    return await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}

export async function getProjects(): Promise<z.infer<typeof ProjectArray>>
{
    const client = await getClient();

    const { data, error} = await client.from("projects").select("*")
    .order("confidence", { ascending: false});

    if ( error )
        throw error;

    const parsingData = ProjectArray.safeParse(data);

    if (!parsingData.success)
    {
        throw Error(`[PARSING-ERROR] -> ${parsingData.error}`);
    }

    return parsingData.data;
}

export async function getSignals(projectID: string): Promise<z.infer<typeof SignalArray>>
{   
    const client = await getClient();

    const { data, error} = await client.from("signals").select("*").eq("project", projectID);

    if ( error )
        throw error;

    const parsingData = SignalArray.safeParse(data);

    if (!parsingData.success)
    {
        throw Error(`[PARSING-ERROR] -> ${parsingData.error}`);
    }

    return parsingData.data;
}


export async function addSignals(signals: z.infer<typeof SignalArray>)
{
    const client = await getClient();

    const { data, error } = await client.from("signals").insert(signals);

    if (error)
        throw error;

}


export async function addProjects(projects: z.infer<typeof ProjectArray>)
{
    const client = await getClient();

    const { error } = await client.from("projects").insert(projects);

    if(error)
        throw error;
}
export async function scrapeProjects(): Promise<z.infer<typeof ProjectArray>> {
  const uncleanData = await fetchProjects();

  // Wrap the .map in Promise.all and await the result
  const cleanData = await Promise.all(
    uncleanData.map(async (e) => {
      // Stringifying isn't strictly necessary if extractProjectData accepts an object, 
      // but keeping it as you had it:
      return await extractProjectData(JSON.stringify(e, null, 2));
    })
  );

  return cleanData; // cleanData is now the resolved array of objects
}

export async function syncProjects() {
    console.log("Starting project scrape...");
    const scrapedProjects = await scrapeProjects();

    if (scrapedProjects.length === 0) {
        console.log("No projects scraped. Exiting sync.");
        return;
    }

    const client = await getClient();

    console.log(`Upserting ${scrapedProjects.length} projects to the database...`);
    
    // The .upsert() method handles both inserts and updates.
    // 'onConflict' tells Supabase which column to check for duplicates. 
    // Assuming 'id' is your primary key.
    const { error } = await client
        .from("projects")
        .upsert(scrapedProjects, {
            onConflict: "id" 
        });

    if (error) {
        throw new Error(`[UPSERT-ERROR] -> ${error.message}`);
    }

    console.log("Projects successfully synced!");
}