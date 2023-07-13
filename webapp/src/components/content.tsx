import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Stack, Typography, Box, Avatar} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2



const Content = () => {
    const navigate = useNavigate();

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
                            Lifelong Learning Without Courses
                        </Typography>
                        <Typography
                            fontSize={26}
                            fontWeight={'bold'}
                            color={'white'}
                        >
                            First the Seeds, Then the Forest - Learning Made Easy
                        </Typography>
                    </Stack>
                </Grid2>
                <Grid2
                    xs={12} sm={3} md={3}
                    display={'flex'}
                    alignItems={'center'}>
                    <Box mr={1}>
                        <Button variant='contained' color='secondary' size='large' onClick={() => navigate('/register')}>Sign Up For Free</Button>
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
                        The World&apos;s Knowledge at Your Fingertips
                    </Typography>
                    <Typography paragraph>
                        Every piece of knowledge in the world can be depicted through a prerequisite graph, where understanding all the prerequisites paves the way for learning novel concepts. We are building such a graph.
                    </Typography>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        Built for Lifelong Learning
                    </Typography>
                    <Typography paragraph>
                        No matter where you are in your learning journey, our platform adapts to you. From coding to cooking, explore interconnected concepts and skills at your own pace.
                    </Typography>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        Personalized Pathways
                    </Typography>
                    <Typography paragraph>
                        Our algorithm suggests the next concepts to learn based on your past mastery and your future goals. Gain the confidence of knowing you’re on the right path.
                    </Typography>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        Community Contributions
                    </Typography>
                    <Typography paragraph>
                        Learning is better together. Help the community by sharing resources, or take advantage of others&apos; expertise to enrich your understanding.
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
                        From Vitsi Community
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
                            Ready to Unlock Your Learning Potential?
                        </Typography>
                        <Typography
                            fontSize={20}
                            color={'white'}
                        >
                            Join us at Vitsi.ai and transform the way you learn.
                        </Typography>
                    </Stack>
                </Grid2>
                <Grid2
                    xs={12} sm={3} md={3}
                    display={'flex'}
                    alignItems={'center'}>
                    <Box mr={1}>
                        <Button variant='contained' color='secondary' size='large' onClick={() => navigate('/register')}>Sign Up For Free</Button>
                    </Box>
                </Grid2>
            </Grid2>
        </Grid2>
    );
};

type Testimonial = {
    name: string;
    message: string;
    image: string;
};

const testimonials = [
    {
        name: "George",
        message: "Love it! Courses are too much of a commitment",
        image: ""
    },{
        name: "Nino",
        message: "Vitsi.ai's knowledge graph is an innovation in learning. I believe it will provide an intuitive and clear learning path for various subjects.",
        image: ""
    },{
        name: "David",
        message: "Mapping knowledge into a prerequisite graph could help learners better understand and absorb information.",
        image: ""
    },{
        name: "Luke",
        message: "It's like building a mind map but for all the knowledge in the world!",
        image: ""
    },{
        name: "Ann",
        message: "Understanding the prerequisites before jumping into a complex topic is crucial, and their idea seems to address that perfectly.",
        image: ""
    },{
        name: "Mariam",
        message: "Vitsi.ai's concept of linking concepts together is intriguing. It mirrors how our brain creates connections between related pieces of information.",
        image: ""
    }
] as Testimonial[];

export default Content;
