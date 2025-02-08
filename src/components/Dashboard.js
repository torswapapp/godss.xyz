import React, { useState, useEffect, lazy } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { 
    Grid, 
    Typography, 
    Button, 
    Card,
    CardContent,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import PriceMonitorService from '../services/PriceMonitorService';
import AdvancedAnalyticsService from '../services/AdvancedAnalyticsService';
import RiskManagement from './RiskManagement';
import RiskManagementService from '../services/RiskManagementService';
import SecurityMonitor from './SecurityMonitor';
import SecurityService from '../services/SecurityService';
import ArbitrageContractService from '../services/ArbitrageContractService';
import ResponsiveWrapper from './ResponsiveWrapper';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import MobileNav from './MobileNav';
import LoadingSpinner from './LoadingSpinner';
import WebSocketService from '../services/WebSocketService';
import AnimatedCard from './AnimatedCard';
import AdvancedSettings from './AdvancedSettings';
import RealTimePriceMonitor from './RealTimePriceMonitor';
import EnhancedTradeHistory from './EnhancedTradeHistory';

const TOKEN_ADDRESSES = {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

const UNISWAP_PAIRS = {
    WETH_USDC: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'
};

const SUSHI_PAIRS = {
    WETH_USDC: '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0'
};

const AdvancedAnalytics = lazy(() => import('./AdvancedAnalytics'));
const PortfolioAnalytics = lazy(() => import('./PortfolioAnalytics'));

const Dashboard = () => {
    const [provider, setProvider] = useState(null);
    const [priceData, setPriceData] = useState({});
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsService] = useState(() => provider ? new AdvancedAnalyticsService(provider) : null);
    const [riskService] = useState(() => provider ? new RiskManagementService(provider) : null);
    const [securityService] = useState(() => provider ? new SecurityService(provider) : null);
    const [contractService] = useState(() => 
        provider ? new ArbitrageContractService(provider) : null
    );
    const [currentView, setCurrentView] = useState('markets');
    const [wsService] = useState(() => {
        const service = new WebSocketService();
        service.connect();
        return service;
    });
    const [settings, setSettings] = useState({
        minProfit: 0.01,
        autoExecute: false
    });
    const [trades, setTrades] = useState([]);
    const [portfolioData, setPortfolioData] = useState({
        trades: [],
        performance: [],
        allocation: [],
        metrics: {
            totalProfit: 0,
            successRate: 0,
            averageRoi: 0,
            bestTrade: 0,
            totalGas: 0
        }
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        console.log('Current View:', currentView);
        console.log('Loading:', loading);
        console.log('Error:', error);
        const initProvider = async () => {
            try {
                if (window.ethereum) {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const web3Provider = new BrowserProvider(window.ethereum);
                    setProvider(web3Provider);
                    setLoading(false);
                } else {
                    setError('Please install MetaMask');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Wallet error:', error.message || 'Failed to connect');
                setError('Failed to connect to wallet');
                setLoading(false);
            }
        };
        initProvider();
    }, [currentView, loading, error]);

    useEffect(() => {
        const initializeMonitoring = async () => {
            if (!provider) {
                console.log('Provider not initialized, skipping monitoring');
                setLoading(false);
                return;
            }
            try {
                const monitorService = new PriceMonitorService(provider);
                setLoading(true);

                await monitorService.monitorPair(
                    TOKEN_ADDRESSES.WETH,
                    TOKEN_ADDRESSES.USDC,
                    [
                        { name: 'Uniswap', pairAddress: UNISWAP_PAIRS.WETH_USDC },
                        { name: 'Sushiswap', pairAddress: SUSHI_PAIRS.WETH_USDC }
                    ]
                );

                // Subscribe to price updates
                monitorService.subscribe((data) => {
                    setPriceData(data);
                    const profitableOpps = monitorService.calculateArbitrageProfitability(data);
                    setOpportunities(profitableOpps);
                });

                setLoading(false);
            } catch (error) {
                console.error('Monitoring error:', error);
                setError(error.message || 'Failed to initialize price monitoring');
                setLoading(false);
            }
        };

        initializeMonitoring();
    }, [provider]);

    useEffect(() => {
        if (!wsService) {
            console.log('WebSocket service not initialized');
            return;
        }

        const priceUpdateHandler = (data) => {
            setPriceData(prev => ({...prev, ...data.prices}));
        };

        const opportunityHandler = (data) => {
            setOpportunities(prev => [...prev, data.opportunity]);
        };

        const tradeHandler = (data) => {
            updateProfitHistory(data.profit);
        };

        const errorHandler = (data) => {
            setError(data.error);
        };

        wsService.subscribe('PRICE_UPDATE', priceUpdateHandler);
        wsService.subscribe('NEW_OPPORTUNITY', opportunityHandler);
        wsService.subscribe('TRADE_EXECUTED', tradeHandler);
        wsService.subscribe('error', errorHandler);

        return () => {
            wsService.unsubscribe('PRICE_UPDATE', priceUpdateHandler);
            wsService.unsubscribe('NEW_OPPORTUNITY', opportunityHandler);
            wsService.unsubscribe('TRADE_EXECUTED', tradeHandler);
            wsService.unsubscribe('error', errorHandler);
            wsService.disconnect();
        };
    }, [wsService]);

    const executeArbitrage = async (opportunity) => {
        try {
            setLoading(true);
            const tx = await contractService.executeArbitrage(
                opportunity.amount,
                opportunity.path,
                opportunity.data
            );
            
            // Update UI after successful execution
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'ArbitrageExecuted');
            if (event) {
                const profit = formatEther(event.args.profit);
                updateProfitHistory(profit);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfitHistory = (profit) => {
        setTrades(prev => [...prev, {
            timestamp: new Date().toISOString(),
            profit
        }]);
    };

    const handleOpportunitySelect = async (opp) => {
        setSelectedOpportunity(opp);
        // Validate with contract service
        const validatedOpp = await contractService.validateAndPrepareArbitrage(opp);
        if (validatedOpp.isViable) {
            setSelectedOpportunity(validatedOpp);
        } else {
            setError('Opportunity not viable after flash loan fees');
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const renderCurrentView = () => {
        switch(currentView) {
            case 'markets':
                return (
                    <>
                        <Grid item xs={12} md={6}>
                            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
                                <AnimatedCard>
                                    <Typography variant="h6">Real-time Prices</Typography>
                                    {loading ? (
                                        <LoadingSpinner message="Loading market data..." />
                                    ) : (
                                        <div>
                                            {Object.entries(priceData).map(([pair, price], index) => (
                                                <Typography key={index}>
                                                    {pair}: {price} ETH
                                                </Typography>
                                            ))}
                                        </div>
                                    )}
                                </AnimatedCard>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <AnimatedCard>
                                <Typography variant="h6">Opportunities</Typography>
                                {opportunities.map((opp, index) => (
                                    <Card key={index} sx={{ mb: 1 }} onClick={() => handleOpportunitySelect(opp)}>
                                        <CardContent>
                                            <Typography>
                                                Profit: {opp.profit} ETH
                                                Route: {opp.route.join(' -> ')}
                                            </Typography>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => executeArbitrage(opp)}
                                                disabled={loading}
                                            >
                                                Execute Trade
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </AnimatedCard>
                        </Grid>
                    </>
                );
            case 'analytics':
                return (
                    <>
                        <Grid item xs={12}>
                            <PortfolioAnalytics portfolioData={portfolioData} />
                        </Grid>
                        <Grid item xs={12}>
                            <AdvancedAnalytics analyticsService={analyticsService} />
                        </Grid>
                    </>
                );
            case 'security':
                return (
                    <>
                        <Grid item xs={12}>
                            <SecurityMonitor securityService={securityService} />
                        </Grid>
                        <Grid item xs={12}>
                            <RiskManagement riskService={riskService} />
                        </Grid>
                    </>
                );
            case 'settings':
                return (
                    <Grid item xs={12}>
                        <AdvancedSettings 
                            settings={settings}
                            onSettingChange={handleSettingChange}
                        />
                    </Grid>
                );
            default:
                return null;
        }
    };

    return (
        <ResponsiveWrapper>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <LazyMotion features={domAnimation}>
                    <>
                        <Typography variant="h4" gutterBottom>
                            Dashboard
                        </Typography>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <RealTimePriceMonitor wsService={wsService} />
                            </Grid>
                            <Grid item xs={12}>
                                <EnhancedTradeHistory trades={trades} />
                            </Grid>
                            {renderCurrentView()}
                        </Grid>

                        {/* Mobile Navigation */}
                        <MobileNav onViewChange={setCurrentView} />
                    </>
                </LazyMotion>
            )}
        </ResponsiveWrapper>
    );
};

export default Dashboard;