import { readPublicEnv } from '../publicEnv';
import { ApiError, type ApiErrorBody } from './types';

export function apiBaseUrl(): string {
  const base = readPublicEnv('VITE_API_BASE_URL', 'http://localhost:3000');
  return base.replace(/\/$/, '');
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Network error — check that the API is running.');
  }

  const text = await response.text();
  let body: unknown = undefined;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const errBody = body as ApiErrorBody | undefined;
    const message =
      (typeof errBody?.error === 'object' && errBody.error?.message) ||
      (typeof errBody?.error === 'string' ? errBody.error : undefined) ||
      errBody?.message ||
      `Request failed (${response.status})`;
    throw new ApiError(response.status, message, body);
  }

  return body as T;
}
