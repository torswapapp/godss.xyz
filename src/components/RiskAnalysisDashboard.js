import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, 
    LinearProgress, Alert, Box,
    Table, TableBody, TableCell, 
    TableHead, TableRow, Chip
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from 'recharts';
import { LineChart, Line } from 'recharts';
import { DEX_PAIRS } from '../constants/addresses';

const RiskAnalysisDashboard = ({ provider, flashLoanService }) => {
    const [riskMetrics, setRiskMetrics] = useState({
        pairs: {},
        overall: {
            liquidityRisk: 0,
            volatilityRisk: 0,
            impermanentLossRisk: 0,
            contractRisk: 0,
            overallRisk: 0
        },
        recentFailures: [],
        exposureByDex: [],
        historicalSuccess: [],
        spreadHistory: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const analyzeRisks = async () => {
            try {
                // Fetch and analyze various risk metrics
                const [liquidityData, volatilityData, contractData] = await Promise.all([
                    analyzeLiquidityRisk(),
                    analyzeVolatilityRisk(),
                    analyzeContractRisk()
                ]);

                setRiskMetrics({
                    pairs: liquidityData,
                    overall: {
                        liquidityRisk: liquidityData.liquidityRisk,
                        volatilityRisk: volatilityData.volatilityRisk,
                        impermanentLossRisk: calculateImpermanentLossRisk(),
                        contractRisk: contractData.riskScore,
                        overallRisk: calculateOverallRisk()
                    },
                    recentFailures: await getRecentFailures(),
                    exposureByDex: await getExposureByDex(),
                    historicalSuccess: await getHistoricalSuccess(),
                    spreadHistory: await getSpreadHistory()
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to analyze risks');
                console.error(err);
            }
        };

        analyzeRisks();
        const interval = setInterval(analyzeRisks, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [provider]);

    const analyzeLiquidityRisk = async () => {
        const liquidityRisks = {};
        for (const [dex, pairs] of Object.entries(DEX_PAIRS)) {
            for (const [pair, address] of Object.entries(pairs)) {
                const liquidity = await flashLoanService.checkLiquidity(address);
                liquidityRisks[`${dex}_${pair}`] = liquidity.riskScore;
            }
        }
        return liquidityRisks;
    };

    const analyzeVolatilityRisk = async () => {
        const volatilityRisks = {};
        for (const [dex, pairs] of Object.entries(DEX_PAIRS)) {
            for (const [pair, address] of Object.entries(pairs)) {
                const priceData = await provider.getPriceHistory(address);
                volatilityRisks[`${dex}_${pair}`] = calculateVolatility(priceData);
            }
        }
        return volatilityRisks;
    };

    const analyzeContractRisk = async () => {
        return { riskScore: await provider.validateContract() };
    };

    const calculateImpermanentLossRisk = () => {
        const priceChange = 10; // Example: 10% price change
        const il = (2 * Math.sqrt(1 + priceChange/100)) - (1 + priceChange/100);
        return Math.abs(il * 100);
    };

    const calculateOverallRisk = () => {
        const weights = {
            liquidity: 0.3,
            volatility: 0.25,
            impermanentLoss: 0.2,
            contract: 0.25
        };

        return (
            riskMetrics.liquidityRisk * weights.liquidity +
            riskMetrics.volatilityRisk * weights.volatility +
            riskMetrics.impermanentLossRisk * weights.impermanentLoss +
            riskMetrics.contractRisk * weights.contract
        );
    };

    const getRecentFailures = async () => {
        try {
            const failures = await flashLoanService.getFailureHistory();
            return failures.slice(-10); // Return last 10 failures
        } catch (error) {
            console.error('Error getting failures:', error);
            return [];
        }
    };

    const getExposureByDex = async () => {
        try {
            const exposures = await flashLoanService.getDexExposures();
            return exposures.map(({ dex, exposure }) => ({
                name: dex,
                value: exposure
            }));
        } catch (error) {
            console.error('Error getting DEX exposures:', error);
            return [];
        }
    };

    const getHistoricalSuccess = async () => {
        try {
            const history = await flashLoanService.getTradeHistory();
            return history.map(trade => ({
                timestamp: trade.timestamp,
                success: trade.success,
                risk: trade.riskLevel
            }));
        } catch (error) {
            console.error('Error getting historical success:', error);
            return [];
        }
    };

    const getSpreadHistory = async () => {
        try {
            const history = await flashLoanService.getSpreadHistory();
            return history.map(spread => ({
                timestamp: spread.timestamp,
                spread: spread.spread
            }));
        } catch (error) {
            console.error('Error getting spread history:', error);
            return [];
        }
    };

    const getRiskColor = (risk) => {
        if (risk < 30) return '#4caf50';
        if (risk < 70) return '#ff9800';
        return '#f44336';
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const calculateVolatility = (priceData) => {
        const returns = priceData.map((price, i) => 
            i === 0 ? 0 : (price - priceData[i-1]) / priceData[i-1]
        );
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        return Math.sqrt(variance) * 100; // Convert to percentage
    };

    const MultiPairRiskChart = ({ riskData }) => {
        const theme = useTheme();
        
        const chartData = Object.entries(riskData).map(([pair, risks]) => ({
            pair,
            liquidity: risks.liquidityRisk,
            volatility: risks.volatilityRisk,
            impermanentLoss: risks.impermanentLossRisk,
            contract: risks.contractRisk
        }));

        return (
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Risk Analysis by Pair
                    </Typography>
                    <Box height={400}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="pair" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="liquidity" fill={theme.palette.primary.main} />
                                <Bar dataKey="volatility" fill={theme.palette.secondary.main} />
                                <Bar dataKey="impermanentLoss" fill={theme.palette.warning.main} />
                                <Bar dataKey="contract" fill={theme.palette.error.main} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const SpreadAnalysisChart = ({ spreads }) => {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Price Spread Analysis
                    </Typography>
                    <Box height={300}>
                        <ResponsiveContainer>
                            <LineChart data={spreads}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="timestamp"
                                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={(ts) => new Date(ts).toLocaleString()}
                                    formatter={(value, name) => [`${value.toFixed(3)}%`, name]}
                                />
                                <Legend />
                                {Object.keys(DEX_PAIRS.UNISWAP_V2).map((pair, index) => (
                                    <Line 
                                        key={pair}
                                        type="monotone"
                                        dataKey={pair}
                                        stroke={COLORS[index % COLORS.length]}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    if (loading) return <LinearProgress />;

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Risk Analysis Dashboard
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Multi-pair Risk Chart */}
                    <Grid item xs={12}>
                        <MultiPairRiskChart riskData={riskMetrics.pairs} />
                    </Grid>

                    {/* Spread Analysis */}
                    <Grid item xs={12}>
                        <SpreadAnalysisChart spreads={riskMetrics.spreadHistory} />
                    </Grid>

                    {/* Risk Score Overview */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Overall Risk Scores
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {Object.entries(riskMetrics.overall)
                                        .filter(([key]) => key.includes('Risk'))
                                        .map(([key, value]) => (
                                            <Box key={key}>
                                                <Typography variant="body2" gutterBottom>
                                                    {key.replace('Risk', '')} Risk
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={value}
                                                    sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: getRiskColor(value)
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* DEX Exposure Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    DEX Exposure Distribution
                                </Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={riskMetrics.exposureByDex}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {riskMetrics.exposureByDex.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Failures */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Recent Issues
                                </Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Time</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Impact</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {riskMetrics.recentFailures.map((failure, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{new Date(failure.timestamp).toLocaleString()}</TableCell>
                                                <TableCell>{failure.type}</TableCell>
                                                <TableCell>{failure.description}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={failure.impact}
                                                        color={
                                                            failure.impact === 'High' ? 'error' :
                                                            failure.impact === 'Medium' ? 'warning' : 'success'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{failure.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default RiskAnalysisDashboard; 