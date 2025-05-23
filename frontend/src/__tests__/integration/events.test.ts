import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/events/route';

describe('Event Management Integration Tests', () => {
  const mockEvent = {
    title: 'Test Wedding',
    description: 'A beautiful wedding celebration',
    date: '2024-12-31',
    theme: 'classic',
  };

  describe('Event Creation', () => {
    it('should create a new event successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/events',
        body: mockEvent,
      });

      const request = new NextRequest(req.url, {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.title).toBe(mockEvent.title);
    });

    it('should retrieve event details', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/events/123',
      });

      const request = new NextRequest(req.url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title');
    });
  });
}); 