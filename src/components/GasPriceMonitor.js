import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, 
    LinearProgress, Chip, Box, Alert
} from '@mui/material';
import { formatUnits } from 'ethers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const GasPriceMonitor = ({ provider }) => {
    const [gasData, setGasData] = useState({
        safe: 0,
        standard: 0,
        fast: 0,
        rapid: 0,
        historical: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGasPrice = async () => {
            try {
                const feeData = await provider.getFeeData();
                const block = await provider.getBlock('latest');
                
                const baseGasPrice = parseFloat(formatUnits(feeData.gasPrice, 'gwei'));
                const maxFeePerGas = parseFloat(formatUnits(feeData.maxFeePerGas, 'gwei'));

                setGasData(prev => ({
                    safe: baseGasPrice,
                    standard: baseGasPrice * 1.1,
                    fast: baseGasPrice * 1.2,
                    rapid: maxFeePerGas,
                    historical: [...prev.historical, {
                        timestamp: new Date().getTime(),
                        price: baseGasPrice,
                        blockNumber: block.number
                    }].slice(-50) // Keep last 50 data points
                }));
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch gas prices');
                console.error(err);
            }
        };

        const interval = setInterval(fetchGasPrice, 12000); // Every 12 seconds
        fetchGasPrice();

        return () => clearInterval(interval);
    }, [provider]);

    const getGasLevelColor = (level) => {
        if (level < 50) return 'success';
        if (level < 100) return 'warning';
        return 'error';
    };

    if (loading) return <LinearProgress />;

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Gas Price Monitor
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={gasData.historical}>
                                <XAxis 
                                    dataKey="timestamp" 
                                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={(ts) => new Date(ts).toLocaleString()}
                                    formatter={(value) => [`${value.toFixed(2)} Gwei`, 'Gas Price']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke="#8884d8" 
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Chip 
                                label={`Safe: ${gasData.safe.toFixed(2)} Gwei`}
                                color={getGasLevelColor(gasData.safe)}
                                variant="outlined"
                            />
                            <Chip 
                                label={`Standard: ${gasData.standard.toFixed(2)} Gwei`}
                                color={getGasLevelColor(gasData.standard)}
                                variant="outlined"
                            />
                            <Chip 
                                label={`Fast: ${gasData.fast.toFixed(2)} Gwei`}
                                color={getGasLevelColor(gasData.fast)}
                                variant="outlined"
                            />
                            <Chip 
                                label={`Rapid: ${gasData.rapid.toFixed(2)} Gwei`}
                                color={getGasLevelColor(gasData.rapid)}
                                variant="outlined"
                            />
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default GasPriceMonitor; 