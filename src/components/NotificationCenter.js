import React from 'react';
import { Card, CardContent, Typography, List, ListItem, IconButton } from '@mui/material';
import { Notifications, Check, Error } from '@mui/icons-material';

const NotificationCenter = ({ notifications, onDismiss }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">
                    <Notifications /> Notifications
                </Typography>
                <List>
                    {notifications.map(notification => (
                        <ListItem
                            key={notification.id}
                            secondaryAction={
                                <IconButton onClick={() => onDismiss(notification.id)}>
                                    <Check />
                                </IconButton>
                            }
                        >
                            <Typography color={notification.type === 'error' ? 'error' : 'textPrimary'}>
                                {notification.message}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}; 