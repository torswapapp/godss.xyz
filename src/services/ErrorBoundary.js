import React from 'react';
import * as Sentry from '@sentry/react';

class ProductionErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        Sentry.captureException(error, { extra: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. Please refresh the page.</h1>;
        }
        return this.props.children;
    }
} 