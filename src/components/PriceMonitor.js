import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Grid, 
    Table, TableBody, TableCell, TableHead, TableRow,
    Chip, Box, Alert
} from '@mui/material';
import { formatUnits } from 'ethers';

const TOKEN_ADDRESSES = {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
};

const DEX_PAIRS = {
    UNISWAP_V2: {
        WETH_USDC: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        WETH_USDT: '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852',
        WETH_DAI: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11',
        WETH_WBTC: '0xBb2b8038a1640196FbE3e38816F3e67Cba72D940'
    },
    SUSHISWAP: {
        WETH_USDC: '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0',
        WETH_USDT: '0x06da0fd433C1A5d7a4faa01111c044910A184553',
        WETH_DAI: '0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f',
        WETH_WBTC: '0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58'
    }
};

const PriceMonitor = ({ provider }) => {
    const [prices, setPrices] = useState({});
    const [spreads, setSpreads] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const monitorPrices = async () => {
            try {
                const allPairs = Object.keys(DEX_PAIRS.UNISWAP_V2);
                const priceData = {};
                const spreadData = {};

                await Promise.all(allPairs.map(async (pairKey) => {
                    const uniContract = await provider.getContract(DEX_PAIRS.UNISWAP_V2[pairKey]);
                    const sushiContract = await provider.getContract(DEX_PAIRS.SUSHISWAP[pairKey]);

                    const [uniReserves, sushiReserves] = await Promise.all([
                        uniContract.getReserves(),
                        sushiContract.getReserves()
                    ]);

                    const uniPrice = formatUnits(uniReserves[0]) / formatUnits(uniReserves[1]);
                    const sushiPrice = formatUnits(sushiReserves[0]) / formatUnits(sushiReserves[1]);

                    priceData[pairKey] = {
                        uniswap: uniPrice,
                        sushiswap: sushiPrice
                    };

                    spreadData[pairKey] = Math.abs((uniPrice - sushiPrice) / uniPrice * 100);
                }));

                setPrices(priceData);
                setSpreads(spreadData);
                setLoading(false);
            } catch (err) {
                console.error('Error monitoring prices:', err);
                setError('Failed to fetch price data');
                setLoading(false);
            }
        };

        monitorPrices();
        const interval = setInterval(monitorPrices, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [provider]);

    const getSpreadColor = (spread) => {
        if (spread < 0.1) return 'default';
        if (spread < 0.5) return 'success';
        if (spread < 1.0) return 'warning';
        return 'error';
    };

    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Price Monitor
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Pair</TableCell>
                            <TableCell>Uniswap V2</TableCell>
                            <TableCell>SushiSwap</TableCell>
                            <TableCell>Spread</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(prices).map(([pair, pairPrices]) => (
                            <TableRow key={pair}>
                                <TableCell>{pair.replace('_', '/')}</TableCell>
                                <TableCell>${pairPrices.uniswap.toFixed(6)}</TableCell>
                                <TableCell>${pairPrices.sushiswap.toFixed(6)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={`${spreads[pair].toFixed(3)}%`}
                                        color={getSpreadColor(spreads[pair])}
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

export default PriceMonitor; 