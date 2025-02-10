import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import monitoringService from '../services/MonitoringService';

const PerformanceMonitor = () => {
    const theme = useTheme();
    const [metrics, setMetrics] = useState({
        cpu: 0,
        memory: 0,
        latency: 0,
        errorRate: 0
    });

    useEffect(() => {
        const updateMetrics = async () => {
            try {
                // Get performance metrics
                const currentMetrics = await monitoringService.getPerformanceMetrics();
                setMetrics(currentMetrics);
            } catch (error) {
                console.error('Error fetching performance metrics:', error);
            }
        };

        updateMetrics();
        const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const getColorForValue = (value, threshold) => {
        if (value > threshold) return theme.palette.error.main;
        if (value > threshold * 0.8) return theme.palette.warning.main;
        return theme.palette.success.main;
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    System Performance
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                            CPU Usage ({metrics.cpu}%)
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.cpu}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: theme.palette.grey[800],
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: getColorForValue(metrics.cpu, 80)
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                            Memory Usage ({metrics.memory}%)
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.memory}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: theme.palette.grey[800],
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: getColorForValue(metrics.memory, 85)
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                            Network Latency ({metrics.latency}ms)
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={(metrics.latency / 1000) * 100}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: theme.palette.grey[800],
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: getColorForValue(metrics.latency, 1000)
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                            Error Rate ({metrics.errorRate}%)
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.errorRate * 20} // Scale to make it visible
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: theme.palette.grey[800],
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: getColorForValue(metrics.errorRate, 5)
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default PerformanceMonitor;