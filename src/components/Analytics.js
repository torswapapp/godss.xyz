import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid,
    Table, TableBody, TableCell, TableHead, TableRow,
    Tab, Tabs 
} from '@mui/material';
import { 
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer 
} from 'recharts';

const Analytics = ({ historicalService }) => {
    const [metrics, setMetrics] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const loadMetrics = async () => {
            const data = await historicalService.calculateMetrics();
            setMetrics(data);
        };
        loadMetrics();
    }, [historicalService]);

    if (!metrics) return <Typography>Loading metrics...</Typography>;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Overview" />
                    <Tab label="Profit Analysis" />
                    <Tab label="Trading Pairs" />
                    <Tab label="Time Analysis" />
                </Tabs>
            </Grid>

            {/* Overview Tab */}
            {activeTab === 0 && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Performance Summary</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={3}>
                                    <Typography color="textSecondary">Total Trades</Typography>
                                    <Typography variant="h4">{metrics.totalTrades}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography color="textSecondary">Success Rate</Typography>
                                    <Typography variant="h4">{metrics.successRate.toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography color="textSecondary">Total Profit</Typography>
                                    <Typography variant="h4">{metrics.totalProfit.toFixed(4)} ETH</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography color="textSecondary">Avg. Profit/Trade</Typography>
                                    <Typography variant="h4">{metrics.averageProfit.toFixed(4)} ETH</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            )}

            {/* Profit Analysis Tab */}
            {activeTab === 1 && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Profit Patterns</Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={metrics.profitPatterns.daily}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="profit" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            )}

            {/* Trading Pairs Tab */}
            {activeTab === 2 && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Best Performing Pairs</Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Pair</TableCell>
                                        <TableCell align="right">Total Profit</TableCell>
                                        <TableCell align="right">Success Rate</TableCell>
                                        <TableCell align="right">Trade Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(metrics.bestPerformingPairs).map(([pair, data]) => (
                                        <TableRow key={pair}>
                                            <TableCell>{pair}</TableCell>
                                            <TableCell align="right">{data.totalProfit.toFixed(4)} ETH</TableCell>
                                            <TableCell align="right">
                                                {((data.successCount / data.tradeCount) * 100).toFixed(1)}%
                                            </TableCell>
                                            <TableCell align="right">{data.tradeCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
};

export default Analytics; 