// empty string = use Vite proxy to backend in dev (see vite.config.js)
const BASE = import.meta.env.VITE_API_URL || "";

export async function postJson(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = {};
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server did not return JSON (check API is running on port 5000)");
    }
  } else if (!res.ok) {
    throw new Error("Empty response — is the backend running?");
  }
  if (!res.ok) throw new Error(data.message || res.statusText || "Request failed");
  return data;
}
