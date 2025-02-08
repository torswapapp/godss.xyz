import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, InputAdornment, Button } from '@mui/material';

const ArbitrageSimulator = () => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Arbitrage Simulator</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Trade Amount"
                            type="number"
                            InputProps={{
                                endAdornment: <InputAdornment>ETH</InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary">
                            Calculate Potential Profit
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ArbitrageSimulator; 