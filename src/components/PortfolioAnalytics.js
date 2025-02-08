import React from 'react';
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AnimatedCard from './AnimatedCard';
import ResponsiveChart from './ResponsiveChart';

const PortfolioAnalytics = ({ portfolioData }) => {
    const { trades, performance, allocation, metrics } = portfolioData;

    return (
        <Grid container spacing={3}>
            {/* Performance Metrics */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Key Metrics</Typography>
                        <Box mt={2}>
                            <Typography>Total Profit: {metrics.totalProfit} ETH</Typography>
                            <Typography>Success Rate: {metrics.successRate}%</Typography>
                            <Typography>Average ROI: {metrics.averageRoi}%</Typography>
                            <Typography>Best Trade: {metrics.bestTrade} ETH</Typography>
                            <Typography>Total Gas Used: {metrics.totalGas} ETH</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Asset Allocation */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Asset Allocation</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={allocation}
                                    dataKey="value"
                                    nameKey="token"
                                    cx="50%"
                                    cy="50%"
                                    fill="#8884d8"
                                />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* Performance Chart */}
            <Grid item xs={12}>
                <AnimatedCard>
                    <Typography variant="h6">Performance</Typography>
                    <ResponsiveChart>
                        <LineChart data={performance}>
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveChart>
                </AnimatedCard>
            </Grid>
        </Grid>
    );
};

export default PortfolioAnalytics; 