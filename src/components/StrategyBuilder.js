import React from 'react';
import { 
    Card, CardContent, Typography, Grid, FormControl,
    InputLabel, Select, MenuItem, Button 
} from '@mui/material';

const StrategyBuilder = () => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Strategy Builder</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Trigger Condition</InputLabel>
                            <Select>
                                <MenuItem value="profitThreshold">Profit Threshold</MenuItem>
                                <MenuItem value="gasPrice">Gas Price Below</MenuItem>
                                <MenuItem value="slippage">Maximum Slippage</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary">
                            Save Strategy
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}; 