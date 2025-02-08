import React from 'react';
import { 
    Card, CardContent, Typography, Grid, Box,
    Table, TableBody, TableCell, TableHead, TableRow,
    Chip, LinearProgress
} from '@mui/material';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

const PairAnalytics = ({ pairData, dex }) => {
    const {
        liquidityHistory,
        volumeHistory,
        priceHistory,
        riskMetrics,
        tradingStats
    } = pairData;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {dex} - Pair Analytics
                </Typography>

                <Grid container spacing={3}>
                    {/* Price and Volume Chart */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Price & Volume History
                                </Typography>
                                <Box height={300}>
                                    <ResponsiveContainer>
                                        <LineChart data={priceHistory}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="timestamp"
                                                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                            />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip 
                                                labelFormatter={(ts) => new Date(ts).toLocaleString()}
                                            />
                                            <Legend />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#8884d8"
                                                name="Price"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="volume"
                                                stroke="#82ca9d"
                                                name="Volume"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Liquidity Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Liquidity Distribution
                                </Typography>
                                <Box height={300}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={liquidityHistory}
                                                dataKey="value"
                                                nameKey="token"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label
                                            >
                                                {liquidityHistory.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Trading Statistics */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Trading Statistics
                                </Typography>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>24h Volume</TableCell>
                                            <TableCell align="right">
                                                ${tradingStats.volume24h.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Trades Count</TableCell>
                                            <TableCell align="right">
                                                {tradingStats.tradesCount}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Average Trade Size</TableCell>
                                            <TableCell align="right">
                                                ${tradingStats.avgTradeSize.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Price Impact</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={`${tradingStats.priceImpact.toFixed(2)}%`}
                                                    color={tradingStats.priceImpact > 1 ? 'warning' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Risk Metrics */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Risk Metrics
                                </Typography>
                                <Grid container spacing={2}>
                                    {Object.entries(riskMetrics).map(([key, value]) => (
                                        <Grid item xs={12} sm={6} md={3} key={key}>
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
                                                    color={value > 70 ? 'error' : value > 30 ? 'warning' : 'success'}
                                                />
                                                <Typography variant="body2">
                                                    {value}%
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default PairAnalytics;