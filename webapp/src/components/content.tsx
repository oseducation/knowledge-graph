import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Stack, Typography, Box, Avatar} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

import {Analytics} from '../analytics';

import VideoPlayer from './player';

const Content = () => {
    const navigate = useNavigate();
    const {t, i18n} = useTranslation();

    type Testimonial = {
        name: string;
        message: string;
        image: string;
    };

    const testimonials = [
        {
            name: t("George"),
            message: t("Love it! Courses are too much of a commitment"),
            image: ""
        },{
            name: t("Nino"),
            message: t("Vitsi.ai's knowledge graph is an innovation in learning. I believe it will provide an intuitive and clear learning path for various subjects."),
            image: ""
        },{
            name: t("David"),
            message: t("Mapping knowledge into a prerequisite graph could help learners better understand and absorb information."),
            image: ""
        },{
            name: t("Luke"),
            message: t("It's like building a mind map but for all the knowledge in the world!"),
            image: ""
        },{
            name: t("Ann"),
            message: t("Understanding the prerequisites before jumping into a complex topic is crucial, and their idea seems to address that perfectly."),
            image: ""
        },{
            name: t("Mariam"),
            message: t("Vitsi.ai's concept of linking concepts together is intriguing. It mirrors how our brain creates connections between related pieces of information."),
            image: ""
        }
    ] as Testimonial[];

    let videoKey = 'qshiBUx-0rQ';
    if (i18n.language === 'ge') {
        videoKey = 'hvBEDC4dtzM'
    }

    return (
        <Grid2 container spacing={2} disableEqualOverflow m={0}>
            <Grid2 container
                m={0}
                xs={12}
                id='hero-section'
                height={400}
                bgcolor={'primary.dark'}
            >
                <Grid2
                    xs={12} sm={9} md={6}
                    display={'flex'}
                    alignItems={'center'}
                >
                    <Stack>
                        <Typography
                            fontSize={32}
                            fontWeight={'bold'}
                            color={'white'}
                            p={'30px 0'}
                        >
                            {t("Lifelong Learning Without Courses")}
                        </Typography>
                        <Typography
                            fontSize={26}
                            fontWeight={'bold'}
                            color={'white'}
                        >
                            {t("Veni, Vidi, Vitsi AI - Learning Made Easy")}
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
                                Analytics.signUpStarted("hero");
                                navigate('/register');
                            }}
                        >
                            {t("Sign Up For Free")}
                        </Button>
                    </Box>
                </Grid2>
                <Grid2
                    xs={0} sm={0} md={3}
                    display={'flex'}
                    alignItems={'center'}
                >
                    <Box
                        component="img"
                        sx={{
                            height: 150,
                            display: {xs: 'none', sm: 'none', md: 'block'},
                        }}
                        alt="logo"
                        src="android-chrome-512x512.png"
                        m={'40px'}
                    />
                </Grid2>
            </Grid2>
            <Grid2 container
                m={0}
                p={1}
                xs={12}
                id='feature-section'
                display={'flex'}
                alignItems={'center'}
                bgcolor={'white'}
            >
                <Grid2 xs={12} sm={9} md={6}>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        {t("The World's Knowledge at Your Fingertips")}
                    </Typography>
                    <Typography paragraph>
                        {t("Every piece of knowledge in the world can be depicted through a prerequisite graph, where understanding all the prerequisites paves the way for learning novel concepts. We are building such a graph.")}
                    </Typography>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        {t("Built for Lifelong Learning")}
                    </Typography>
                    <Typography paragraph>
                        {t("No matter where you are in your learning journey, our platform adapts to you. From coding to cooking, explore interconnected concepts and skills at your own pace.")}
                    </Typography>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        {t("Personalized Pathways")}
                    </Typography>
                    <Typography paragraph>
                        {t("Our algorithm suggests the next concepts to learn based on your past mastery and your future goals. Gain the confidence of knowing you’re on the right path.")}
                    </Typography>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        {t("Community Contributions")}
                    </Typography>
                    <Typography paragraph>
                        {t("Learning is better together. Help the community by sharing resources, or take advantage of others' expertise to enrich your understanding.")}
                    </Typography>
                </Grid2>
                <Grid2 xs={12} sm={3} md={6}
                    display={'flex'}
                    alignItems={'center'}
                    p={1}
                >

                    <Box
                        component="img"
                        sx={{width: '100%'}}
                        alt="vitsi.ai"
                        src="screen.png"
                    />
                </Grid2>
            </Grid2>
            <Grid2 container
                m={0}
                p={1}
                xs={12}
                id='feature-section'
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                bgcolor={'white'}
            >
                <VideoPlayer
                    videoKey={videoKey}
                    width={'100%'}
                    height={'600px'}
                    autoplay={false}
                    loop={false}
                    onVideoEnded={()=>{}}
                    onVideoStarted={()=>{}}
                />
            </Grid2>
            <Grid2 container
                m={0}
                p={1}
                xs={12}
                id='testimoenials-sction'
                bgcolor={'primary.light'}
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

                <Grid2 m={0} p={0} container spacing={2}>
                    {testimonials.map((testimonial, index) => (
                        <Grid2 m={0} p={1} xs={12} sm={6} md={4} key={index} width={'100%'}>
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
                height={300}
                bgcolor={'primary.dark'}
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
                            color={'white'}
                        >
                            {t("Ready to Unlock Your Learning Potential?")}
                        </Typography>
                        <Typography
                            fontSize={20}
                            color={'white'}
                        >
                            {t("Join us at Vitsi.ai and transform the way you learn.")}
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
                                Analytics.signUpStarted("bottom");
                                navigate('/register');
                            }}
                        >
                            {t("Sign Up For Free")}
                        </Button>
                    </Box>
                </Grid2>
            </Grid2>
        </Grid2>
    );
};

export default Content;
