import React from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box p={3}>
                    <Alert severity="error">
                        <Typography variant="h6">Something went wrong</Typography>
                        <Typography>{this.state.error.message}</Typography>
                        <Button 
                            onClick={() => window.location.reload()}
                            variant="contained"
                            sx={{ mt: 2 }}
                        >
                            Reload Page
                        </Button>
                    </Alert>
                </Box>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary; 