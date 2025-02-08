import React from 'react';
import { Card, CardContent, Typography, Switch, TextField } from '@mui/material';

const AdvancedSettings = ({ settings, onSettingChange }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Advanced Settings</Typography>
                <TextField
                    label="Minimum Profit (ETH)"
                    type="number"
                    value={settings.minProfit}
                    onChange={(e) => onSettingChange('minProfit', parseFloat(e.target.value))}
                    margin="normal"
                    fullWidth
                />
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
                    <Typography>Auto-Execute Trades</Typography>
                    <Switch
                        checked={settings.autoExecute}
                        onChange={(e) => onSettingChange('autoExecute', e.target.checked)}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default AdvancedSettings; 