import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../../components/Dashboard';
import { renderWithProviders } from '../../test-utils';

jest.mock('../../../services/ArbitrageContractService');
jest.mock('../../../services/WebSocketService');

describe('Dashboard Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        renderWithProviders(<Dashboard />);
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    test('displays price data correctly', () => {
        const mockPriceData = {
            'ETH/USDC': '1850.45',
            'ETH/USDT': '1849.98'
        };
        renderWithProviders(<Dashboard priceData={mockPriceData} />);
        expect(screen.getByText(/1850.45/)).toBeInTheDocument();
    });
}); 