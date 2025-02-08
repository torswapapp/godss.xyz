import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';

const TradeExecutionDashboard = ({ currentTrade, profitHistory }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Live Trade Execution</Typography>
                {currentTrade && (
                    <Box>
                        <Typography>Status: {currentTrade.status}</Typography>
                        <LinearProgress variant="determinate" value={currentTrade.progress} />
                        <Typography>Gas Used: {currentTrade.gasUsed}</Typography>
                        <Typography>Expected Profit: {currentTrade.expectedProfit} ETH</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default TradeExecutionDashboard; 