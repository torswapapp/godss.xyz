import React from 'react';
import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import monitoringService from '../services/MonitoringService';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        monitoringService.logError(error, {
            component: 'ErrorBoundary',
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Card>
                    <CardContent>
                        <Typography variant="h5" color="error">
                            Something went wrong
                        </Typography>
                        <Alert severity="error" sx={{ my: 2 }}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </Alert>
                        <Button 
                            variant="contained" 
                            onClick={() => window.location.reload()}
                        >
                            Reload Application
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 