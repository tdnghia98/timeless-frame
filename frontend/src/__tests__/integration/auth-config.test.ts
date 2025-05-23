import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { mockSession, mockToken, mockUser, setTestEnvironment } from '../utils/test-utils';

describe('NextAuth Configuration', () => {
  describe('Development Mode', () => {
    it('should return mock session in development', async () => {
      const cleanup = setTestEnvironment('development');
      const session = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
        user: mockUser,
        newSession: mockSession,
        trigger: 'update'
      });
      cleanup();

      expect(session?.user).toEqual({
        name: 'Development User',
        email: 'dev@example.com',
        image: 'https://via.placeholder.com/150',
      });
    });

    it('should return mock token in development', async () => {
      const cleanup = setTestEnvironment('development');
      const token = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        account: null,
        user: mockUser,
      });
      cleanup();

      expect(token).toEqual({
        ...mockToken,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });
  });

  describe('Production Mode', () => {
    it('should return original session in production', async () => {
      const cleanup = setTestEnvironment('production');
      const session = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
        user: mockUser,
        newSession: mockSession,
        trigger: 'update'
      });
      cleanup();

      expect(session).toEqual(mockSession);
    });

    it('should return original token in production', async () => {
      const cleanup = setTestEnvironment('production');
      const token = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        account: null,
        user: mockUser,
      });
      cleanup();

      expect(token).toEqual(mockToken);
    });
  });
}); 