import React, { useState } from 'react';
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ShowChart,
    Assessment,
    Security,
    Settings
} from '@mui/icons-material';

const MobileNav = ({ onViewChange }) => {
    const [value, setValue] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!isMobile) return null;

    return (
        <Paper 
            sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} 
            elevation={3}
        >
            <BottomNavigation
                value={value}
                onChange={(_, newValue) => {
                    setValue(newValue);
                    onViewChange(newValue);
                }}
            >
                <BottomNavigationAction label="Markets" icon={<ShowChart />} />
                <BottomNavigationAction label="Analytics" icon={<Assessment />} />
                <BottomNavigationAction label="Security" icon={<Security />} />
                <BottomNavigationAction label="Settings" icon={<Settings />} />
            </BottomNavigation>
        </Paper>
    );
};

export default MobileNav; 