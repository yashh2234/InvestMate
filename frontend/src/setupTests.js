import '@testing-library/jest-dom';

// Mock importMeta for Jest tests
globalThis.importMeta = {
  env: {
    VITE_API_BASE_URL: 'http://localhost:5000',
  },
};
