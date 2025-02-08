import React, { useState } from 'react';
import { Grid } from '@mui/material';
import StatCard from './StatCard';
import ProfitChart from './ProfitChart';

const PortfolioDashboard = () => {
    const [stats, setStats] = useState({
        totalProfit: "1.234",
        profitChange: "+0.12",
        successRate: "87%",
        successRateChange: "+2.5",
        profitHistory: [] // Add sample data for chart
    });

    const { totalProfit, profitChange, successRate, successRateChange, profitHistory } = stats;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <StatCard
                    title="Total Profit"
                    value={totalProfit}
                    change={profitChange}
                    duration="24h"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <StatCard
                    title="Success Rate"
                    value={successRate}
                    change={successRateChange}
                    duration="24h"
                />
            </Grid>
            <Grid item xs={12}>
                <ProfitChart data={profitHistory} />
            </Grid>
        </Grid>
    );
}; 