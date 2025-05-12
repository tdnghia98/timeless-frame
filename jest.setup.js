// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: '1',
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Google Drive API
jest.mock('@/lib/google-drive', () => ({
  uploadFile: jest.fn(() => Promise.resolve({ id: 'mock-file-id', webViewLink: 'https://mock-link.com' })),
  createFolder: jest.fn(() => Promise.resolve({ id: 'mock-folder-id' })),
})); 