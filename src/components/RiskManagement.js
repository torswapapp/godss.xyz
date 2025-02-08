import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Slider,
    Switch,
    TextField,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

const RiskManagement = ({ riskService }) => {
    const [settings, setSettings] = useState(riskService.loadSettings());
    const [emergencyStop, setEmergencyStop] = useState(false);
    const [pendingTx, setPendingTx] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const updatePendingTransactions = () => {
            setPendingTx(Array.from(riskService.pendingTransactions.entries()));
        };
        
        const interval = setInterval(updatePendingTransactions, 1000);
        return () => clearInterval(interval);
    }, [riskService]);

    const handleSettingChange = (setting, value) => {
        const newSettings = { ...settings, [setting]: value };
        setSettings(newSettings);
        riskService.updateSettings(newSettings);
    };

    const handleEmergencyStop = async () => {
        if (emergencyStop) {
            await riskService.deactivateEmergencyStop();
        } else {
            setOpenDialog(true);
        }
        setEmergencyStop(!emergencyStop);
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Alert 
                    severity={emergencyStop ? "error" : "success"}
                    action={
                        <Switch
                            checked={emergencyStop}
                            onChange={handleEmergencyStop}
                            color="error"
                        />
                    }
                >
                    Emergency Stop {emergencyStop ? 'Active' : 'Inactive'}
                </Alert>
            </Grid>

            {/* Slippage Settings */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Slippage Protection
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Maximum allowed slippage: {settings.maxSlippage}%
                        </Typography>
                        <Slider
                            value={settings.maxSlippage}
                            onChange={(_, value) => handleSettingChange('maxSlippage', value)}
                            min={0.1}
                            max={5}
                            step={0.1}
                            marks
                            valueLabelDisplay="auto"
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Gas Price Settings */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Gas Price Limits
                        </Typography>
                        <TextField
                            label="Max Gas Price (Gwei)"
                            type="number"
                            value={settings.maxGasPrice}
                            onChange={(e) => handleSettingChange('maxGasPrice', parseFloat(e.target.value))}
                            fullWidth
                            margin="normal"
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Transaction Timeout Settings */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Transaction Timeout
                        </Typography>
                        <TextField
                            label="Timeout (seconds)"
                            type="number"
                            value={settings.transactionTimeout}
                            onChange={(e) => handleSettingChange('transactionTimeout', parseInt(e.target.value))}
                            fullWidth
                            margin="normal"
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Pending Transactions */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Pending Transactions
                        </Typography>
                        {pendingTx.map(([hash, details]) => (
                            <Alert 
                                key={hash} 
                                severity="info"
                                style={{ marginBottom: 8 }}
                            >
                                {hash.substring(0, 10)}... - 
                                Time Elapsed: {Math.floor((Date.now() - details.startTime) / 1000)}s
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            </Grid>

            {/* Emergency Stop Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Emergency Stop</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will immediately halt all trading operations. Are you sure?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={async () => {
                            await riskService.activateEmergencyStop();
                            setOpenDialog(false);
                        }} 
                        color="error"
                    >
                        Activate Emergency Stop
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default RiskManagement; 