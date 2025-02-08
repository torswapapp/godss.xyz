import React, { useState } from 'react';
import { 
    Card, CardContent, Typography, List, ListItem, 
    ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton 
} from '@mui/material';
import { MoreVert, Warning, Error, Info } from '@mui/icons-material';

const AlertCenter = () => {
    const [alerts, setAlerts] = useState([
        {
            type: 'info',
            message: 'System initialized',
            timestamp: new Date().toISOString()
        }
        // Add more default alerts if needed
    ]);

    const getAlertIcon = (type) => {
        switch(type) {
            case 'warning': return <Warning color="warning" />;
            case 'error': return <Error color="error" />;
            default: return <Info color="info" />;
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Alert Center</Typography>
                <List>
                    {alerts.map(alert => (
                        <ListItem>
                            <ListItemIcon>
                                {getAlertIcon(alert.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={alert.message}
                                secondary={alert.timestamp}
                            />
                            <ListItemSecondaryAction>
                                <IconButton>
                                    <MoreVert />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}; 