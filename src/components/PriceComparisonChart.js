import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceComparisonChart = ({ data }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Real-time DEX Price Comparison</Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <Line type="monotone" dataKey="uniswap" stroke="#8884d8" />
                        <Line type="monotone" dataKey="sushiswap" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="profitMargin" stroke="#ff7300" />
                        <Tooltip />
                        <Legend />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}; 