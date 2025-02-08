import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { ResponsiveContainer } from 'recharts';

const ResponsiveChart = ({ children, desktopHeight = 400, mobileHeight = 300 }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <ResponsiveContainer
            width="100%"
            height={isMobile ? mobileHeight : desktopHeight}
        >
            {children}
        </ResponsiveContainer>
    );
};

export default ResponsiveChart; 