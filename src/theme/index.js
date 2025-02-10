import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e1e1e',
                    borderRadius: 8,
                }
            }
        }
    }
});

export default theme;