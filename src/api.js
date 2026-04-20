const GAS_URL = import.meta.env.VITE_GAS_URL;

async function request(payload) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    // text/plain でpreflightを回避（GASはContent-Type問わずpostData.contentsで受け取れる）
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchRules() {
  const data = await request({ action: "get" });
  return data.rules;
}

export async function addRule(title, content) {
  return request({ action: "add", title, content });
}

export async function updateRule(id, title, content) {
  return request({ action: "update", id, title, content });
}

export async function toggleRule(id, isActive) {
  return request({ action: "toggle", id, isActive });
}

export async function deleteRule(id) {
  return request({ action: "delete", id });
}
