import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const PerformanceMetricsChart = ({ data }) => {
    const formatTooltip = (value, name) => {
        switch (name) {
            case 'profit':
                return `${value.toFixed(6)} ETH`;
            case 'gasUsed':
                return `${value.toFixed(0)} gas`;
            case 'successRate':
                return `${value.toFixed(2)}%`;
            default:
                return value;
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Performance Metrics
                </Typography>

                {/* Profit/Loss Chart */}
                <Box sx={{ height: 300, mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Profit/Loss Over Time
                    </Typography>
                    <ResponsiveContainer>
                        <AreaChart data={data.profitHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="timestamp"
                                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                            />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name) => formatTooltip(value, name)}
                                labelFormatter={(ts) => new Date(ts).toLocaleString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>

                {/* Gas Usage and Success Rate Chart */}
                <Box sx={{ height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Gas Usage & Success Rate
                    </Typography>
                    <ResponsiveContainer>
                        <LineChart data={data.performanceHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="timestamp"
                                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                            />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip 
                                formatter={(value, name) => formatTooltip(value, name)}
                                labelFormatter={(ts) => new Date(ts).toLocaleString()}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="gasUsed"
                                stroke="#82ca9d"
                                dot={false}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="successRate"
                                stroke="#ffc658"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PerformanceMetricsChart;