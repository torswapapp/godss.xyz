import React from 'react';
import { 
    Card, CardContent, Typography, Grid, Box,
    Table, TableBody, TableCell, TableHead, TableRow,
    Chip, LinearProgress, Tooltip
} from '@mui/material';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    Legend, ResponsiveContainer, Cell, Area, AreaChart,
    ScatterChart, Scatter, ZAxis
} from 'recharts';

const PairAnalyticsExtended = ({ pairData, dex }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const VolumeDepthChart = ({ data }) => (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                    Volume Depth Analysis
                </Typography>
                <Box height={300}>
                    <ResponsiveContainer>
                        <AreaChart data={data.volumeDepth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="price" />
                            <YAxis />
                            <RechartsTooltip />
                            <Area
                                type="monotone"
                                dataKey="buyVolume"
                                stackId="1"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.6}
                            />
                            <Area
                                type="monotone"
                                dataKey="sellVolume"
                                stackId="1"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );

    const PriceCorrelationChart = ({ data }) => (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                    Price Correlation Analysis
                </Typography>
                <Box height={300}>
                    <ResponsiveContainer>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" name="Price Change" />
                            <YAxis dataKey="y" name="Volume" />
                            <ZAxis dataKey="z" range={[50, 500]} name="Market Impact" />
                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter
                                name="Price-Volume Correlation"
                                data={data.correlation}
                                fill="#8884d8"
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );

    const LiquidityMetricsTable = ({ metrics }) => (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                    Advanced Liquidity Metrics
                </Typography>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Tooltip title="Measure of how easily large trades can be executed">
                                    <Typography>Market Depth</Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                                <Chip
                                    label={`${metrics.marketDepth.toFixed(2)}%`}
                                    color={metrics.marketDepth > 70 ? 'success' : 'warning'}
                                    size="small"
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Tooltip title="Average time between trades">
                                    <Typography>Trading Frequency</Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                                {metrics.tradingFrequency} trades/min
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Tooltip title="Percentage of successful trades">
                                    <Typography>Execution Success Rate</Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                                {metrics.executionSuccess}%
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Tooltip title="Average price impact for $10k trade">
                                    <Typography>Price Impact</Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                                {metrics.priceImpact.toFixed(3)}%
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const EfficiencyMetrics = ({ data }) => (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                    Pool Efficiency Metrics
                </Typography>
                <Grid container spacing={2}>
                    {Object.entries(data.efficiency).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={value}
                                        sx={{ 
                                            flexGrow: 1,
                                            height: 8,
                                            borderRadius: 4
                                        }}
                                        color={value > 70 ? 'success' : value > 30 ? 'warning' : 'error'}
                                    />
                                    <Typography variant="body2">
                                        {value.toFixed(1)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <VolumeDepthChart data={pairData} />
            </Grid>
            <Grid item xs={12} md={6}>
                <PriceCorrelationChart data={pairData} />
            </Grid>
            <Grid item xs={12} md={6}>
                <LiquidityMetricsTable metrics={pairData.liquidityMetrics} />
            </Grid>
            <Grid item xs={12} md={6}>
                <EfficiencyMetrics data={pairData} />
            </Grid>
        </Grid>
    );
};

export default PairAnalyticsExtended;