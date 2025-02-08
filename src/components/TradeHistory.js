import React from 'react';
import { 
    Card, CardContent, Typography, Table, 
    TableBody, TableCell, TableHead, TableRow,
    Chip, Box, useTheme
} from '@mui/material';
import { formatDistance } from 'date-fns';
import { formatEther } from 'ethers';

const TradeHistory = ({ trades }) => {
    const theme = useTheme();

    const getProfitColor = (profit) => {
        const profitValue = parseFloat(profit);
        return profitValue > 0 ? theme.palette.success.main : theme.palette.error.main;
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Trade History
                </Typography>
                
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>Route</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Profit/Loss</TableCell>
                            <TableCell>Gas Used</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trades.map((trade, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {formatDistance(new Date(trade.timestamp), new Date(), { addSuffix: true })}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {trade.path.map((token, idx) => (
                                            <React.Fragment key={idx}>
                                                {idx > 0 && <Typography>→</Typography>}
                                                <Chip label={token} size="small" />
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>{formatEther(trade.amount)} ETH</TableCell>
                                <TableCell>
                                    <Typography color={getProfitColor(trade.profit)}>
                                        {formatEther(trade.profit)} ETH
                                    </Typography>
                                </TableCell>
                                <TableCell>{trade.gasUsed} gwei</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={trade.status}
                                        color={trade.status === 'Completed' ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default TradeHistory; 