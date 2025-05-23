import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';

export const mockUser: AdapterUser = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: new Date(),
  image: 'https://example.com/avatar.jpg',
};

export const mockSession: Session = {
  user: mockUser,
  expires: new Date().toISOString(),
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
};

export const mockToken: JWT = {
  sub: '123',
  name: 'Test User',
  email: 'test@example.com',
  picture: 'https://example.com/avatar.jpg',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

export const setTestEnvironment = (env: 'development' | 'production') => {
  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    NODE_ENV: env,
  };
  return () => {
    process.env = originalEnv;
  };
}; 