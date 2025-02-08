import React from 'react';
import { 
    Card, CardContent, Typography, Grid, Box,
    useTheme
} from '@mui/material';
import {
    RadarChart, PolarGrid, PolarAngleAxis, 
    PolarRadiusAxis, Radar, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid
} from 'recharts';

const RiskMetricsVisualization = ({ riskData, historicalRisk }) => {
    const theme = useTheme();

    const radarData = [
        { metric: 'Liquidity', value: riskData.liquidityRisk },
        { metric: 'Volatility', value: riskData.volatilityRisk },
        { metric: 'Impermanent Loss', value: riskData.impermanentLossRisk },
        { metric: 'Contract', value: riskData.contractRisk },
        { metric: 'Overall', value: riskData.overallRisk }
    ];

    return (
        <Grid container spacing={3}>
            {/* Radar Chart for Risk Metrics */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Risk Metrics Overview
                        </Typography>
                        <Box sx={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Risk Level"
                                        dataKey="value"
                                        stroke={theme.palette.primary.main}
                                        fill={theme.palette.primary.main}
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Historical Risk Trend */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Risk Trend Analysis
                        </Typography>
                        <Box sx={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={historicalRisk}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="timestamp"
                                        tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                                    />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                        labelFormatter={(ts) => new Date(ts).toLocaleString()}
                                        formatter={(value) => [`${value}%`, 'Risk Level']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="risk"
                                        stroke={theme.palette.primary.main}
                                        fill={theme.palette.primary.light}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default RiskMetricsVisualization; 