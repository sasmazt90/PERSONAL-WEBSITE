import type { BlogCollection, BlogGenerationInput, BlogPost } from "@shared/blog";

const jsonHeaders = () => ({
  "Content-Type": "application/json",
});

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 2500) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) {
    throw new Error((body as { error?: string } | null)?.error || `Request failed (${response.status})`);
  }
  if (!body) throw new Error("Response did not contain JSON data.");
  return body as T;
}

async function fetchStaticBlogPosts(): Promise<BlogCollection> {
  const response = await fetch("/data/blog-posts.json");
  const collection = await parseResponse<BlogCollection>(response);
  return {
    posts: (collection.posts || [])
      .filter((post) => post.status === "published")
      .sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt)),
  };
}

export async function fetchAdminBlogPosts() {
  const response = await fetch("/api/admin/blog-posts", { headers: jsonHeaders() });
  return parseResponse<BlogCollection>(response);
}

export async function fetchAiStatus() {
  const response = await fetch("/api/admin/ai-status", { headers: jsonHeaders() });
  return parseResponse<{
    textGeneration: { configured: boolean; model: string; requiredEnv: string[] };
    imageGeneration: { configured: boolean; model: string; requiredEnv: string[] };
    messages: string[];
    sourceContext?: { configured: boolean; characterCount: number; sources: string[] };
  }>(response);
}

export async function fetchPublicBlogPosts() {
  try {
    const response = await fetchWithTimeout("/api/blog-posts/public");
    const collection = await parseResponse<BlogCollection>(response);
    return { posts: collection.posts || [] };
  } catch {
    return fetchStaticBlogPosts();
  }
}

export async function fetchPublicBlogPost(slug: string) {
  try {
    const response = await fetchWithTimeout(`/api/blog-posts/public/${encodeURIComponent(slug)}`);
    return await parseResponse<BlogPost>(response);
  } catch {
    const collection = await fetchStaticBlogPosts();
    const post = collection.posts.find((item) => [item.slug.canonical, item.slug.en, item.slug.de, item.slug.tr].includes(slug));
    if (!post) throw new Error("Published blog post not found.");
    return post;
  }
}

export async function createManualBlogPost(input: BlogGenerationInput) {
  const response = await fetch("/api/admin/blog-posts/manual", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(input),
  });
  return parseResponse<BlogPost>(response);
}

export async function generateBlogPost(input: BlogGenerationInput) {
  const response = await fetch("/api/admin/blog-posts/generate", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(input),
  });
  return parseResponse<BlogPost>(response);
}

export async function saveBlogPost(post: BlogPost) {
  const response = await fetch(`/api/admin/blog-posts/${post.id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(post),
  });
  return parseResponse<BlogPost>(response);
}

export async function publishBlogPost(postId: string) {
  const response = await fetch(`/api/admin/blog-posts/${postId}/publish`, {
    method: "POST",
    headers: jsonHeaders(),
  });
  return parseResponse<BlogPost>(response);
}

export async function deleteBlogPost(postId: string) {
  const response = await fetch(`/api/admin/blog-posts/${postId}`, {
    method: "DELETE",
    headers: jsonHeaders(),
  });
  return parseResponse<{ ok: true }>(response);
}

export async function uploadBlogVisual(postId: string, visualId: string, file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
  const response = await fetch(`/api/admin/blog-posts/${postId}/visuals/${visualId}/upload`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ fileName: file.name, dataUrl }),
  });
  const uploaded = await parseResponse<BlogPost>(response);
  const visual = uploaded.visuals.find((item) => item.id === visualId);
  if (!visual?.url) throw new Error("Image upload completed without a public URL.");
  const imageResponse = await fetch(visual.url, { cache: "no-store" });
  if (!imageResponse.ok || !imageResponse.headers.get("content-type")?.startsWith("image/")) {
    throw new Error("Image was saved, but its public URL is not serving an image. Please try again or contact support.");
  }
  return uploaded;
}

export async function generateBlogVisual(postId: string, visualId: string, prompt: string) {
  const response = await fetch(`/api/admin/blog-posts/${postId}/visuals/${visualId}/generate`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ prompt }),
  });
  return parseResponse<BlogPost>(response);
}
