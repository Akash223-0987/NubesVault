
// Helper for Authenticated Fetch
// Adds token from localStorage to headers automatically

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  },
  post: async (endpoint: string, body: any, isMultipart = false) => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = { Authorization: `Bearer ${token}` };
    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isMultipart ? body : JSON.stringify(body)
    });
    return res;
  },
  delete: async (endpoint: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  }
};
