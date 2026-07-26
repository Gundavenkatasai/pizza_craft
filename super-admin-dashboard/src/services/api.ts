const BASE_URL = (import.meta as any)?.env?.VITE_BACKEND_URL || 'http://localhost:3001';

function authHeaders() {
  const token = localStorage.getItem('adminToken');
  console.log('🔑 Auth headers - has token:', !!token, token?.substring(0, 20) + '...');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    } as any
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
    body: body ? JSON.stringify(body) : undefined,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    } as any
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
    body: body ? JSON.stringify(body) : undefined,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    } as any
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    } as any
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `PUT ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    } as any
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `DELETE ${path} failed with ${res.status}`);
  }
  return res.json();
}
