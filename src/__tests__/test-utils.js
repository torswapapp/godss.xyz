import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from '../theme';

export function renderWithProviders(ui, options = {}) {
    return render(ui, {
        wrapper: ({ children }) => (
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        ),
        ...options,
    });
}

export const mockProvider = {
    getNetwork: jest.fn().mockResolvedValue({ name: 'mainnet', chainId: 1 }),
    getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0x123...'),
        signMessage: jest.fn(),
    }),
};

export const mockWeb3Provider = {
    provider: mockProvider,
    getSigner: mockProvider.getSigner,
}; 