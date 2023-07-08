import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Stack, Typography, Box, Grid, Avatar} from '@mui/material';
import {Container} from '@mui/system';


const Content = () => {
    const navigate = useNavigate();

    return (
        <Stack direction={'column'}>
            <Box
                id='hero-section'
                alignItems={'center'}
                display={'flex'}
                height={300}
                bgcolor={'primary.dark'}
            >
                <Container>
                    <Stack direction={'row'}>
                        <Stack p={'0 100px'}>
                            <Typography
                                fontSize={32}
                                fontWeight={'bold'}
                                color={'white'}
                                p={'30px 0'}
                                whiteSpace={'nowrap'}
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
                        <Box display={'flex'} alignItems={'center'} whiteSpace={'nowrap'}>
                            <Button variant='contained' color='secondary' size='large' onClick={() => navigate('/register')}>Sign Up For Free</Button>
                        </Box>
                        <Box
                            component="img"
                            sx={{
                                height: 200,
                            }}
                            alt="screenshot"
                            src="android-chrome-512x512.png"
                            m={'40px'}
                        />
                    </Stack>
                </Container>
            </Box>
            <Box
                id='feature-section'
                alignItems={'center'}
                display={'flex'}
                // height={600}
                bgcolor={'white'}
            >
                <Container>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        The World's Knowledge at Your Fingertips
                    </Typography>
                    <p>
                        Every piece of knowledge in the world can be depicted through a prerequisite graph, where understanding all the prerequisites paves the way for learning novel concepts. We are building such a graph.
                    </p>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        Built for Lifelong Learning
                    </Typography>
                    <p>
                        No matter where you are in your learning journey, our platform adapts to you. From coding to cooking, explore interconnected concepts and skills at your own pace.
                    </p>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        Personalized Pathways
                    </Typography>
                    <p>
                        Our algorithm suggests the next concepts to learn based on your past mastery and your future goals. Gain the confidence of knowing you’re on the right path.
                    </p>
                    <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                    >
                        Community Contributions
                    </Typography>
                    <p>
                        Learning is better together. Help the community by sharing resources, or take advantage of others' expertise to enrich your understanding.
                    </p>
                </Container>
                <Box
                    component="img"
                    sx={{
                        height: 512,
                    }}
                    alt="vitsi.ai"
                    src="screen.png"
                    m={'40px'}
                />
            </Box>
            <Box
                id='testimonials-section'
                alignItems={'center'}
                display={'flex'}
                flexDirection={'column'}
                height={600}
                bgcolor={'primary.light'}
            >
                <Typography
                        fontSize={26}
                        fontWeight={'bold'}
                        m={'20px'}
                >
                    From Vitsi Community
                </Typography>
                <Grid container spacing={2}>
                    {testimonials.map((testimonial, index) => (
                        <Grid item xs={'auto'} sm={6} md={4} key={index}>
                            <Box
                                bgcolor="white"
                                boxShadow={2}
                                p={2}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                minHeight={200}
                                m={'8px'}
                            >
                                <Avatar alt={testimonial.name} src={testimonial.image} sx={{width: 80, height: 80}} />
                                <Typography variant="h6" align="center">
                                    {testimonial.name}
                                </Typography>
                                <Typography align="center">{testimonial.message}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Box
                id='action-section'
                alignItems={'center'}
                display={'flex'}
                height={300}
                bgcolor={'white'}
            >
                <Container>
                    <Stack direction={'row'}>
                        <Stack p={'0 100px'}>
                            <Typography
                                fontSize={32}
                                fontWeight={'bold'}
                                p={'30px 0'}
                            >
                                Ready to Unlock Your Learning Potential?
                            </Typography>
                            <Typography fontSize={20}>
                                Join us at Vitsi.ai and transform the way you learn.
                            </Typography>
                        </Stack>
                        <Box display={'flex'} alignItems={'center'} whiteSpace={'nowrap'}>
                            <Button variant='contained' color='secondary' size='large' onClick={() => navigate('/register')}>Sign Up For Free</Button>
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Stack>
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
