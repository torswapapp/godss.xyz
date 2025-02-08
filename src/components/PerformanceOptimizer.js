import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, Typography, Grid,
    Slider, Switch, FormControlLabel,
    Divider, Alert, Button,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { formatUnits } from 'ethers';

const PerformanceOptimizer = ({ provider, flashLoanService }) => {
    const [settings, setSettings] = useState({
        maxGasPrice: 100,
        minProfitThreshold: 0.1,
        slippageTolerance: 0.5,
        autoExecute: false,
        useFlashBots: true,
        priorityGas: false
    });

    const [metrics, setMetrics] = useState({
        averageExecutionTime: 0,
        successRate: 0,
        failedTransactions: 0,
        gasOptimization: 0
    });

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const optimizePerformance = async () => {
        // Implement optimization logic
        const gasPrice = await provider.getGasPrice();
        const baseFee = formatUnits(gasPrice, 'gwei');
        
        // Calculate optimal gas settings
        const optimalGas = Math.min(
            settings.maxGasPrice,
            Math.max(baseFee * 1.1, 30) // At least 10% above base fee
        );

        updateSetting('maxGasPrice', optimalGas);
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Performance Optimizer
                </Typography>

                <Grid container spacing={3}>
                    {/* Gas Price Settings */}
                    <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                            Max Gas Price (Gwei): {settings.maxGasPrice}
                        </Typography>
                        <Slider
                            value={settings.maxGasPrice}
                            onChange={(_, value) => updateSetting('maxGasPrice', value)}
                            min={20}
                            max={200}
                            step={1}
                            marks={[
                                { value: 20, label: '20' },
                                { value: 100, label: '100' },
                                { value: 200, label: '200' }
                            ]}
                        />
                    </Grid>

                    {/* Profit Threshold */}
                    <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                            Min Profit Threshold (ETH): {settings.minProfitThreshold}
                        </Typography>
                        <Slider
                            value={settings.minProfitThreshold}
                            onChange={(_, value) => updateSetting('minProfitThreshold', value)}
                            min={0.01}
                            max={1}
                            step={0.01}
                            marks={[
                                { value: 0.01, label: '0.01' },
                                { value: 0.5, label: '0.5' },
                                { value: 1, label: '1.0' }
                            ]}
                        />
                    </Grid>

                    {/* Advanced Settings */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.autoExecute}
                                            onChange={(e) => updateSetting('autoExecute', e.target.checked)}
                                        />
                                    }
                                    label="Auto-Execute Trades"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.useFlashBots}
                                            onChange={(e) => updateSetting('useFlashBots', e.target.checked)}
                                        />
                                    }
                                    label="Use Flashbots"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.priorityGas}
                                            onChange={(e) => updateSetting('priorityGas', e.target.checked)}
                                        />
                                    }
                                    label="Priority Gas"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Performance Metrics */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Performance Metrics
                        </Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Metric</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Average Execution Time</TableCell>
                                    <TableCell>{metrics.averageExecutionTime}ms</TableCell>
                                    <TableCell>
                                        <Alert 
                                            severity={metrics.averageExecutionTime < 1000 ? "success" : "warning"}
                                            sx={{ py: 0 }}
                                        >
                                            {metrics.averageExecutionTime < 1000 ? "Optimal" : "Needs Optimization"}
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Success Rate</TableCell>
                                    <TableCell>{metrics.successRate}%</TableCell>
                                    <TableCell>
                                        <Alert 
                                            severity={metrics.successRate > 90 ? "success" : "warning"}
                                            sx={{ py: 0 }}
                                        >
                                            {metrics.successRate > 90 ? "Good" : "Needs Improvement"}
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>

                    {/* Optimization Button */}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={optimizePerformance}
                            fullWidth
                        >
                            Optimize Performance
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default PerformanceOptimizer; 