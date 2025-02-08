import React from 'react';
import { Typography, Grid } from '@mui/material';

const PriceDisplay = ({ priceData }) => (
    <Grid container spacing={2}>
        {Object.entries(priceData).map(([pair, price], index) => (
            <Grid item xs={12} key={index}>
                <Typography>
                    {pair}: {parseFloat(price).toFixed(4)} ETH
                </Typography>
            </Grid>
        ))}
    </Grid>
);

export default PriceDisplay; 