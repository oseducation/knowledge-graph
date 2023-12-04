import React, {useEffect, useState} from 'react';
import {Box, Card, Typography, useTheme} from '@mui/material';
import {Doughnut} from 'react-chartjs-2';
import 'chart.js/auto';

import {ActivityToday} from '../../types/dashboard';
import {Client} from '../../client/client';


const Activity = () => {
    const theme = useTheme();
    const [activity, setActivity] = useState<ActivityToday>({nodes_finished_today: 0, nodes_started_today: 0, nodes_watched_today: 0});

    useEffect(() => {
        Client.Dashboard().getTodaysActivity().then((response) => {
            if (response && (response.nodes_finished_today || response.nodes_started_today || response.nodes_watched_today)){
                setActivity(response);
            }
        });
    }, []);


    const sum = activity.nodes_finished_today + activity.nodes_started_today + activity.nodes_watched_today;
    const activities = [
        {label: 'Finished', value: Math.floor(activity.nodes_finished_today / sum *100), color: theme.palette.success.main},
        {label: 'Started', value: Math.floor(activity.nodes_started_today / sum *100), color: theme.palette.warning.main},
        {label: 'Watched', value: Math.floor(activity.nodes_watched_today / sum *100), color: theme.palette.primary.main}];

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
                        {`${sum} Topics`}
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
