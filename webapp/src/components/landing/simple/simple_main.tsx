import React from 'react';
import {Button, Typography, Box, useTheme} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {Analytics} from '../../../analytics';
import useAppBarHeight from '../../../hooks/use_app_bar_height';
import Footer from '../../footer';

import Hero from './hero';
import Benefits from './benefits';
import Testimonials from './testimonials';

const SimpleMain = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();

    Analytics.landing('simple');



    const staticHeight = `calc(100vh - (${useAppBarHeight()}px))`;

    return (
        <Box
            sx={{
                // overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
            }}
        >
            <Grid2 id='parent-grid' container spacing={2} disableEqualOverflow m={0} bgcolor={theme.palette.background.default}>
                <Hero
                    height={staticHeight}
                    color={'#023e8a'}
                />
                <Benefits height={staticHeight}/>

                <Grid2 container
                    m={0}
                    p={1}
                    xs={12}
                    id='testimoenials-section'
                    bgcolor={'#00b4d8'}
                    minHeight={staticHeight}
                    sx={{scrollSnapAlign: 'start'}}
                    justifyContent={'center'}
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

                    <Testimonials/>

                    <Box
                        // xs={12} sm={9} md={6}
                        m={0}
                        p={1}
                        display={'flex'}
                        alignItems={'center'}
                    >
                        <Typography
                            fontSize={32}
                            fontWeight={'bold'}
                            color={theme.palette.secondary.main}
                        >
                            {t("Ready to Join?")}
                        </Typography>
                    </Box>
                    <Box
                        // xs={12} sm={3} md={3}
                        m={0}
                        p={1}
                        display={'flex'}
                        alignItems={'center'}
                        ml={2}
                    >
                        <Button
                            variant='contained'
                            color='secondary'
                            size='large'
                            onClick={() => {
                                Analytics.signUpStarted("startup school hero");
                                navigate('/register');
                            }}
                        >
                            {t("Get Started")}
                        </Button>
                    </Box>
                </Grid2>
                <Grid2 container
                    m={0}
                    p={1}
                    xs={12}
                    id='action-section'
                    sx={{
                        scrollSnapAlign: 'start',
                        py: 3,
                    }}
                    justifyContent={'center'}
                >
                    <Box component="footer">
                        <Footer/>
                    </Box>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default SimpleMain;
