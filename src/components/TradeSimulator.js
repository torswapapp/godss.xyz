import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress
} from '@mui/material';
import { TOKENS } from '../constants/tokens';

const TradeSimulator = ({ contractService, onSimulationComplete }) => {
    const [simulation, setSimulation] = useState({
        tokenIn: '',
        tokenOut: '',
        amount: '',
        slippage: '0.5',
        route: []
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            // Simulate the trade
            const simulationResult = await contractService.validateAndPrepareArbitrage({
                tokenBorrow: simulation.tokenIn,
                tokenTarget: simulation.tokenOut,
                amount: simulation.amount,
                path: simulation.route
            });

            // Calculate potential outcomes
            const outcomes = {
                bestCase: {
                    profit: (parseFloat(simulationResult.netProfit) * 1.1).toFixed(4),
                    probability: '20%'
                },
                expected: {
                    profit: simulationResult.netProfit,
                    probability: '60%'
                },
                worstCase: {
                    profit: (parseFloat(simulationResult.netProfit) * 0.9).toFixed(4),
                    probability: '20%'
                }
            };

            setResult({
                ...simulationResult,
                outcomes,
                estimatedGas: simulationResult.estimatedGas,
                priceImpact: simulationResult.priceImpact
            });
        } catch (error) {
            setResult({
                error: error.message,
                success: false
            });
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Trade Simulator</Typography>
                <Grid container spacing={3}>
                    {/* Input Fields */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Token In</InputLabel>
                            <Select
                                value={simulation.tokenIn}
                                onChange={(e) => setSimulation({
                                    ...simulation,
                                    tokenIn: e.target.value
                                })}
                            >
                                {Object.entries(TOKENS).map(([symbol, address]) => (
                                    <MenuItem key={address} value={address}>
                                        {symbol}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={simulation.amount}
                            onChange={(e) => setSimulation({
                                ...simulation,
                                amount: e.target.value
                            })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSimulate}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? <CircularProgress size={24} /> : 'Simulate Trade'}
                        </Button>
                    </Grid>

                    {/* Results */}
                    {result && (
                        <Grid item xs={12}>
                            {result.error ? (
                                <Alert severity="error">{result.error}</Alert>
                            ) : (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Alert severity="info">
                                            Expected Profit: {result.outcomes.expected.profit} ETH
                                            (Probability: {result.outcomes.expected.probability})
                                        </Alert>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>
                                            Gas Cost: {result.estimatedGas} ETH
                                        </Typography>
                                        <Typography>
                                            Price Impact: {result.priceImpact}%
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TradeSimulator; 