import { formatEther } from 'ethers';
import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, 
    Table, TableBody, TableCell, TableHead, TableRow,
    CircularProgress, Tooltip, IconButton
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts';

const TOKEN0 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
const TOKEN1 = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
const PAIR_ADDRESS = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'; // WETH-USDC pair

const AdvancedAnalytics = ({ analyticsService }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [correlation, volatility, liquidity, gasData] = await Promise.all([
                    analyticsService.analyzePriceCorrelation(TOKEN0, TOKEN1),
                    analyticsService.monitorVolatility(TOKEN0),
                    analyticsService.analyzeLiquidityDepth(PAIR_ADDRESS),
                    analyticsService.optimizeGas()
                ]);

                setData({ correlation, volatility, liquidity, gasData });
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [analyticsService]);

    if (loading) return <CircularProgress />;

    return (
        <Grid container spacing={3}>
            {/* Price Correlation Analysis */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Price Correlation Analysis
                            <Tooltip title="Measures the statistical relationship between token prices">
                                <IconButton size="small">
                                    <InfoOutlined />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <ScatterChart width={400} height={300}>
                            <CartesianGrid />
                            <XAxis dataKey="price1" name="Token 1 Price" />
                            <YAxis dataKey="price2" name="Token 2 Price" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter data={data.correlation.priceRatio} fill="#8884d8" />
                        </ScatterChart>
                        <Typography>
                            Correlation Coefficient: {data.correlation.correlation.toFixed(3)}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Volatility Monitoring */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Volatility Analysis
                        </Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timeframe</TableCell>
                                    <TableCell>Volatility</TableCell>
                                    <TableCell>Risk Level</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(data.volatility).map(([timeframe, value]) => (
                                    <TableRow key={timeframe}>
                                        <TableCell>{timeframe}</TableCell>
                                        <TableCell>{(value * 100).toFixed(2)}%</TableCell>
                                        <TableCell>{getRiskLevel(value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Grid>

            {/* Liquidity Depth */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Liquidity Analysis
                        </Typography>
                        <Typography variant="body1">
                            Liquidity Score: {data.liquidity.liquidityScore}/100
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                            Slippage Impact
                        </Typography>
                        <Table>
                            <TableBody>
                                {Object.entries(data.liquidity.slippageImpact).map(([size, impact]) => (
                                    <TableRow key={size}>
                                        <TableCell>{size} Trade</TableCell>
                                        <TableCell>{impact.toFixed(2)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Grid>

            {/* Gas Optimization */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Gas Optimization
                        </Typography>
                        <Typography variant="subtitle1">
                            Recommended Gas Prices (Gwei)
                        </Typography>
                        <Table>
                            <TableBody>
                                {Object.entries(data.gasData.recommendedGasPrice).map(([speed, price]) => (
                                    <TableRow key={speed}>
                                        <TableCell>{speed}</TableCell>
                                        <TableCell>{formatEther(price)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Typography variant="body2" color="textSecondary">
                            Best Time to Execute: {data.gasData.bestTimeToExecute}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

const getRiskLevel = (volatility) => {
    if (volatility < 0.01) return 'Low';
    if (volatility < 0.05) return 'Medium';
    return 'High';
};

export default AdvancedAnalytics; 