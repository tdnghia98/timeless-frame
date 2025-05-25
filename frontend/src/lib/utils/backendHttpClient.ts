import { HTTPMethod, IHttpClient } from './httpClient';
import { getAccessToken } from './authService';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  method: HTTPMethod,
  body?: any
): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    let errorMsg = 'Request failed';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export const backendHttpClient: IHttpClient = {
  get: (url, options) => request(url, options, 'GET'),
  post: (url, body, options) => request(url, options, 'POST', body),
  put: (url, body, options) => request(url, options, 'PUT', body),
  patch: (url, body, options) => request(url, options, 'PATCH', body),
  delete: (url, options) => request(url, options, 'DELETE'),
  options: (url, options) => request(url, options, 'OPTIONS'),
};
