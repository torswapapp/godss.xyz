import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, 
    TextField, Button, Alert, Divider,
    InputAdornment, Slider, Box
} from '@mui/material';
import { formatEther, parseEther } from 'ethers';

const ProfitCalculator = ({ provider, flashLoanService }) => {
    const [input, setInput] = useState({
        amount: '1',
        gasPrice: '50',
        slippage: 0.5,
        expectedPrice: '0',
        targetPrice: '0'
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateProfit = async () => {
        setLoading(true);
        setError(null);
        try {
            // Calculate flash loan fee
            const flashLoanFee = await flashLoanService.calculateFlashLoanFee(
                parseFloat(input.amount)
            );

            // Calculate gas cost
            const gasLimit = 500000; // Estimated gas limit
            const gasCost = (parseFloat(input.gasPrice) * gasLimit) / 1e9;

            // Calculate potential profit
            const tradingAmount = parseFloat(input.amount);
            const expectedReturn = tradingAmount * (parseFloat(input.targetPrice) / parseFloat(input.expectedPrice));
            const slippageImpact = expectedReturn * (input.slippage / 100);
            const grossProfit = expectedReturn - tradingAmount;
            const netProfit = grossProfit - parseFloat(formatEther(flashLoanFee)) - gasCost;

            setResults({
                flashLoanFee: formatEther(flashLoanFee),
                gasCost,
                grossProfit,
                netProfit,
                roi: (netProfit / tradingAmount) * 100,
                isViable: netProfit > 0
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Profit Calculator
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Trade Amount"
                            type="number"
                            value={input.amount}
                            onChange={(e) => setInput(prev => ({ ...prev, amount: e.target.value }))}
                            fullWidth
                            InputProps={{
                                endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Gas Price"
                            type="number"
                            value={input.gasPrice}
                            onChange={(e) => setInput(prev => ({ ...prev, gasPrice: e.target.value }))}
                            fullWidth
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Gwei</InputAdornment>
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography gutterBottom>Slippage Tolerance: {input.slippage}%</Typography>
                        <Slider
                            value={input.slippage}
                            onChange={(e, value) => setInput(prev => ({ ...prev, slippage: value }))}
                            step={0.1}
                            min={0.1}
                            max={3}
                            valueLabelDisplay="auto"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Expected Price"
                            type="number"
                            value={input.expectedPrice}
                            onChange={(e) => setInput(prev => ({ ...prev, expectedPrice: e.target.value }))}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Target Price"
                            type="number"
                            value={input.targetPrice}
                            onChange={(e) => setInput(prev => ({ ...prev, targetPrice: e.target.value }))}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button 
                            variant="contained" 
                            onClick={calculateProfit}
                            disabled={loading}
                            fullWidth
                        >
                            Calculate Potential Profit
                        </Button>
                    </Grid>

                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}

                    {results && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>Results</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography>Flash Loan Fee: {results.flashLoanFee} ETH</Typography>
                                <Typography>Gas Cost: {results.gasCost.toFixed(6)} ETH</Typography>
                                <Typography>Gross Profit: {results.grossProfit.toFixed(6)} ETH</Typography>
                                <Typography color={results.isViable ? 'success.main' : 'error.main'}>
                                    Net Profit: {results.netProfit.toFixed(6)} ETH
                                </Typography>
                                <Typography>ROI: {results.roi.toFixed(2)}%</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ProfitCalculator;