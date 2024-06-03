import React from 'react';
import {Button, Stack, Typography, Box, useTheme} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {Analytics} from '../../../analytics';
import useAppBarHeight from '../../../hooks/use_app_bar_height';
import Footer from '../../footer';

import Hero from './hero';

const SimpleMain = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();

    Analytics.landing('simple');



    const staticHeight = `calc(100vh - (${useAppBarHeight()}px))`;

    return (
        <Box
            sx={{
                // height: staticHeight,
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
            }}
        >
            <Grid2 id='parent-grid' container spacing={2} disableEqualOverflow m={0} bgcolor={theme.palette.background.default}>
                <Hero
                    height={staticHeight}
                    color={'#023e8a'}
                />

                <Grid2 container
                    m={0}
                    p={1}
                    xs={12}
                    id='testimoenials-section'
                    bgcolor={'#00b4d8'}
                    // minHeight={staticHeight}
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

export default SimpleMain;
