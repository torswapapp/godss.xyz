import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationSystem = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
        <Snackbar
            open={!!notification}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert 
                onClose={onClose} 
                severity={notification.type}
                variant="filled"
                elevation={6}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationSystem; 