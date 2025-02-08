// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock @vercel/analytics
jest.mock('@vercel/analytics/react', () => ({
    Analytics: {
        track: jest.fn(),
    },
    inject: jest.fn(),
}));

// Mock @vercel/analytics
jest.mock('@vercel/analytics', () => ({
    inject: jest.fn(),
}));

// Mock @sentry/react
jest.mock('@sentry/react', () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
}));

// Mock MonitoringService
jest.mock('../src/services/MonitoringService', () => ({
    __esModule: true,
    default: {
        initialize: jest.fn(),
        logTradeExecution: jest.fn(),
        logError: jest.fn(),
        startTradeMonitoring: jest.fn(() => ({
            tradeId: 'mock-trade-id',
            log: jest.fn(),
        })),
    },
}));

// Mock window.ethereum
const ethereum = {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
};

Object.defineProperty(window, 'ethereum', {
    value: ethereum,
    writable: true,
});

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
