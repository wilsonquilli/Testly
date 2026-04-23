export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}

export function setAuthSession(accessToken, user) {
  localStorage.setItem("testly_token", accessToken);
  localStorage.setItem("testly_user", JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem("testly_token");
  localStorage.removeItem("testly_user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("testly_user");
  return raw ? JSON.parse(raw) : null;
}

export function getAccessToken() {
  return localStorage.getItem("testly_token");
}

export function getAuthHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}