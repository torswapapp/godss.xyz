import React from 'react';
import AppWrapper from './components/AppWrapper';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from '@mui/material';
import theme from './theme';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AppWrapper>
                <Dashboard />
            </AppWrapper>
        </ThemeProvider>
    );
}

export default App;
