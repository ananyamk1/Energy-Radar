import { createClient } from "@supabase/supabase-js";
import { SignalSchema, ProjectSchema } from "./types";
import z from "zod";

import { fetchProjects } from "./scrape";
import { extractProjectData } from "./projectSummarizer";


const ProjectArray = z.array(ProjectSchema);
const SignalArray = z.array(SignalSchema);

export async function getClient()
{
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key)
        throw new Error("Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");

    return createClient(url, key);
}

// Read-only. Does NOT scrape — syncProjects() re-downloads the ERCOT report and
// runs one LLM call per project, so calling it per request made every poll a
// multi-minute, multi-dollar operation. Trigger it explicitly via POST /api/projects.
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
// The ERCOT report holds ~1800 rows and each one costs an LLM call. A bare
// Promise.all over all of them opens ~1800 concurrent GPT-4o requests, which
// rate-limits immediately — and because Promise.all rejects on the first error,
// a single failure throws away every other result. Bound the concurrency and
// tolerate per-project failures instead.
const EXTRACT_CONCURRENCY = 5;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = { status: "fulfilled", value: await fn(items[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });

  await Promise.all(workers);
  return results;
}

export async function scrapeProjects(limit?: number): Promise<z.infer<typeof ProjectArray>> {
  const uncleanData = await fetchProjects();
  const targets = limit ? uncleanData.slice(0, limit) : uncleanData;

  console.log(`[SCRAPE] Extracting ${targets.length} of ${uncleanData.length} scraped rows...`);

  const settled = await mapWithConcurrency(targets, EXTRACT_CONCURRENCY, (row) =>
    extractProjectData(row)
  );

  const cleanData = settled
    .filter((r): r is PromiseFulfilledResult<z.infer<typeof ProjectSchema>> => r.status === "fulfilled")
    .map((r) => r.value);

  const failed = settled.length - cleanData.length;
  if (failed > 0) {
    console.warn(`[SCRAPE] ${failed} of ${settled.length} projects failed extraction and were skipped.`);
  }

  return cleanData;
}

const UPSERT_CHUNK_SIZE = 500;

export async function syncProjects(limit?: number) {
    console.log("Starting project scrape...");
    const scrapedProjects = await scrapeProjects(limit);

    if (scrapedProjects.length === 0) {
        console.log("No projects scraped. Exiting sync.");
        return;
    }

    // Postgres rejects an ON CONFLICT batch that touches the same row twice
    // ("cannot affect row a second time"), so collapse duplicate ids first.
    // Later rows win, matching upsert semantics.
    const deduped = [...new Map(scrapedProjects.map((p) => [p.id, p])).values()];
    if (deduped.length !== scrapedProjects.length) {
        console.warn(`[SYNC] Collapsed ${scrapedProjects.length - deduped.length} duplicate project ids.`);
    }

    const client = await getClient();

    console.log(`Upserting ${deduped.length} projects to the database...`);

    // Chunked so a large report doesn't exceed the request size limit.
    for (let i = 0; i < deduped.length; i += UPSERT_CHUNK_SIZE) {
        const chunk = deduped.slice(i, i + UPSERT_CHUNK_SIZE);

        const { error } = await client
            .from("projects")
            .upsert(chunk, { onConflict: "id" });

        if (error) {
            throw new Error(`[UPSERT-ERROR] -> ${error.message}`);
        }
    }

    console.log("Projects successfully synced!");
}