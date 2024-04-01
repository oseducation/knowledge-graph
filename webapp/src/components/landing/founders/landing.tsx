import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Stack, Typography, Box, Avatar} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

import {Analytics} from '../../../analytics';
import {Graph, cloneGraph} from '../../../types/graph';
import useAppBarHeight from '../../../hooks/use_app_bar_height';
import Problem1 from '../problem1';
import Problem2 from '../problem2';
import DropOut from '../drop_out';
import Vitsi from '../vitsi';
import Explore from '../explore';
import Learn from '../learn';
import Footer from '../../footer';

import Hero from './hero';
import Apply from './apply';
import Courses from './courses';



interface Props {
    language?: string;
}

const Landing = (props: Props) => {
    const navigate = useNavigate();
    const {t, i18n} = useTranslation();

    if (props.language && props.language !== i18n.language) {
        i18n.changeLanguage(props.language);
    }

    Analytics.landing('general');

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
            message: t("Vitsi AI's knowledge graph is an innovation in learning. I believe it will provide an intuitive and clear learning path for various subjects."),
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
            message: t("Vitsi AI's concept of linking concepts together is intriguing. It mirrors how our brain creates connections between related pieces of information."),
            image: ""
        }
    ] as Testimonial[];

    const graph: Graph = {
        nodes:[{
            id:'knowledge-gap',
            name:t('Knowledge Gaps'),
            description: t('Learners have knowledge gaps'),
            node_type: 'lecture',
            status: 'next',
            parent_id: ''
        }, {
            id:'attention-span',
            name:t('Attention Span'),
            description: t('Learners have attention span problems'),
            node_type: 'lecture',
            status: 'next',
            parent_id: ''
        }, {
            id:'drop-out',
            name:t('90% drops out'),
            description: t('90% of learners drop out of online courses'),
            node_type: 'lecture',
            status: '',
            parent_id: ''
        }, {
            id:'vitsi',
            name:t('Solution: Vitsi AI'),
            description: t('Two minute topics prerequisite map'),
            node_type: 'lecture',
            status: '',
            parent_id: ''
        }, {
            id: 'explore',
            name: t('Explore The Knowledge'),
            description: t('Learners can explore all the knowledge in the world'),
            node_type: 'lecture',
            status: '',
            parent_id: ''
        }, {
            id: 'learn',
            name: t('Learn Anything'),
            description: t('Learn anything if you know the prerequisites'),
            node_type: 'lecture',
            status: '',
            parent_id: ''
        }, {
            id: 'apply',
            name: t('Achieve Your Goals'),
            description: t('Apply acquired knowledge to your startup journey'),
            node_type: 'lecture',
            status: '',
            parent_id: ''
        }],
        links:[{
            source:'knowledge-gap',
            target:'drop-out'
        },{
            source:'attention-span',
            target:'drop-out'
        },{
            source:'drop-out',
            target:'vitsi'
        },{
            source:'vitsi',
            target:'explore'
        },{
            source:'vitsi',
            target:'learn'
        },{
            source:'vitsi',
            target:'apply'
        }]
    }

    const staticHeight = `calc(100vh - (${useAppBarHeight()}px))`;

    const p1 = cloneGraph(graph);
    p1.nodes[0].status = 'started';

    const p2 = cloneGraph(graph);
    p2.nodes[0].status = 'finished';
    p2.nodes[1].status = 'started';

    const drop = cloneGraph(p2);
    drop.nodes[1].status = 'finished';
    drop.nodes[2].status = 'started';

    const vitsi = cloneGraph(drop);
    vitsi.nodes[2].status = 'finished';
    vitsi.nodes[3].status = 'started';

    const explore = cloneGraph(vitsi);
    explore.nodes[3].status = 'finished';
    explore.nodes[4].status = 'started';
    explore.nodes[5].status = 'next';
    explore.nodes[6].status = 'next';

    const learn = cloneGraph(explore);
    learn.nodes[4].status = 'finished';
    learn.nodes[5].status = 'started';

    const apply = cloneGraph(learn);
    apply.nodes[5].status = 'finished';
    apply.nodes[6].status = 'started';

    return (
        <Box
            sx={{
                height: staticHeight,
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
            }}
        >
            <Grid2 id='parent-grid' container spacing={2} disableEqualOverflow m={0}>
                <Hero/>
                <Courses
                    height={staticHeight}
                    color='#023E8A'
                />
                <Problem1
                    graph={p1}
                    height={staticHeight}
                    color='#0077B6'
                />
                <Problem2
                    graph={p2}
                    height={staticHeight}
                    color='#0096C7'
                />
                <DropOut
                    graph={drop}
                    height={staticHeight}
                    color='#00B4D8'
                />
                <Vitsi
                    graph={vitsi}
                    height={staticHeight}
                    color='#48CAE4'
                />
                <Explore
                    graph={explore}
                    height={staticHeight}
                    color='#90E0EF'
                />
                <Learn
                    graph={learn}
                    height={staticHeight}
                    color='#a6e6f2'
                />
                <Apply
                    graph={apply}
                    height={staticHeight}
                    color='#b8ebf5'
                />
                <Grid2 container
                    m={0}
                    p={1}
                    xs={12}
                    id='testimoenials-sction'
                    bgcolor={'#c6eff7'}
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
                    height={staticHeight}
                    bgcolor={'primary.dark'}
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
                                color={'white'}
                            >
                                {t("Ready to Unlock Your Learning Potential?")}
                            </Typography>
                            <Typography
                                fontSize={20}
                                color={'white'}
                            >
                                {t("Join us at Vitsi AI and transform the way you learn.")}
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

export default Landing;
