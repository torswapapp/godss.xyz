import AWS from 'aws-sdk';
// Or use other services like Azure Key Vault, HashiCorp Vault, etc.

class SecretsManager {
    constructor() {
        this.secretsManager = new AWS.SecretsManager({
            region: process.env.REACT_APP_AWS_REGION
        });
    }

    async getSecret(secretName) {
        try {
            const data = await this.secretsManager.getSecretValue({
                SecretId: secretName
            }).promise();
            
            if ('SecretString' in data) {
                return JSON.parse(data.SecretString);
            }
        } catch (error) {
            console.error('Error fetching secret:', error);
            throw error;
        }
    }
}

export default new SecretsManager(); 