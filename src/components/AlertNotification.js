import React, { useState, useEffect } from 'react';
import { 
    Snackbar, Alert, IconButton, 
    List, ListItem, ListItemText,
    Dialog, DialogTitle, DialogContent,
    Typography, Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import AlertService from '../services/AlertService';

const AlertNotification = () => {
    const [alerts, setAlerts] = useState([]);
    const [openAlert, setOpenAlert] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const unsubscribe = AlertService.subscribe((alert) => {
            setAlerts(prev => [...prev, alert]);
            setOpenAlert(alert);
        });

        return () => unsubscribe();
    }, []);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpenAlert(null);
    };

    const handleViewHistory = () => {
        setShowHistory(true);
    };

    return (
        <>
            <Snackbar
                open={!!openAlert}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {openAlert && (
                    <Alert
                        severity={openAlert.severity}
                        action={
                            <IconButton
                                size="small"
                                color="inherit"
                                onClick={handleClose}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        <Typography variant="subtitle2">{openAlert.title}</Typography>
                        <Typography variant="body2">{openAlert.message}</Typography>
                    </Alert>
                )}
            </Snackbar>

            <Dialog
                open={showHistory}
                onClose={() => setShowHistory(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Alert History</DialogTitle>
                <DialogContent>
                    <List>
                        {alerts.map((alert, index) => (
                            <ListItem key={index} divider>
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography color={`${alert.severity}.main`}>
                                                {alert.title}
                                            </Typography>
                                            <Typography variant="caption">
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={alert.message}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AlertNotification; 