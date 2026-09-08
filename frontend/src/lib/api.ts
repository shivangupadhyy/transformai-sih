import type {
  Generation,
  GenerationRequest,
  Project,
  SourceAsset,
  SourceType,
} from "../types/project";
import { supabase } from "./supabase";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000";

async function getAuthHeader(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      return `Bearer ${data.session.access_token}`;
    }
  } catch {
    // Demo / fallback token
  }
  return "Bearer demo-session-token";
}

async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Authorization")) {
    headers.set("Authorization", authHeader);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Request failed with status ${response.status}`);
  }
  return response;
}

export async function listProjects(): Promise<Project[]> {
  const res = await authenticatedFetch("/api/projects");
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await authenticatedFetch(`/api/projects/${id}`);
  return res.json();
}

export async function createProject(
  title: string,
  sourceType: SourceType,
  sourceText?: string,
  settings: Record<string, any> = {}
): Promise<Project> {
  const res = await authenticatedFetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      source_type: sourceType,
      source_text: sourceText || null,
      settings,
    }),
  });
  return res.json();
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const res = await authenticatedFetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  await authenticatedFetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
}

export async function uploadAsset(projectId: string, file: File): Promise<SourceAsset> {
  const authHeader = await getAuthHeader();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}/assets`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? "Asset upload and extraction failed");
  }
  return response.json();
}

export async function extractSource(
  projectId: string,
  sourceType: SourceType,
  content: string
): Promise<{ status: string; extracted_text: string }> {
  const res = await authenticatedFetch(`/api/projects/${projectId}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_type: sourceType, content }),
  });
  return res.json();
}

export async function generateProject(
  projectId: string,
  payload: GenerationRequest
): Promise<Generation[]> {
  const res = await authenticatedFetch(`/api/projects/${projectId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function regenerateOutput(
  generationId: string,
  payload: GenerationRequest
): Promise<Generation> {
  const res = await authenticatedFetch(`/api/generations/${generationId}/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateGenerationContent(
  generationId: string,
  content: any
): Promise<Generation> {
  const res = await authenticatedFetch(`/api/generations/${generationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function exportProject(
  projectId: string,
  format: "markdown" | "json" = "markdown"
): Promise<string | object> {
  const res = await authenticatedFetch(`/api/projects/${projectId}/export?format=${format}`);
  if (format === "json") {
    return res.json();
  }
  return res.text();
}
