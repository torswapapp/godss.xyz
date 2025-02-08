import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, Box,
    LinearProgress, Chip, IconButton, Tooltip
} from '@mui/material';
import { 
    Timeline, TimelineItem, TimelineSeparator,
    TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import {
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    NetworkCheck as NetworkIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, ReferenceLine
} from 'recharts';
import PerformanceMonitorService from '../services/PerformanceMonitorService';
import WebSocketEventHandler from '../services/WebSocketEventHandler';
import PerformanceOptimizationService from '../services/PerformanceOptimizationService';

const RealTimePerformanceMonitor = ({ provider }) => {
    const [metrics, setMetrics] = useState({
        latency: [],
        gasUsage: [],
        memoryUsage: [],
        events: []
    });

    const [status, setStatus] = useState({
        health: 'healthy',
        lastUpdate: Date.now(),
        alerts: []
    });

    useEffect(() => {
        const updateMetrics = async () => {
            const report = await PerformanceMonitorService.getPerformanceReport();
            
            // Update metrics with latest data
            setMetrics(prev => ({
                latency: [...prev.latency, {
                    timestamp: Date.now(),
                    value: report.metrics.averageExecutionTime
                }].slice(-50), // Keep last 50 data points
                gasUsage: [...prev.gasUsage, {
                    timestamp: Date.now(),
                    value: report.metrics.averageGasUsage
                }].slice(-50),
                memoryUsage: [...prev.memoryUsage, {
                    timestamp: Date.now(),
                    value: performance.memory?.usedJSHeapSize || 0
                }].slice(-50),
                events: [...prev.events, ...report.recommendations.map(rec => ({
                    timestamp: Date.now(),
                    type: rec.type,
                    message: rec.message,
                    priority: rec.priority
                }))].slice(-10) // Keep last 10 events
            }));

            // Update status
            setStatus({
                health: determineHealthStatus(report),
                lastUpdate: Date.now(),
                alerts: report.recommendations
            });
        };

        const interval = setInterval(updateMetrics, 2000); // Update every 2 seconds
        return () => clearInterval(interval);
    }, [provider]);

    useEffect(() => {
        // Subscribe to WebSocket events
        WebSocketEventHandler.subscribe('PERFORMANCE_UPDATE', (data) => {
            setMetrics(prev => ({
                ...prev,
                latency: [...prev.latency, {
                    timestamp: Date.now(),
                    value: data.executionTime
                }].slice(-50)
            }));
        });

        WebSocketEventHandler.subscribe('GAS_PRICE_UPDATE', async (data) => {
            const optimizedGasPrice = await PerformanceOptimizationService.optimizeGasPrice(
                provider,
                data.gasPrice
            );

            setMetrics(prev => ({
                ...prev,
                gasUsage: [...prev.gasUsage, {
                    timestamp: Date.now(),
                    value: optimizedGasPrice
                }].slice(-50)
            }));
        });

        return () => {
            WebSocketEventHandler.unsubscribe('PERFORMANCE_UPDATE');
            WebSocketEventHandler.unsubscribe('GAS_PRICE_UPDATE');
        };
    }, [provider]);

    const determineHealthStatus = (report) => {
        if (report.status.execution === 'needs_optimization' || 
            report.status.success === 'needs_improvement') {
            return 'warning';
        }
        if (report.status.gas === 'high') {
            return 'critical';
        }
        return 'healthy';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">
                        Real-Time Performance Monitor
                    </Typography>
                    <Box>
                        <Chip 
                            label={`Status: ${status.health}`}
                            color={getStatusColor(status.health)}
                            sx={{ mr: 1 }}
                        />
                        <Tooltip title="Last updated">
                            <Typography variant="caption" color="textSecondary">
                                {new Date(status.lastUpdate).toLocaleTimeString()}
                            </Typography>
                        </Tooltip>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Latency Chart */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <SpeedIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                                    Transaction Latency
                                </Typography>
                                <Box height={200}>
                                    <ResponsiveContainer>
                                        <LineChart data={metrics.latency}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="timestamp"
                                                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                            />
                                            <YAxis />
                                            <ReferenceLine 
                                                y={1000} 
                                                stroke="red" 
                                                strokeDasharray="3 3"
                                                label="Warning Threshold"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#8884d8"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Gas Usage Chart */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <NetworkIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                                    Gas Usage
                                </Typography>
                                <Box height={200}>
                                    <ResponsiveContainer>
                                        <LineChart data={metrics.gasUsage}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="timestamp"
                                                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                            />
                                            <YAxis />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#82ca9d"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Events Timeline */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <WarningIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                                    Recent Events
                                </Typography>
                                <Timeline>
                                    {metrics.events.map((event, index) => (
                                        <TimelineItem key={index}>
                                            <TimelineSeparator>
                                                <TimelineDot color={event.priority === 'high' ? 'error' : 'info'} />
                                                {index < metrics.events.length - 1 && <TimelineConnector />}
                                            </TimelineSeparator>
                                            <TimelineContent>
                                                <Typography variant="body2" color="textSecondary">
                                                    {new Date(event.timestamp).toLocaleTimeString()}
                                                </Typography>
                                                <Typography>{event.message}</Typography>
                                            </TimelineContent>
                                        </TimelineItem>
                                    ))}
                                </Timeline>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default RealTimePerformanceMonitor; 