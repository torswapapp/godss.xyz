import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import HealthCheckService from '../services/HealthCheckService';
import PerformanceMonitor from '../services/PerformanceMonitor';

const MonitoringDashboard = () => {
    const [health, setHealth] = useState(null);
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const checkHealth = async () => {
            const status = await HealthCheckService.checkHealth();
            setHealth(status);
        };

        const interval = setInterval(checkHealth, 60000); // Check every minute
        checkHealth();

        return () => clearInterval(interval);
    }, []);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">System Health</Typography>
                        {health && (
                            <pre>{JSON.stringify(health, null, 2)}</pre>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default MonitoringDashboard; 