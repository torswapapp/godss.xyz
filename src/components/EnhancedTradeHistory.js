import React, { useState, useMemo } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { formatDistance } from 'date-fns';

const EnhancedTradeHistory = ({ trades }) => {
    const columns = useMemo(() => [
        {
            field: 'timestamp',
            headerName: 'Time',
            width: 180,
            valueFormatter: (params) => 
                formatDistance(new Date(params.value), new Date(), { addSuffix: true })
        },
        { field: 'profit', headerName: 'Profit (ETH)', width: 130, type: 'number' },
        { field: 'route', headerName: 'Route', width: 300 },
        { field: 'gasUsed', headerName: 'Gas Used', width: 130 },
        { field: 'status', headerName: 'Status', width: 130 }
    ], []);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Trade History</Typography>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={trades}
                        columns={columns}
                        components={{ Toolbar: GridToolbar }}
                        disableSelectionOnClick
                        autoPageSize
                        density="compact"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default React.memo(EnhancedTradeHistory); 