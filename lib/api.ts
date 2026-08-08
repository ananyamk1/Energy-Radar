import useSWR from "swr";
import { Project } from "./types";
import { projects as mockProjects } from "./mock-data";

const fetcher = async (url: string): Promise<Project[]> => {
  const res = await fetch(url);

  if (!res.ok) {
    // The route returns { error } on failure — surface that instead of a
    // generic message, otherwise real API breakage is impossible to diagnose.
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error ?? `Failed to load projects (HTTP ${res.status})`);
  }

  return res.json();
};

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>("/api/projects", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true
  });

  // Falling back to mock data on error makes a dead API look like a working
  // dashboard. Keep the fallback so the UI still renders, but report it via
  // `isFallback` so callers can show a warning rather than silently lying.
  const isFallback = Boolean(error) || (!isLoading && !data);

  if (error) {
    console.error("[useProjects] falling back to mock data:", error);
  }

  return {
    projects: data ?? mockProjects,
    error,
    isLoading,
    isFallback,
    refresh: mutate
  };
}
