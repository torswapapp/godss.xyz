import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveWrapper = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const containerStyles = {
        padding: isMobile ? theme.spacing(1) : theme.spacing(3),
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: isTablet ? '100%' : '1200px',
        margin: '0 auto'
    };

    return (
        <Box sx={containerStyles}>
            {children}
        </Box>
    );
};

export default ResponsiveWrapper; 