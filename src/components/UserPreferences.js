import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    Slider,
    TextField,
    Button,
    Grid,
    IconButton,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    Brightness4,
    Brightness7,
    NotificationsActive,
    Speed,
    Warning,
    Add as AddIcon,
} from '@mui/icons-material';

const UserPreferences = ({ themeService, onThemeToggle }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [settings, setSettings] = useState(themeService.alertSettings);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [newAlert, setNewAlert] = useState({ condition: '', value: '', action: '' });

    const handleSettingChange = (category, setting, value) => {
        const newSettings = {
            ...settings,
            [category]: {
                ...settings[category],
                [setting]: value,
            },
        };
        setSettings(newSettings);
        themeService.updateAlertSettings(newSettings);
    };

    const addCustomAlert = () => {
        const newSettings = {
            ...settings,
            customAlerts: [...settings.customAlerts, newAlert],
        };
        setSettings(newSettings);
        themeService.updateAlertSettings(newSettings);
        setNewAlert({ condition: '', value: '', action: '' });
    };

    const content = (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
                {/* Theme Toggle */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Appearance
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Brightness7 />
                                <Switch
                                    checked={theme.palette.mode === 'dark'}
                                    onChange={onThemeToggle}
                                />
                                <Brightness4 />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Notifications
                            </Typography>
                            <List>
                                {Object.entries(settings.notifications).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemIcon>
                                            <NotificationsActive />
                                        </ListItemIcon>
                                        <ListItemText primary={key.charAt(0).toUpperCase() + key.slice(1)} />
                                        <Switch
                                            checked={value}
                                            onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Alert Thresholds */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Alert Thresholds
                            </Typography>
                            {Object.entries(settings.alerts).map(([key, value]) => (
                                <Box key={key} sx={{ my: 2 }}>
                                    <Typography gutterBottom>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </Typography>
                                    <Slider
                                        value={value}
                                        onChange={(_, newValue) => handleSettingChange('alerts', key, newValue)}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={key === 'gasPrice' ? 500 : 10}
                                        step={key === 'gasPrice' ? 5 : 0.1}
                                    />
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Custom Alerts */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Custom Alerts
                                <IconButton size="small" onClick={() => setDrawerOpen(true)}>
                                    <AddIcon />
                                </IconButton>
                            </Typography>
                            <List>
                                {settings.customAlerts.map((alert, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <Warning />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${alert.condition} ${alert.value}`}
                                            secondary={alert.action}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Mobile Drawer for Custom Alert Creation */}
            <Drawer
                anchor={isMobile ? 'bottom' : 'right'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: isMobile ? 'auto' : 400, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Create Custom Alert
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Condition"
                                value={newAlert.condition}
                                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Value"
                                value={newAlert.value}
                                onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Action"
                                value={newAlert.action}
                                onChange={(e) => setNewAlert({ ...newAlert, action: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => {
                                    addCustomAlert();
                                    setDrawerOpen(false);
                                }}
                            >
                                Add Alert
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Drawer>
        </Box>
    );

    return isMobile ? (
        <Drawer
            anchor="bottom"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
        >
            {content}
        </Drawer>
    ) : (
        content
    );
};

export default UserPreferences; 