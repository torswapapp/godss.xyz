import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import { PlayArrow, Stop, Launch } from '@mui/icons-material';
import ArbitrageMonitorService from '../services/ArbitrageMonitorService';

const MonitoringControls = () => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOpp, setSelectedOpp] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleUpdate = (data) => {
            switch (data.type) {
                case 'status':
                    setIsMonitoring(data.data === 'started');
                    break;
                case 'newOpportunity':
                    setOpportunities(prev => [...prev, data.data]);
                    break;
                case 'tradeResult':
                    // Handle trade result
                    break;
            }
        };

        ArbitrageMonitorService.subscribe(handleUpdate);
        return () => ArbitrageMonitorService.unsubscribe(handleUpdate);
    }, []);

    const handleStartStop = async () => {
        try {
            if (isMonitoring) {
                ArbitrageMonitorService.stopMonitoring();
            } else {
                await ArbitrageMonitorService.startMonitoring();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleExecuteTrade = async () => {
        if (!selectedOpp) return;

        try {
            setError(null);
            await ArbitrageMonitorService.executeManualTrade(selectedOpp);
            setDialogOpen(false);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Arbitrage Monitoring Controls
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    color={isMonitoring ? "error" : "success"}
                    startIcon={isMonitoring ? <Stop /> : <PlayArrow />}
                    onClick={handleStartStop}
                    sx={{ mb: 2 }}
                >
                    {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
                </Button>

                <Typography variant="subtitle1" gutterBottom>
                    Recent Opportunities
                </Typography>

                <List>
                    {opportunities.map((opp) => (
                        <ListItem key={opp.id}>
                            <ListItemText
                                primary={`Profit: ${opp.netProfit} ETH`}
                                secondary={`Path: ${opp.path.join(' -> ')}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton 
                                    edge="end" 
                                    onClick={() => {
                                        setSelectedOpp(opp);
                                        setDialogOpen(true);
                                    }}
                                >
                                    <Launch />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>Execute Trade</DialogTitle>
                    <DialogContent>
                        {selectedOpp && (
                            <>
                                <Typography>Path: {selectedOpp.path.join(' -> ')}</Typography>
                                <Typography>Expected Profit: {selectedOpp.netProfit} ETH</Typography>
                                <Typography>Gas Estimate: {selectedOpp.gasEstimate}</Typography>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleExecuteTrade} color="primary">
                            Execute Trade
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default MonitoringControls; 