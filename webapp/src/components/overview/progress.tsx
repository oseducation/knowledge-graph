
import React from 'react';
import {Box, Typography, useTheme, alpha} from '@mui/material';
import {Line} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const Progress = () => {
    const theme = useTheme();
    const currentData = [0, 10, 5, 2, 20, 30, 45, 40, 50, 30, 50, 20];
    const previousData = [0, 5, 10, 15, 2, 25, 3, 35, 40, 12, 4, 27];

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Current',
                data: currentData,
                fill: true,
                backgroundColor: alpha(theme.palette.primary.light, 0.3),
                borderColor: theme.palette.primary.main,
                pointBackgroundColor: theme.palette.primary.main,
                tension: 0.3,
            },
            {
                label: 'Previous',
                data: previousData,
                fill: true,
                backgroundColor: alpha(theme.palette.error.light, 0.5),
                borderColor: theme.palette.error.main,
                pointBackgroundColor: theme.palette.error.main,
                tension: 0.3,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <Box sx={{
            m: 1,
            mt: 2,
            bgcolor: 'background.paper',
            borderRadius: '16px',
        }}>

            <Typography variant="h5" sx={{fontWeight: 'bold', m:2}}>
                Monthly Progress
            </Typography>
            <Box sx={{p:3, pt:0}}>
                <Line data={data} options={options}/>
            </Box>
        </Box>
    );
};

export default Progress;


