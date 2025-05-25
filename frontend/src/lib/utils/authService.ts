// Utility for frontend to interact with backend NestJS auth endpoints

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function login(provider: 'google', redirectUri?: string): Promise<void> {
  // Redirect to backend OAuth endpoint
  let url = `${API_URL}/auth/google`;
  if (redirectUri) {
    url += `?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  window.location.href = url;
}

export function logout() {
  clearSession();
  // Optionally, redirect to home or login page
  window.location.href = '/auth/signin';
}

export async function getSession(): Promise<UserSession | null> {
  // Try to get session info from localStorage or backend
  const token = getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchSession(): Promise<UserSession | null> {
  // Try to get session info from localStorage or backend
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!token) return null;
  // Optionally, validate token with backend
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession) {
  localStorage.setItem('accessToken', session.accessToken);
  localStorage.setItem('refreshToken', session.refreshToken);
  // Optionally, store user info
  localStorage.setItem('user', JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function signIn(
  provider: 'google' | 'credentials',
  options?: { callbackUrl?: string; email?: string; password?: string }
): Promise<void> {
  if (provider === 'google') {
    // Use backend Google OAuth endpoint
    let url = `${API_URL}/auth/google`;
    if (options?.callbackUrl) {
      url += `?redirect_uri=${encodeURIComponent(options.callbackUrl)}`;
    }
    window.location.href = url;
    return;
  }
  if (provider === 'credentials') {
    // POST to backend /auth/login with email/password
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: options?.email,
        password: options?.password,
      }),
    });
    if (!res.ok) {
      throw new Error('Invalid credentials');
    }
    const session = await res.json();
    saveSession(session);
    // Redirect to dashboard or callbackUrl
    window.location.href = options?.callbackUrl || '/dashboard';
  }
}
