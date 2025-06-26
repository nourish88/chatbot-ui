// agentApi.js - API abstraction for agent chat and agent apps

export async function fetchAgentApps() {
  const res = await fetch("http://localhost:8000/agent_apps/");
  if (!res.ok) throw new Error("Failed to fetch agent apps");
  return res.json();
}

export async function fetchAgentChat(payload) {
  const res = await fetch("http://localhost:8000/agent_chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchDirectApiCall(endpoint, params) {
  const baseUrl = endpoint.base_url || "http://localhost:8000";
  const path = endpoint.path || "/apps/";
  const apiUrl = baseUrl.replace(/\/$/, "") + path;
  const apiMethod = endpoint.method || "POST";
  const res = await fetch(apiUrl, {
    method: apiMethod,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`API error! status: ${res.status}`);
  return res.json();
}
