import React from 'react';
import {Box, Card, Typography, useTheme} from '@mui/material';
import {Doughnut} from 'react-chartjs-2';
import 'chart.js/auto';


const Activity = () => {
    const theme = useTheme();

    const activities = [
        { label: 'Video', value: 20, color: theme.palette.primary.main },
        { label: 'Code', value: 40, color: '#ffa216' },
        { label: 'Text', value: 40, color: '#ec1b80' }];

    const chartData = {
        datasets: [{
            data: activities.map(a => a.value),
            backgroundColor: activities.map(a => a.color),
            borderWidth: 0,
            borderRadius: 6,
            // borderAlign: 'inner',
            // borderJoinStyle: "round" as CanvasLineJoin,
            cutout: '80%',
        }],
        labels: activities.map(a => a.label),
    };

    // Options for the Doughnut chart
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        rotation: 270, // Start from the top
        circumference: 180, // Half circle
        plugins: {
            legend: {
                display: false, // Hide the legend
            },
            tooltip: {
                enabled: false, // Hide the tooltip
            },
        },
    };

    return (
        <Card
            sx={{
                position: 'relative',
                textAlign: 'center',
                p: 2,
                m:1,
                borderRadius:'16px',
                bgcolor: 'background.paper',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            }}
        >
            <Typography variant="h5" gutterBottom component="div" sx={{fontWeight: 'bold'}}>
                Today&apos;s Activity
            </Typography>
            <Box>
                <Doughnut data={chartData} options={chartOptions} />
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}>
                    <Typography variant="h4" component="div">
                        {`${activities.reduce((acc, activity) => acc + activity.value, 0)}%`}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                {activities.map((activity, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Box sx={{ width: 14, height: 14, bgcolor: activity.color, borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body1">
                            {activity.label}
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 'bold', ml:'4px'}}>
                            {`${activity.value}%`}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

export default Activity;
