import React from 'react';
import {Button, Stack, Typography, Box} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

interface Props {
    height: string;
    color: string;
}

const Hero = (props: Props) => {
    const {t} = useTranslation();

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='hero-section'
            height={props.height}
            bgcolor={props.color}
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
                <Stack m={{xs: 0, sm: 4, md: 10}}>
                    <Typography variant='h3'
                        fontWeight={'bold'}
                        color={'white'}
                        p={'30px 0'}
                    >
                        {t("Convert Your Online Course Into Interactive AI Tutor")}
                    </Typography>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'white'}
                    >
                        {t("And Ensure 5x Increase In Completion Rate")}
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
                        size='large'
                        href="mailto:vitsiai.info@gmail.com"
                        sx={{bgcolor: '#03045e'}}
                    >
                        {t("Convert A Course")}
                    </Button>
                </Box>
            </Grid2>
        </Grid2>
    )
}

export default Hero;
