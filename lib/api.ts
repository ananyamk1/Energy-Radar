import useSWR from "swr";
import { Project } from "./types";
import { projects } from "./mock-data";

const fetcher = async (url: string): Promise<Project[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
};

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>("/api/projects", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true
  });

  return { projects: data ?? projects, error, isLoading, refresh: mutate };
}
