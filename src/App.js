import React, { useEffect } from 'react';
import AppWrapper from './components/AppWrapper';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from '@mui/material';
import theme from './theme';
import { ethers } from 'ethers';
import ArbitrageMonitorService from './services/ArbitrageMonitorService';

function App() {
    useEffect(() => {
        const initializeMonitoring = async () => {
            const provider = new ethers.providers.WebSocketProvider(
                process.env.REACT_APP_WS_PROVIDER_URL
            );
            
            const arbitrageMonitor = new ArbitrageMonitorService(provider);
            await arbitrageMonitor.startMonitoring();
        };

        if (process.env.NODE_ENV === 'production') {
            initializeMonitoring();
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <AppWrapper>
                <Dashboard />
            </AppWrapper>
        </ThemeProvider>
    );
}

export default App;
