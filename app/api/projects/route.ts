import { NextResponse } from "next/server";
import { getProjects, syncProjects } from "@/actions/server";

// This route hits Supabase per request — never prerender or cache it.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getProjects();

    return NextResponse.json(projects, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    console.error("[GET /api/projects]", error);

    return NextResponse.json(
      { error: error?.message ?? "Failed to load projects" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// Explicit, expensive refresh: re-scrapes the ERCOT report and re-runs the LLM
// extraction for every project. Kept off the GET path on purpose.
export async function POST(request: Request) {
  try {
    // ?limit=5 extracts only the first N rows — a full sync is ~1800 LLM calls,
    // so the limit makes it testable without a large bill.
    const limitParam = new URL(request.url).searchParams.get("limit");
    const parsedLimit = limitParam ? Number(limitParam) : undefined;

    if (limitParam && (!Number.isInteger(parsedLimit) || parsedLimit! < 1)) {
      return NextResponse.json({ error: "limit must be a positive integer" }, { status: 400 });
    }

    await syncProjects(parsedLimit);
    const projects = await getProjects();

    return NextResponse.json(projects, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error: any) {
    console.error("[POST /api/projects]", error);

    return NextResponse.json(
      { error: error?.message ?? "Failed to sync projects" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
