import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Stack, Typography, Box} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

import {Analytics} from '../../analytics';

const Hero = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='hero-section'
            minHeight={400}
            bgcolor={'#03045E'}
            padding={0}
            sx={{scrollSnapAlign: 'start'}}

        >
            <Grid2
                xs={12} sm={9} md={6}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                pl='12px'
            >
                <Stack>
                    <Typography variant='h4'
                        fontWeight={'bold'}
                        color={'white'}
                        p={'30px 0'}
                    >
                        {t("Become a Software Engineer Learning Two Minute Topics Daily")}
                    </Typography>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'white'}
                    >
                        {t("Veni, Vidi, Vitsi AI - Learning Made Easy")}
                    </Typography>
                </Stack>
            </Grid2>
            <Grid2
                xs={12} sm={3} md={6}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
            >
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
        </Grid2>
    )
}

export default Hero;
