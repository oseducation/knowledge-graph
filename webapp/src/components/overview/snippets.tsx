import React, {useEffect, useState} from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import {Card, Typography, Box, useTheme} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

import {AITutorNumberOfPosts, FinishedNodes, Steak} from '../../types/dashboard';
import {Client} from '../../client/client';

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
                // minWidth: 275,
                borderRadius: '16px', // rounded corners
                // boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.2)', // subtle shadow
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
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
    const [finishedNodes, setFinishedNodes] = useState<FinishedNodes>({finished_nodes: 0, finished_nodes_this_week: 0});
    const [steak, setSteak] = useState<Steak>({current_steak: 0, max_steak: 0, today: false});
    const [postsNum, setPostsNum] = useState<AITutorNumberOfPosts>({bot_posts_month: 0, bot_posts_week: 0, max_posts: 100});

    useEffect(() => {
        Client.Dashboard().getFinishedNodes().then((res) => {
            if (res) {
                setFinishedNodes(res);
            }
        });
        Client.Dashboard().getSteak().then((res) => {
            if (res) {
                setSteak(res);
            }
        });
        Client.Dashboard().getAITutorPosts().then((res) => {
            if (res) {
                setPostsNum(res);
            }
        });
    }, []);

    return (
        <Grid2 container spacing={1} display={'flex'} >
            <Grid2 xs={12} sm={4}>
                <DashboardWidget
                    title="Topics Finished"
                    value={finishedNodes.finished_nodes.toString()}
                    delta={finishedNodes.finished_nodes_this_week.toString()}
                    deltaType="positive"
                    secondaryText='This Week'
                    iconBackground={'#C2FFF0'}
                    icon={
                        <CheckCircleIcon fontSize="large" sx={{color: theme.palette.success.main}}/>
                    }
                />
            </Grid2>
            <Grid2 xs={12} sm={4}>
                <DashboardWidget
                    title="Learning Steak"
                    value={`${steak.current_steak} Days`}
                    delta={"" + steak.max_steak}
                    deltaType="positive"
                    secondaryText='Max Steak'
                    iconBackground={'#DFDBFB'}
                    icon={
                        <LocalFireDepartmentOutlinedIcon fontSize="large" sx={{color: steak.today ? theme.palette.primary.main : theme.palette.grey[600]}}/>
                    }
                />
            </Grid2>
            <Grid2 xs={12} sm={4}>
                <DashboardWidget
                    title="AI Tutor Questions"
                    value={`${postsNum.bot_posts_month}/${postsNum.max_posts}`}
                    delta={"" + postsNum.bot_posts_week}
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
