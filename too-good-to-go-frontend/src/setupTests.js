import '@testing-library/jest-dom';

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Mock window.alert  
global.alert = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});