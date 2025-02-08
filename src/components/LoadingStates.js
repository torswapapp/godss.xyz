import React from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';

export const LoadingSpinner = ({ message }) => (
    <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={24} />
        <Typography>{message}</Typography>
    </Box>
); 