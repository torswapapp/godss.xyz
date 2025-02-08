import { formatEther } from 'ethers';
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Security,
    Warning,
    CheckCircle,
    Error as ErrorIcon
} from '@mui/icons-material';

const SecurityMonitor = ({ securityService }) => {
    const [securityLogs, setSecurityLogs] = useState([]);
    const [connectedWallets, setConnectedWallets] = useState([]);
    const [settings] = useState(securityService.loadSecuritySettings());
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [pendingTransaction, setPendingTransaction] = useState(null);

    useEffect(() => {
        const updateSecurityStatus = () => {
            setSecurityLogs(securityService.errorLogs);
            setConnectedWallets(Array.from(securityService.connectedWallets));
        };

        updateSecurityStatus();
        const interval = setInterval(updateSecurityStatus, 5000);
        return () => clearInterval(interval);
    }, [securityService]);

    const handleTransactionConfirmation = async (confirmed) => {
        setOpenConfirmDialog(false);
        if (confirmed && pendingTransaction) {
            try {
                await securityService.validateAndQueueTransaction(pendingTransaction);
            } catch (error) {
                console.error('Transaction validation failed:', error);
            }
        }
        setPendingTransaction(null);
    };

    const handleDisconnectWallet = async (wallet) => {
        try {
            securityService.connectedWallets.delete(wallet);
            setConnectedWallets(Array.from(securityService.connectedWallets));
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    };

    return (
        <Grid container spacing={3}>
            {/* Security Status Overview */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Security Status
                            <Security color="primary" style={{ marginLeft: 8 }} />
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Alert severity="info">
                                    Connected Wallets: {connectedWallets.length}
                                </Alert>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Alert severity="warning">
                                    Rate Limit: {settings.maxTransactionsPerMinute} tx/min
                                </Alert>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Alert severity="success">
                                    Security Score: {calculateSecurityScore(settings)}%
                                </Alert>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Recent Security Events */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Recent Security Events
                        </Typography>
                        <List>
                            {securityLogs.slice(-5).map((log, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        {getSecurityEventIcon(log.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={log.type}
                                        secondary={new Date(log.timestamp).toLocaleString()}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* Connected Wallets */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Connected Wallets
                        </Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {connectedWallets.map((wallet) => (
                                    <TableRow key={wallet}>
                                        <TableCell>{wallet.substring(0, 10)}...</TableCell>
                                        <TableCell>
                                            <CheckCircle color="success" />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                color="secondary"
                                                onClick={() => handleDisconnectWallet(wallet)}
                                            >
                                                Disconnect
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Grid>

            {/* Transaction Confirmation Dialog */}
            <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
                <DialogTitle>Confirm Transaction</DialogTitle>
                <DialogContent>
                    <Typography>
                        Please review the transaction details carefully:
                    </Typography>
                    {pendingTransaction && (
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="To"
                                    secondary={pendingTransaction.to}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Value"
                                    secondary={`${formatEther(pendingTransaction.value)} ETH`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Gas Limit"
                                    secondary={pendingTransaction.gasLimit.toString()}
                                />
                            </ListItem>
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleTransactionConfirmation(false)} color="error">
                        Reject
                    </Button>
                    <Button onClick={() => handleTransactionConfirmation(true)} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

const calculateSecurityScore = (settings) => {
    let score = 100;
    if (settings.maxTransactionsPerMinute > 10) score -= 20;
    if (settings.requiredConfirmations < 2) score -= 15;
    if (settings.autoLockTimeout > 30) score -= 10;
    if (!settings.whitelistedAddresses.length) score -= 5;
    return Math.max(0, score);
};

const getSecurityEventIcon = (eventType) => {
    switch (eventType) {
        case 'suspicious_activity':
            return <Warning color="error" />;
        case 'wallet_connected':
            return <CheckCircle color="success" />;
        case 'transaction_failed':
            return <ErrorIcon color="error" />;
        default:
            return <Security color="primary" />;
    }
};

export default SecurityMonitor; 