import * as React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import {Card, Typography, Box, useTheme} from '@mui/material';
import PunchClockOutlinedIcon from '@mui/icons-material/PunchClockOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

interface Props {
    title: string;
    value: string;
    delta: string;
    deltaType: string;
    secondaryText: string;
    iconBackground: string;
    icon: React.ReactNode;
}

const DashboardWidget = (props: Props) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                minWidth: 275,
                borderRadius: '16px', // rounded corners
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.2)', // subtle shadow
                margin: '8px',
            }}
        >
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'} sx={{p:2}}>
                <Box>
                    <Typography sx={{fontSize: '1.5rem', fontWeight: 'bold'}}>
                        {props.value}
                    </Typography>
                    <Typography sx={{fontSize: '1rem', color: 'text.secondary',mb: '4px', mt:'8px'}} gutterBottom>
                        {props.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                marginLeft: '4px',
                                color: props.deltaType === 'positive' ? theme.palette.success.main : theme.palette.error.main,
                            }}
                        >
                            {props.deltaType === 'positive' ? '+' : '-'}{props.delta}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                color: 'text.secondary',
                                marginLeft: '4px',
                            }}>
                            {props.secondaryText}
                        </Typography>
                    </Box>
                </Box>
                <Box display={'flex'} alignContent={'center'} m={0} p={0}>
                    <Box
                        sx={{
                            background: props.iconBackground,
                            width: {xs: '40px', md: '48px', lg: '64px'},
                            height: {xs: '40px', md: '48px', lg: '64px'},
                        }}
                        display={'flex'}
                        alignContent={'center'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        borderRadius={'16px'}
                    >
                        {props.icon}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}


const Snippets = () => {
    const theme = useTheme();

    return (
        <Grid2 container spacing={2} display={'flex'} >
            <Grid2 xs={12} md={4}>
                <DashboardWidget
                    title="Time Spend"
                    value="15:30:45"
                    delta="1.5%"
                    deltaType="positive"
                    secondaryText='This Week'
                    iconBackground='#f0eefd'
                    icon={
                        <PunchClockOutlinedIcon fontSize="large" sx={{color: theme.palette.primary.main}}/>
                    }
                />
            </Grid2>
            <Grid2 xs={12} md={4}>
                <DashboardWidget
                    title="Learning Steak"
                    value="4"
                    delta="8"
                    deltaType="positive"
                    secondaryText='Max Steak'
                    iconBackground='#fff5e6'
                    icon={
                        <LocalFireDepartmentOutlinedIcon fontSize="large" sx={{color: '#ffa216'}}/>
                    }
                />
            </Grid2>
            <Grid2 xs={12} md={4}>
                <DashboardWidget
                    title="AI Tutor Questions"
                    value="17/100"
                    delta="10"
                    deltaType="positive"
                    secondaryText='This Week'
                    iconBackground='#fde8f2'
                    icon={
                        <AutoAwesomeOutlinedIcon fontSize="large" sx={{color: '#ec1b80'}}/>
                    }
                />
            </Grid2>
        </Grid2>
    );
}

export default Snippets;
