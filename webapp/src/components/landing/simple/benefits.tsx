import React from 'react';
import {Typography, Box, useTheme} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2

interface Props {
    height: string;
}

const Benefits = (props: Props) => {
    const theme = useTheme();

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='hero-section'
            minHeight={props.height}
            bgcolor={theme.palette.grey[200]}
            padding={0}
            sx={{scrollSnapAlign: 'start'}}
            display={'flex'}
            flexDirection={'column'}
            justifyItems={'center'}
            justifyContent={'center'}
            alignContent={'center'}
        >
            <Grid2 display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <Box m={10} width={'600px'}>
                    <Typography
                        variant='h3'
                        sx={{fontFamily: 'Roboto Slab, serif', fontWeight: 700}}
                        fontWeight={'bold'}
                    >
                        Goal-Oriented Learning
                    </Typography>
                    <Typography variant='h5'>
                        Master 5-minute topics, one at a time
                    </Typography>
                </Box>
                <img src={'./benefits/1.webp'} alt={`Free University Logo`} width={'600px'}/>
            </Grid2>
            <Grid2 display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <img src={'./benefits/2.webp'} alt={`Free University Logo`} width={'600px'}/>
                <Box m={10} width={'600px'}>
                    <Typography
                        variant='h3'
                        sx={{fontFamily: 'Roboto Slab, serif', fontWeight: 700}}
                        fontWeight={'bold'}
                    >
                        Targeted Knowledge
                    </Typography>
                    <Typography variant='h5'>
                        Fill gaps by learning only what you need
                    </Typography>
                </Box>
            </Grid2>
            <Grid2 display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <Box m={10} width={'600px'}>
                    <Typography
                        variant='h3'
                        sx={{fontFamily: 'Roboto Slab, serif', fontWeight: 700}}
                        fontWeight={'bold'}
                    >
                        Gamified Progress
                    </Typography>
                    <Typography variant='h5'>
                        Stay motivated with skill tree challenges
                    </Typography>
                </Box>
                <img src={'./benefits/3.webp'} alt={`Free University Logo`} width={'600px'}/>
            </Grid2>
            <Grid2 display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <img src={'./benefits/4.webp'} alt={`Free University Logo`} width={'600px'}/>
                <Box m={10} width={'600px'}>
                    <Typography
                        variant='h3'
                        sx={{fontFamily: 'Roboto Slab, serif', fontWeight: 700}}
                        fontWeight={'bold'}
                    >
                        Expert Advice
                    </Typography>
                    <Typography variant='h5'>
                        Get answers from icons like Steve Jobs or Yoda
                    </Typography>
                </Box>
            </Grid2>
        </Grid2>
    )
}

export default Benefits;
