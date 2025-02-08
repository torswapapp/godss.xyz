import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import PerformanceMonitor from '../services/PerformanceMonitor';
import MonitoringDashboard from './MonitoringDashboard';

const AppWrapper = ({ children }) => {
    useEffect(() => {
        // Keep performance monitoring
        PerformanceMonitor.initialize();
    }, []);

    return (
        <ErrorBoundary
            FallbackComponent={({ error }) => (
                <div>
                    <h1>Something went wrong</h1>
                    <pre>{error.message}</pre>
                </div>
            )}
        >
            {children}
            {process.env.NODE_ENV === 'development' && <MonitoringDashboard />}
        </ErrorBoundary>
    );
};

export default AppWrapper; 