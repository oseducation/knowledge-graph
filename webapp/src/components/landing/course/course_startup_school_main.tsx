import React from 'react';
import {Button, Stack, Typography, Box, Avatar} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {Analytics} from '../../../analytics';
import useAppBarHeight from '../../../hooks/use_app_bar_height';
import Footer from '../../footer';

import Hero from './hero';
import WhatYouLearn from './what_you_learn';
import Content from './content';

const CourseStartupSchoolMain = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    Analytics.landing('startup-school');

    type Testimonial = {
        name: string;
        message: string;
        image: string;
    };

    const testimonials = [
        {
            name: t("George"),
            message: t("Great way of learning"),
            image: ""
        },{
            name: t("Luke"),
            message: t("It's like building a mind map"),
            image: ""
        },{
            name: t("Ann"),
            message: t("Understanding the prerequisites before jumping into a complex topic is crucial."),
            image: ""
        }
    ] as Testimonial[];



    const staticHeight = `calc(100vh - (${useAppBarHeight()}px))`;

    return (
        <Box
            sx={{
                height: staticHeight,
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
            }}
        >
            <Grid2 id='parent-grid' container spacing={2} disableEqualOverflow m={0}>
                <Hero
                    height={staticHeight}
                    color={'#023e8a'}
                />
                <WhatYouLearn
                    height={staticHeight}
                    color={'#0077b6'}
                />
                <Content
                    height={staticHeight}
                    color={'#0096c7'}
                />
                <Grid2 container
                    m={0}
                    p={1}
                    xs={12}
                    id='testimoenials-section'
                    bgcolor={'#00b4d8'}
                    minHeight={staticHeight}
                    sx={{scrollSnapAlign: 'start'}}
                >
                    <Grid2
                        m={0} p={1} xs={12}
                        display="flex"
                        alignItems="center"
                        flexDirection={'column'}
                    >
                        <Typography
                            fontSize={26}
                            fontWeight={'bold'}
                            m={'20px'}
                        >
                            {t("From Vitsi Community")}
                        </Typography>
                    </Grid2>

                    <Grid2 m={0} p={0} container spacing={2} flexGrow={1}>
                        {testimonials.map((testimonial, index) => (
                            <Grid2 m={0} p={1} xs={12} md={4} key={index} width={'100%'}>
                                <Box
                                    bgcolor="white"
                                    boxShadow={2}
                                    p={2}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    minHeight={200}
                                    width={'100%'}
                                    m={'8px'}
                                >
                                    <Avatar alt={testimonial.name} src={testimonial.image} sx={{width: 80, height: 80}} />
                                    <Typography variant="h6" align="center">
                                        {testimonial.name}
                                    </Typography>
                                    <Typography align="center">{testimonial.message}</Typography>
                                </Box>
                            </Grid2>
                        ))}
                    </Grid2>
                </Grid2>
                <Grid2 container
                    m={0}
                    p={1}
                    xs={12}
                    id='action-section'
                    height={staticHeight}
                    bgcolor={'#48cae4'}
                    sx={{scrollSnapAlign: 'start'}}
                >
                    <Grid2
                        xs={12} sm={9} md={6}
                        m={0}
                        p={1}
                        display={'flex'}
                        alignItems={'center'}
                    >
                        <Stack>
                            <Typography
                                fontSize={32}
                                fontWeight={'bold'}
                                color={'black'}
                            >
                                {t("Ready to Join the Course?")}
                            </Typography>
                        </Stack>
                    </Grid2>
                    <Grid2
                        xs={12} sm={3} md={3}
                        display={'flex'}
                        alignItems={'center'}>
                        <Box mr={1}>
                            <Button
                                variant='contained'
                                color='secondary'
                                size='large'
                                onClick={() => {
                                    Analytics.signUpStarted("startup school hero");
                                    navigate('/register');
                                }}
                            >
                                {t("Join Now")}
                            </Button>
                        </Box>
                    </Grid2>
                </Grid2>
                <Grid2 container
                    m={0}
                    p={1}
                    xs={12}
                    id='action-section'
                    height={staticHeight}
                    bgcolor={'primary.dark'}
                    sx={{
                        scrollSnapAlign: 'start',
                        py: 3,
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[200]
                                : theme.palette.grey[800],
                    }}
                >
                    <Box component="footer">
                        <Footer/>
                    </Box>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default CourseStartupSchoolMain;
