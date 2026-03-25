export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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