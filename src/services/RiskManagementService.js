import { formatUnits } from 'ethers';

class RiskManagementService {
    constructor(provider) {
        this.provider = provider;
        this.settings = this.loadSettings();
        this.isEmergencyStopped = false;
        this.pendingTransactions = new Map();
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            maxSlippage: 0.5, // 0.5%
            maxGasPrice: 100, // in gwei
            transactionTimeout: 300, // 5 minutes in seconds
            emergencyStopThreshold: 5, // % of portfolio loss
        };

        const savedSettings = localStorage.getItem('riskSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('riskSettings', JSON.stringify(this.settings));
    }

    // Slippage Protection
    async validateSlippage(path, amount) {
        const quotes = await this.getQuotes(path);
        const expectedOutput = quotes.expectedOutput;
        const minOutput = expectedOutput * (1 - this.settings.maxSlippage / 100);
        
        return {
            expectedOutput,
            minOutput,
            slippage: ((expectedOutput - minOutput) / expectedOutput) * 100,
            isValid: true
        };
    }

    // Gas Price Protection
    async validateGasPrice(transaction) {
        const currentGasPrice = await this.provider.getGasPrice();
        const gasPriceInGwei = parseFloat(formatUnits(currentGasPrice, 'gwei'));
        
        return {
            isValid: gasPriceInGwei <= this.settings.maxGasPrice,
            currentGasPrice: gasPriceInGwei,
            maxAllowedGasPrice: this.settings.maxGasPrice
        };
    }

    // Transaction Timeout Handling
    async monitorTransaction(txHash, timeout = this.settings.transactionTimeout) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            this.pendingTransactions.set(txHash, {
                startTime,
                timeout,
                status: 'pending'
            });

            const checkTransaction = async () => {
                try {
                    const receipt = await this.provider.getTransactionReceipt(txHash);
                    if (receipt) {
                        this.pendingTransactions.delete(txHash);
                        resolve(receipt);
                        return;
                    }

                    if (Date.now() - startTime > timeout * 1000) {
                        this.pendingTransactions.delete(txHash);
                        reject(new Error('Transaction timeout'));
                        return;
                    }

                    setTimeout(checkTransaction, 1000);
                } catch (error) {
                    reject(error);
                }
            };

            checkTransaction();
        });
    }

    // Emergency Stop
    async activateEmergencyStop() {
        this.isEmergencyStopped = true;
        // Emit event or notify subscribers
        return true;
    }

    async deactivateEmergencyStop() {
        this.isEmergencyStopped = false;
        // Emit event or notify subscribers
        return true;
    }

    // Transaction Validation
    async validateTransaction(transaction) {
        if (this.isEmergencyStopped) {
            throw new Error('Emergency stop is active');
        }

        const [slippageValid, gasPriceValid] = await Promise.all([
            this.validateSlippage(transaction.path, transaction.amount),
            this.validateGasPrice(transaction)
        ]);

        return {
            isValid: slippageValid.isValid && gasPriceValid.isValid,
            slippage: slippageValid,
            gasPrice: gasPriceValid,
            warnings: this.generateWarnings(slippageValid, gasPriceValid)
        };
    }

    generateWarnings(slippage, gasPrice) {
        const warnings = [];
        if (slippage.slippage > this.settings.maxSlippage / 2) {
            warnings.push('High slippage detected');
        }
        if (gasPrice.currentGasPrice > this.settings.maxGasPrice * 0.8) {
            warnings.push('Gas price approaching maximum limit');
        }
        return warnings;
    }
}

export default RiskManagementService; 