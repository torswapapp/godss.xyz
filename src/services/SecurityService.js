import { 
    TypedDataEncoder,
    parseEther 
} from 'ethers';

class SecurityService {
    constructor(provider) {
        this.provider = provider;
        this.rateLimits = new Map();
        this.errorLogs = [];
        this.securitySettings = this.loadSecuritySettings();
        this.connectedWallets = new Set();
        this.transactionQueue = [];
        this.isProcessingQueue = false;
    }

    loadSecuritySettings() {
        const defaultSettings = {
            maxTransactionsPerMinute: 5,
            requiredConfirmations: 2,
            autoLockTimeout: 15, // minutes
            maxGasLimit: 500000,
            whitelistedAddresses: [],
            blacklistedAddresses: []
        };

        const saved = localStorage.getItem('securitySettings');
        return saved ? JSON.parse(saved) : defaultSettings;
    }

    // Wallet Security
    async validateWalletConnection(address) {
        // Check if wallet is blacklisted
        if (this.securitySettings.blacklistedAddresses.includes(address)) {
            throw new Error('Wallet address is blacklisted');
        }

        // Verify wallet balance meets minimum requirements
        const balance = await this.provider.getBalance(address);
        if (balance.lt(parseEther('0.1'))) {
            throw new Error('Insufficient wallet balance for security deposit');
        }

        // Request signature to verify wallet ownership
        const message = this.createConnectionMessage(address);
        const signature = await this.requestSignature(message);
        
        if (await this.verifySignature(address, message, signature)) {
            this.connectedWallets.add(address);
            this.logSecurityEvent('wallet_connected', { address });
            return true;
        }
        return false;
    }

    // Transaction Security
    async validateAndQueueTransaction(transaction) {
        // Rate limiting check
        if (!this.checkRateLimit(transaction.from)) {
            throw new Error('Rate limit exceeded');
        }

        // Transaction validation
        this.validateTransactionParams(transaction);

        // Queue transaction for confirmation
        return new Promise((resolve, reject) => {
            this.transactionQueue.push({
                transaction,
                confirmations: 0,
                resolve,
                reject,
                timestamp: Date.now()
            });

            if (!this.isProcessingQueue) {
                this.processTransactionQueue();
            }
        });
    }

    // Rate Limiting
    checkRateLimit(address) {
        const now = Date.now();
        const userLimits = this.rateLimits.get(address) || {
            transactions: [],
            lastReset: now
        };

        // Reset counter if minute has passed
        if (now - userLimits.lastReset > 60000) {
            userLimits.transactions = [];
            userLimits.lastReset = now;
        }

        // Check if limit exceeded
        if (userLimits.transactions.length >= this.securitySettings.maxTransactionsPerMinute) {
            return false;
        }

        // Add transaction to counter
        userLimits.transactions.push(now);
        this.rateLimits.set(address, userLimits);
        return true;
    }

    // Error Logging and Monitoring
    logSecurityEvent(eventType, data) {
        const event = {
            timestamp: new Date().toISOString(),
            type: eventType,
            data,
            blockNumber: null
        };

        // Get current block number for reference
        this.provider.getBlockNumber().then(blockNumber => {
            event.blockNumber = blockNumber;
        });

        this.errorLogs.push(event);
        this.monitorSecurityEvent(event);

        // Persist logs
        this.persistLogs();
    }

    // Helper Methods
    async processTransactionQueue() {
        this.isProcessingQueue = true;

        while (this.transactionQueue.length > 0) {
            const item = this.transactionQueue[0];
            const confirmationsNeeded = this.securitySettings.requiredConfirmations;

            if (item.confirmations >= confirmationsNeeded) {
                try {
                    const signedTx = await this.signAndVerifyTransaction(item.transaction);
                    item.resolve(signedTx);
                } catch (error) {
                    item.reject(error);
                    this.logSecurityEvent('transaction_failed', {
                        error: error.message,
                        transaction: item.transaction
                    });
                }
                this.transactionQueue.shift();
            } else {
                // Wait for more confirmations
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        this.isProcessingQueue = false;
    }

    validateTransactionParams(transaction) {
        // Validate gas limit
        if (transaction.gasLimit > this.securitySettings.maxGasLimit) {
            throw new Error('Gas limit exceeds security threshold');
        }

        // Validate destination address
        if (this.securitySettings.blacklistedAddresses.includes(transaction.to)) {
            throw new Error('Destination address is blacklisted');
        }

        // Additional custom validations
        return true;
    }

    async monitorSecurityEvent(event) {
        // Implement real-time security monitoring
        if (event.type === 'suspicious_activity') {
            // Trigger alerts or automatic responses
            await this.handleSuspiciousActivity(event);
        }
    }

    async handleSuspiciousActivity(event) {
        // Implement automatic response to security threats
        if (event.data.severity === 'high') {
            await this.activateEmergencyStop();
            this.notifyAdministrators(event);
        }
    }

    persistLogs() {
        // Keep only last 1000 logs
        if (this.errorLogs.length > 1000) {
            this.errorLogs = this.errorLogs.slice(-1000);
        }
        localStorage.setItem('securityLogs', JSON.stringify(this.errorLogs));
    }

    async signTypedData(data) {
        const domain = {
            name: 'FlashLoan Dashboard',
            version: '1',
            chainId: await this.provider.getNetwork().then(n => n.chainId)
        };
        
        const types = {
            Transaction: [
                { name: 'amount', type: 'uint256' },
                { name: 'target', type: 'address' },
                { name: 'deadline', type: 'uint256' }
            ]
        };
        
        return TypedDataEncoder.encode(domain, types, data);
    }
}

export default SecurityService; 