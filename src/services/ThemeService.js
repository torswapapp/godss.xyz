import { createTheme } from '@mui/material/styles';

class ThemeService {
    constructor() {
        this.themePreference = localStorage.getItem('themeMode') || 'light';
        this.alertSettings = this.loadAlertSettings();
    }

    getTheme(mode = this.themePreference) {
        return createTheme({
            palette: {
                mode,
                primary: {
                    main: mode === 'dark' ? '#90caf9' : '#1976d2',
                },
                secondary: {
                    main: mode === 'dark' ? '#f48fb1' : '#dc004e',
                },
                background: {
                    default: mode === 'dark' ? '#303030' : '#f5f5f5',
                    paper: mode === 'dark' ? '#424242' : '#ffffff',
                },
            },
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 960,
                    lg: 1280,
                    xl: 1920,
                },
            },
            components: {
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: 12,
                            boxShadow: mode === 'dark' 
                                ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                                : '0 4px 6px rgba(0, 0, 0, 0.1)',
                        },
                    },
                },
            },
        });
    }

    loadAlertSettings() {
        const defaultSettings = {
            notifications: {
                sound: true,
                desktop: true,
                mobile: true,
            },
            alerts: {
                profitThreshold: 0.01,
                lossThreshold: 0.05,
                gasPrice: 100,
                slippage: 1,
            },
            customAlerts: [],
        };

        const saved = localStorage.getItem('alertSettings');
        return saved ? JSON.parse(saved) : defaultSettings;
    }

    updateAlertSettings(newSettings) {
        this.alertSettings = { ...this.alertSettings, ...newSettings };
        localStorage.setItem('alertSettings', JSON.stringify(this.alertSettings));
    }

    toggleTheme() {
        this.themePreference = this.themePreference === 'light' ? 'dark' : 'light';
        localStorage.setItem('themeMode', this.themePreference);
        return this.getTheme();
    }
}

export default ThemeService; 