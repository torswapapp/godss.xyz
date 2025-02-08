import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Slider } from '@mui/material';

const GasOptimizer = () => {
    const [gasPrice, setGasPrice] = useState(50); // Default to medium speed

    const handleGasChange = (_, newValue) => {
        setGasPrice(newValue);
    };

    const getEstimatedTime = (price) => {
        if (price < 25) return '~5 mins';
        if (price < 75) return '~2 mins';
        return '~30 secs';
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Gas Optimizer</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Slider
                            value={gasPrice}
                            onChange={handleGasChange}
                            valueLabelDisplay="auto"
                            marks={[
                                { value: 0, label: 'Slow' },
                                { value: 50, label: 'Medium' },
                                { value: 100, label: 'Fast' }
                            ]}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            Estimated Time: {getEstimatedTime(gasPrice)}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}; 