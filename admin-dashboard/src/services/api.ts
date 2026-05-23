const BASE_URL = (import.meta as any)?.env?.VITE_BACKEND_URL || 'https://pizza-craft-api.onrender.com';

function authHeaders() {
  const token = localStorage.getItem('adminToken');
  console.log('🔑 Auth headers - has token:', !!token, token?.substring(0, 20) + '...');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `GET ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `PATCH ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed with ${res.status}`);
  }
  return res.json();
}
