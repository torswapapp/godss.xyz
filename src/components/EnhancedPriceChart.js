import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, Brush, CartesianGrid
} from 'recharts';

const EnhancedPriceChart = ({ data, tokens }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Price Comparison</Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
                        {tokens.map((token, index) => (
                            <Area 
                                type="monotone" 
                                dataKey={token.symbol} 
                                fill={token.color} 
                                stroke={token.color} 
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}; 