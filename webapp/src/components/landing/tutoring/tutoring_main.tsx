import React from 'react';
import {Button, Typography, Box, useTheme} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

import {Analytics} from '../../../analytics';
import useAppBarHeight from '../../../hooks/use_app_bar_height';

import Hero from './tutoring_hero';
import Benefits from './tutoring_benefits';

const TutoringMain = () => {
    const {t} = useTranslation();
    const theme = useTheme();

    Analytics.landing('tutoring');

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
                    <Box
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
                                Analytics.getStartedClicked("tutoring ready to join");
                                window.open(tutoringGoogleForm, '_blank');
                            }}
                        >
                            {t("Get Started")}
                        </Button>
                    </Box>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default TutoringMain;

export const tutoringGoogleForm = 'https://forms.gle/2aT25k6rq2gSVnZd6'
