import React from 'react';
import {Button, Typography, Box, useTheme, Rating} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import {Analytics} from '../../../analytics';

interface Props {
    height: string;
    color: string;
}

const Hero = (props: Props) => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const theme = useTheme();

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='hero-section'
            minHeight={props.height}
            bgcolor={theme.palette.background.default}
            padding={0}
            // pl={3}
            // pr={3}

            sx={{scrollSnapAlign: 'start'}}
            display={'flex'}
            flexDirection={'row'}
            justifyItems={'center'}
            justifyContent={'center'}
            alignContent={'center'}
        >
            <Grid2 xs={12} display={'flex'} flexDirection={{xs:'column', sm:'column', md:'row'}} alignItems={'center'} ml={10} mr={10} >
                <Grid2
                    xs={12} sm={12} md={6}
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    pl='12px'
                    maxWidth={{sm: '400px', md: '2000px'}}
                >
                    <Box m={{xs: 0, sm: 4, md: 8, lg: 12}} gap={4} display={'flex'} flexDirection={'column'} alignItems={{xs:'center', sm:'center', md:'flex-start'}}>
                        <Typography variant='h1'
                            fontWeight={'bold'}
                            p={'30px 0'}
                            color={theme.palette.getContrastText(theme.palette.background.default)}
                            sx={{fontFamily: 'Roboto Slab, serif', fontWeight: 700}}
                        >
                            {t("Learn something meaningful")}
                        </Typography>
                        <Typography
                            variant='h5'
                            color={theme.palette.getContrastText(theme.palette.background.default)}
                        >
                            {"Achieve your learning goals one topic at a time with "}
                            <Box component={'span'} color={theme.palette.primary.main} fontWeight={600}>one-on-one</Box>
                            {" learning"}
                        </Typography>
                        <Box mr={1}>
                            <Button
                                variant='contained'
                                color='primary'
                                size='large'
                                onClick={() => {
                                    Analytics.signUpStarted("startup school hero");
                                    navigate('/register');
                                }}
                            >
                                {t("Sign Up For Free")}
                            </Button>
                        </Box>
                    </Box>
                </Grid2>
                <Grid2
                    xs={12} sm={12} md={6}
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    mt={{xs:4, sm:4, md:0}}
                >
                    <img src='/simple.png' alt='hero' width='100%'/>
                </Grid2>
            </Grid2>
            <Grid2
                xs={12}
                mt={4}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
            >
                <Typography
                    variant='h3'
                    color={theme.palette.getContrastText(theme.palette.background.default)}
                    textAlign='center'
                    fontWeight={'bold'}
                    sx={{fontFamily: 'Roboto Slab, serif'}}
                >
                    Join thousands of people learning on Vitsi
                </Typography>
                <Box display={'flex'} flexDirection={{xs:'column', sm:'column', md:'row'}} alignItems={'center'} height={{xs:'320px', sm:'320px', md:'128px'}} mt={4} mb={4}>
                    <img src={'./logos/freeu.png'} alt={`Free University Logo`} style={{height: '128px'}}/>
                    <Box
                        display={'flex'}
                        flexDirection={'column'}
                        alignContent={'center'}
                        alignItems={'center'}
                        sx={{mr:4, ml:4}}
                        mt={{xs: 2, sm: 2, md: 0}}
                        mb={{xs: 2, sm: 2, md: 0}}
                    >
                        <Rating name="read-only" value={5} readOnly sx={{m:'0 5'}}/>
                        <Typography variant='body1'>
                            Hundreds of 5-star reviews
                        </Typography>
                    </Box>
                    <img src={'./logos/founderu.png'} alt={`Founder University Logo`} style={{width: '300px'}} />
                </Box>
            </Grid2>
        </Grid2>
    )
}

export default Hero;
