import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Autocomplete, 
    TextField, Grid, CircularProgress, Avatar 
} from '@mui/material';

const TokenSelector = ({ onPairSelect, provider }) => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBase, setSelectedBase] = useState(null);
    const [selectedQuote, setSelectedQuote] = useState(null);

    useEffect(() => {
        const fetchPopularTokens = async () => {
            try {
                // Fetch token list from a reliable source
                const response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
                const data = await response.json();
                
                // Filter for tokens with good liquidity
                const popularTokens = data.tokens.filter(token => 
                    token.chainId === 1 && // Ethereum mainnet
                    parseFloat(token.totalLiquidity) > 1000000 // Minimum liquidity threshold
                );
                
                setTokens(popularTokens);
            } catch (error) {
                console.error('Error fetching tokens:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularTokens();
    }, []);

    const handleBaseChange = (event, newValue) => {
        setSelectedBase(newValue);
        if (newValue && selectedQuote) {
            onPairSelect({
                base: newValue,
                quote: selectedQuote
            });
        }
    };

    const handleQuoteChange = (event, newValue) => {
        setSelectedQuote(newValue);
        if (newValue && selectedBase) {
            onPairSelect({
                base: selectedBase,
                quote: newValue
            });
        }
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Select Trading Pair
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={tokens}
                            getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
                            loading={loading}
                            value={selectedBase}
                            onChange={handleBaseChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Base Token"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading ? <CircularProgress size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item>
                                            <Avatar
                                                src={option.logoURI}
                                                alt={option.symbol}
                                                sx={{ width: 24, height: 24 }}
                                            />
                                        </Grid>
                                        <Grid item>
                                            {option.symbol} - {option.name}
                                        </Grid>
                                    </Grid>
                                </li>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={tokens}
                            getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
                            loading={loading}
                            value={selectedQuote}
                            onChange={handleQuoteChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Quote Token"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading ? <CircularProgress size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item>
                                            <Avatar
                                                src={option.logoURI}
                                                alt={option.symbol}
                                                sx={{ width: 24, height: 24 }}
                                            />
                                        </Grid>
                                        <Grid item>
                                            {option.symbol} - {option.name}
                                        </Grid>
                                    </Grid>
                                </li>
                            )}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TokenSelector; 