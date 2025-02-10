import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, 
    LinearProgress, Alert, Box, Chip,
    Table, TableBody, TableCell, TableHead, TableRow 
} from '@mui/material';
import { formatEther } from 'ethers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import NetworkMetricsService from '../services/NetworkMetricsService';
import { useMonitoring } from '../hooks/useMonitoring';

const NetworkStatusMonitor = ({ provider }) => {
    const [networkStatus, setNetworkStatus] = useState({
        blockNumber: 0,
        gasPrice: 0,
        networkCongestion: 0,
        pendingTxCount: 0,
        nodeHealth: 'Healthy',
        connectedPeers: 0,
        latency: 0,
        blockTime: [],
        failedRequests: 0,
        nodeSync: 100
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metricsService] = useState(() => new NetworkMetricsService(provider));
    const monitoring = useMonitoring();

    useEffect(() => {
        const monitorNetwork = async () => {
            try {
                const [
                    blockNumber,
                    feeData,
                    block
                ] = await Promise.all([
                    provider.getBlockNumber(),
                    provider.getFeeData(),
                    provider.getBlock('latest')
                ]);

                const newStatus = {
                    blockNumber,
                    gasPrice: parseFloat(formatEther(feeData.gasPrice)),
                    networkCongestion: await metricsService.calculateNetworkCongestion(block),
                    pendingTxCount: await metricsService.getPendingTransactions(),
                    nodeHealth: await metricsService.checkNodeHealth(),
                    connectedPeers: await metricsService.getConnectedPeers(),
                    latency: await metricsService.measureLatency(),
                    blockTime: metricsService.updateBlockTimes(block),
                    failedRequests: await metricsService.getFailedRequests(),
                    nodeSync: await metricsService.getNodeSyncStatus()
                };

                setNetworkStatus(newStatus);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch network status');
                console.error(err);
            }
        };

        monitorNetwork();
        const interval = setInterval(monitorNetwork, 5000);
        
        // Subscribe to new blocks
        metricsService.subscribeToNewBlocks(() => {
            monitorNetwork();
        });

        return () => clearInterval(interval);
    }, [provider, metricsService]);

    useEffect(() => {
        const trackNetworkMetrics = async () => {
            const blockNumber = await provider.getBlockNumber();
            const gasPrice = await provider.getGasPrice();
            const block = await provider.getBlock('latest');
            
            monitoring.trackNetworkChange({
                blockNumber,
                gasPrice: gasPrice.toString(),
                congestion: (block.gasUsed / block.gasLimit) * 100
            });
        };

        const interval = setInterval(trackNetworkMetrics, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, [provider, monitoring]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Healthy':
                return 'success';
            case 'Warning':
                return 'warning';
            case 'Critical':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) return <LinearProgress />;

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Network Status Monitor
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Network Overview */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Network Overview
                                </Typography>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Current Block</TableCell>
                                            <TableCell>{networkStatus.blockNumber}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Gas Price</TableCell>
                                            <TableCell>{networkStatus.gasPrice.toFixed(2)} Gwei</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Network Status</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={networkStatus.nodeHealth}
                                                    color={getStatusColor(networkStatus.nodeHealth)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Pending Transactions</TableCell>
                                            <TableCell>{networkStatus.pendingTxCount}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Network Metrics */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Network Metrics
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2">Network Congestion</Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={networkStatus.networkCongestion}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: '#e0e0e0'
                                            }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2">Node Sync Status</Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={networkStatus.nodeSync}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: '#e0e0e0'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Block Time Chart */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Block Time History
                                </Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={networkStatus.blockTime}>
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="time"
                                            stroke="#8884d8"
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default NetworkStatusMonitor;