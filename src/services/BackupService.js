class BackupService {
    static async backupState() {
        const state = {
            trades: localStorage.getItem('trades'),
            settings: localStorage.getItem('settings'),
            timestamp: new Date().toISOString()
        };

        try {
            await fetch(process.env.REACT_APP_BACKUP_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_BACKUP_API_KEY}`
                },
                body: JSON.stringify(state)
            });
        } catch (error) {
            console.error('Backup failed:', error);
        }
    }

    static scheduleBackups(intervalMs = 3600000) { // Default: 1 hour
        setInterval(this.backupState, intervalMs);
    }
}

export default BackupService; 