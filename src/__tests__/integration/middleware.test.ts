import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { setTestEnvironment } from '../utils/test-utils';

describe('Development Middleware', () => {
  it('should skip middleware in production', async () => {
    const cleanup = setTestEnvironment('production');
    const request = new NextRequest('http://localhost:3000');
    const response = await middleware(request);
    cleanup();
    
    expect(response.cookies.get('next-auth.session-token')).toBeUndefined();
  });

  it('should set mock session in development', async () => {
    const cleanup = setTestEnvironment('development');
    const request = new NextRequest('http://localhost:3000');
    const response = await middleware(request);
    cleanup();
    
    const sessionCookie = response.cookies.get('next-auth.session-token');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe('mock-session-token');
  });

  it('should not set session for API routes', async () => {
    const cleanup = setTestEnvironment('development');
    const request = new NextRequest('http://localhost:3000/api/test');
    const response = await middleware(request);
    cleanup();
    
    expect(response.cookies.get('next-auth.session-token')).toBeUndefined();
  });

  it('should not set session for static files', async () => {
    const cleanup = setTestEnvironment('development');
    const request = new NextRequest('http://localhost:3000/_next/static/test.js');
    const response = await middleware(request);
    cleanup();
    
    expect(response.cookies.get('next-auth.session-token')).toBeUndefined();
  });
}); 