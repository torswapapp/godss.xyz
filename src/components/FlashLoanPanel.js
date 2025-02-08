import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';

const FlashLoanPanel = ({ flashLoanService, opportunity }) => {
    const [providers, setProviders] = useState([]);
    const [validation, setValidation] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateFlashLoan = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await flashLoanService.validateFlashLoanParameters(
                opportunity?.tokenBorrow,
                opportunity?.amount
            );
            setValidation(result);
        } catch (error) {
            console.error('Flash loan validation error:', error);
        }
        setLoading(false);
    }, [flashLoanService, opportunity]);

    useEffect(() => {
        setProviders(flashLoanService.getFlashLoanProviders());
    }, [flashLoanService]);

    useEffect(() => {
        if (opportunity) {
            validateFlashLoan();
        }
    }, [opportunity, validateFlashLoan]);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Flash Loan Details
                </Typography>
                
                {/* Providers Table */}
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Provider</TableCell>
                            <TableCell>Fee</TableCell>
                            <TableCell>Max Tokens</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {providers.map((provider) => (
                            <TableRow key={provider.address}>
                                <TableCell>{provider.name}</TableCell>
                                <TableCell>{provider.fee}</TableCell>
                                <TableCell>{provider.maxTokens}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={provider.active ? "Active" : "Inactive"}
                                        color={provider.active ? "success" : "error"}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Validation Results */}
                {loading ? (
                    <CircularProgress size={24} />
                ) : validation && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <Alert severity={validation.isValid ? "success" : "error"}>
                                {validation.isValid 
                                    ? `Flash loan available - Max: ${validation.maxAvailable} tokens`
                                    : "Insufficient liquidity for flash loan"
                                }
                            </Alert>
                        </Grid>
                        {validation.isValid && (
                            <Grid item xs={12}>
                                <Typography variant="body2">
                                    Flash Loan Fee: {validation.fee} tokens
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default FlashLoanPanel; 