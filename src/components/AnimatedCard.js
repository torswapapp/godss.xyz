import React from 'react';
import { Card, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedCard = ({ children, onClick, disabled }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <motion.div
            whileHover={!disabled && { scale: 1.02 }}
            whileTap={!disabled && { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
                width: '100%',
                cursor: disabled ? 'default' : 'pointer'
            }}
            onClick={!disabled && onClick}
        >
            <Card
                sx={{
                    height: '100%',
                    p: isMobile ? 1 : 2,
                    transition: 'all 0.3s ease'
                }}
            >
                {children}
            </Card>
        </motion.div>
    );
};

export default AnimatedCard; 