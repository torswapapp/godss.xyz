import MonitoringService from './MonitoringService';

class ErrorHandlingService {
    constructor() {
        this.errorTypes = {
            NETWORK: 'NETWORK_ERROR',
            CONTRACT: 'CONTRACT_ERROR',
            WALLET: 'WALLET_ERROR',
            RATE_LIMIT: 'RATE_LIMIT_ERROR',
            VALIDATION: 'VALIDATION_ERROR',
            SECURITY: 'SECURITY_ERROR'
        };
    }

    handleError(error, context) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            type: this.determineErrorType(error),
            message: error.message,
            context,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            code: error.code,
        };

        MonitoringService.logError(errorLog, context);

        if (process.env.NODE_ENV === 'development') {
            console.error('Error:', errorLog);
        }

        return this.formatErrorResponse(errorLog);
    }

    determineErrorType(error) {
        if (error.message.includes('network')) return this.errorTypes.NETWORK;
        if (error.message.includes('contract')) return this.errorTypes.CONTRACT;
        if (error.message.includes('wallet')) return this.errorTypes.WALLET;
        if (error.message.includes('rate limit')) return this.errorTypes.RATE_LIMIT;
        if (error.message.includes('validation')) return this.errorTypes.VALIDATION;
        if (error.message.includes('security')) return this.errorTypes.SECURITY;
        return 'UNKNOWN_ERROR';
    }

    async logToMonitoring(errorLog) {
        try {
            await fetch(process.env.REACT_APP_MONITORING_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_MONITORING_API_KEY}`
                },
                body: JSON.stringify(errorLog)
            });
        } catch (error) {
            console.error('Failed to log error to monitoring service:', error);
        }
    }

    formatErrorResponse(errorLog) {
        return {
            success: false,
            error: {
                type: errorLog.type,
                message: errorLog.message,
                code: errorLog.code
            }
        };
    }
}

const errorHandlingService = new ErrorHandlingService();
export default errorHandlingService; 