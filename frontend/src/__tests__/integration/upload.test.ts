import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/route';

describe('File Upload Integration Tests', () => {
  describe('Photo Upload', () => {
    it('should upload a photo successfully', async () => {
      const mockFile = new File(['test image content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('eventId', '123');

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/upload',
        body: formData,
      });

      const request = new NextRequest(req.url, {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('fileId');
      expect(data).toHaveProperty('url');
    });

    it('should handle invalid file types', async () => {
      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('eventId', '123');

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/upload',
        body: formData,
      });

      const request = new NextRequest(req.url, {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });
  });
}); 