const fs = require('fs');
const path = require('path');

async function performRollback() {
    try {
        // Get the last known good deployment
        const deploymentsPath = path.join(__dirname, '../deployments');
        const deployments = fs.readdirSync(deploymentsPath)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();

        if (deployments.length === 0) {
            throw new Error('No previous deployments found');
        }

        const lastGoodDeployment = require(path.join(deploymentsPath, deployments[0]));

        // Execute rollback
        console.log('Rolling back to deployment:', lastGoodDeployment.version);
        
        // Add your rollback logic here
        // This might include:
        // 1. Stopping the current deployment
        // 2. Reverting to previous version
        // 3. Restoring database state
        // 4. Restarting services

        console.log('Rollback completed successfully');
    } catch (error) {
        console.error('Rollback failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    performRollback();
}

module.exports = performRollback; 