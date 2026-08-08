import { NextResponse } from "next/server";
import { getProjects } from "@/actions/server";


export async function GET() {
  return NextResponse.json(getProjects(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
