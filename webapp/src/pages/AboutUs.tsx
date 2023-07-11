import React from 'react';
import {Container, Typography, Box, List, ListItemText} from '@mui/material';

const AboutUs = () => {
    return (
        <Container>
            <Box my={4}>
                <Typography variant="h2" component="h1" gutterBottom>
                    About Us
                </Typography>

                <Typography variant="body1" paragraph>
                    <b>Vitsi.ai</b> aims to revolutionize the way people approach lifelong learning by providing a personalized roadmap for acquiring knowledge. We present information as an acyclic graph where each node represents bite-sized knowledge or concept, and edges represent prerequisites. By mastering all the prerequisite nodes users can move onto the next one. Any knowledge in the world can be represented like this.
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom>
                    The Problem We Are Solving
                </Typography>

                <Typography variant="body1" paragraph>
                    Traditional education, being course-based, tends to be inefficient:
                    <List>
                        <ListItemText>
                            1. Course content can not align with every learner's needs
                        </ListItemText>
                        <ListItemText>
                            2. Enrolling into a full course might be too much commitment
                        </ListItemText>
                        <ListItemText>
                            3. Courses are something you start and finish, not something you do - it's not aligned with lifelong learning
                        </ListItemText>
                        <ListItemText>
                            4. It is hard to understand where each individual course fits in the big picture of knowledge
                        </ListItemText>
                    </List>
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom>
                    Our Mission
                </Typography>

                <Typography variant="body1" paragraph>
                    At <b>Vitsi.ai</b>, our mission is to revolutionize the learning process by transforming the way knowledge is accessed, understood, and assimilated. We strive to create a world where learning is personalized, interconnected, and boundless. Through our innovative Knowledge Graph, we aim to empower learners of all ages to explore the vast landscapes of knowledge, break free from linear learning models, and chart their unique educational journeys.
                    <br/>
                    Guided by our commitment to making education accessible and dynamic, we are dedicated to building a platform where learners can not only consume knowledge but also contribute, fostering a collaborative and ever-evolving repository of human wisdom.
                    <br/>
                    Our mission is to ignite a lifelong passion for learning, promote understanding through interconnected knowledge, and pave the way for a future where education is not a one-size-fits-all journey, but a tailored adventure that continually adapts to meet the individual needs and aspirations of every learner.
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom>
                    Contact Us
                </Typography>

                <Typography variant="body1" paragraph>
                    If you have any questions about our services, please contact us at info@vitsi.ai.
                </Typography>
            </Box>
        </Container>
    );
}

export default AboutUs;
