import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { formatEther } from 'ethers';
import { motion } from 'framer-motion';

const PriceDisplay = ({ pair, price, change }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <Box p={2} bgcolor="background.paper" borderRadius={1}>
            <Typography variant="h6">{pair}</Typography>
            <Typography 
                variant="h4" 
                color={change >= 0 ? 'success.main' : 'error.main'}
            >
                {formatEther(price)}
            </Typography>
            <Typography 
                variant="body2" 
                color={change >= 0 ? 'success.main' : 'error.main'}
            >
                {change}%
            </Typography>
        </Box>
    </motion.div>
);

const RealTimePriceMonitor = ({ wsService }) => {
    const [prices, setPrices] = useState({});
    const [changes, setChanges] = useState({});

    useEffect(() => {
        const handlePriceUpdate = (data) => {
            setPrices(prev => {
                const newPrices = { ...prev, ...data.prices };
                // Calculate price changes
                const newChanges = {};
                Object.keys(data.prices).forEach(pair => {
                    const oldPrice = prev[pair] || data.prices[pair];
                    const change = ((data.prices[pair] - oldPrice) / oldPrice) * 100;
                    newChanges[pair] = change.toFixed(2);
                });
                setChanges(newChanges);
                return newPrices;
            });
        };

        wsService.subscribe('PRICE_UPDATE', handlePriceUpdate);
        return () => wsService.unsubscribe('PRICE_UPDATE', handlePriceUpdate);
    }, [wsService]);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Real-time Prices</Typography>
                <Grid container spacing={2}>
                    {Object.entries(prices).map(([pair, price]) => (
                        <Grid item xs={12} sm={6} md={4} key={pair}>
                            <PriceDisplay
                                pair={pair}
                                price={price}
                                change={changes[pair]}
                            />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default React.memo(RealTimePriceMonitor); 