import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/auth/[...nextauth]/route';

describe('Authentication Integration Tests', () => {
  describe('Google OAuth Flow', () => {
    it('should redirect to Google OAuth login page', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/auth/signin/google',
      });

      const request = new NextRequest(req.url);
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('accounts.google.com');
    });

    it('should handle OAuth callback successfully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/auth/callback/google',
        query: {
          code: 'mock_auth_code',
        },
      });

      const request = new NextRequest(req.url);
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });
  });
}); 