import { apiRequest as baseApiRequest } from "./queryClient";

// Wrapper for API requests to add prefix and type safety
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  // Make sure URL starts with /api
  const apiUrl = url.startsWith("/api") ? url : `/api${url}`;
  return baseApiRequest(method, apiUrl, data);
}

// Helper function for making POST requests
export async function postRequest<T = any, D = any>(
  url: string,
  data: D
): Promise<T> {
  const response = await apiRequest("POST", url, data);
  return response.json();
}

// Helper function for making GET requests
export async function getRequest<T = any>(url: string): Promise<T> {
  const response = await apiRequest("GET", url);
  return response.json();
}
