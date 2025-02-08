import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, TextField, 
    InputAdornment, Button, Alert, CircularProgress,
    Tooltip, Slider, Chip
} from '@mui/material';
import { formatEther, parseEther } from 'ethers';

const TOKEN_ADDRESSES = {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
};

const DEX_PAIRS = {
    UNISWAP_V2: {
        WETH_USDC: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        WETH_USDT: '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852',
        WETH_DAI: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11',
        WETH_WBTC: '0xBb2b8038a1640196FbE3e38816F3e67Cba72D940'
    },
    SUSHISWAP: {
        WETH_USDC: '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0',
        WETH_USDT: '0x06da0fd433C1A5d7a4faa01111c044910A184553',
        WETH_DAI: '0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f',
        WETH_WBTC: '0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58'
    }
};

const ArbitrageSimulator = ({ onExecute, provider }) => {
    const [tradeAmount, setTradeAmount] = useState('1');
    const [estimatedProfit, setEstimatedProfit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gasPrice, setGasPrice] = useState('50');
    const [slippage, setSlippage] = useState(0.5);
    const [opportunities, setOpportunities] = useState([]);
    const [autoExecute, setAutoExecute] = useState(false);

    const setupPriceFeeds = async () => {
        try {
            const feeds = {};
            for (const [dex, pairs] of Object.entries(DEX_PAIRS)) {
                feeds[dex] = {};
                for (const [pair, address] of Object.entries(pairs)) {
                    feeds[dex][pair] = await provider.getContract(address);
                }
            }
            return feeds;
        } catch (error) {
            console.error('Error setting up price feeds:', error);
            throw error;
        }
    };

    useEffect(() => {
        const monitorOpportunities = async () => {
            try {
                // Monitor DEX prices in real-time
                const priceFeeds = await setupPriceFeeds();
                // Calculate potential arbitrage opportunities
                const profitableRoutes = await calculateProfitableRoutes(priceFeeds);
                setOpportunities(profitableRoutes);

                if (autoExecute) {
                    // Auto-execute if profit exceeds threshold
                    const bestOpportunity = profitableRoutes[0];
                    if (bestOpportunity?.expectedProfit > parseFloat(process.env.REACT_APP_MIN_PROFIT_THRESHOLD)) {
                        await executeArbitrage(bestOpportunity);
                    }
                }
            } catch (error) {
                console.error('Monitoring error:', error);
                setError('Error monitoring opportunities');
            }
        };

        const interval = setInterval(monitorOpportunities, 1000);
        return () => clearInterval(interval);
    }, [autoExecute, provider]);

    const calculateProfitableRoutes = async (priceFeeds) => {
        // Implementation of arbitrage calculation logic
        // Compare prices across DEXes and find profitable routes
        // Consider gas costs and slippage
        // Return sorted array of opportunities
    };

    const executeArbitrage = async (opportunity) => {
        setLoading(true);
        try {
            const tx = await onExecute({
                amount: parseEther(tradeAmount),
                path: opportunity.path,
                expectedProfit: opportunity.expectedProfit,
                maxSlippage: slippage,
                gasPrice: parseEther(gasPrice).toString()
            });
            await tx.wait();
            // Update UI with success
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Arbitrage Simulator
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Trade Amount"
                            type="number"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                            }}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                            Slippage Tolerance
                        </Typography>
                        <Slider
                            value={slippage}
                            onChange={(e, value) => setSlippage(value)}
                            step={0.1}
                            marks
                            min={0.1}
                            max={3}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}%`}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Current Opportunities
                        </Typography>
                        {opportunities.map((opp, index) => (
                            <Card key={index} sx={{ mb: 1, p: 2 }}>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="subtitle1">
                                            Expected Profit: {formatEther(opp.expectedProfit)} ETH
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Chip 
                                            label={`Route: ${opp.path.join(' → ')}`}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Button
                                            variant="contained"
                                            onClick={() => executeArbitrage(opp)}
                                            disabled={loading}
                                            fullWidth
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'Execute Trade'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Card>
                        ))}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ArbitrageSimulator; 