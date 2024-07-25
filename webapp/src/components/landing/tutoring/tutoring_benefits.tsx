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
            bgcolor={theme.palette.background.paper}
            padding={0}
            sx={{scrollSnapAlign: 'start'}}
            display={'flex'}
            flexDirection={'column'}
            justifyItems={'center'}
            justifyContent={'center'}
            alignContent={'center'}
        >
            <Box
                component='section'
                display={'flex'}
                flexDirection={{xs:'column', sm:'column', md:'column', lg:'row'}}
                gap={{xs: 4, sm: 4, md: 10}}
                ml={{xs: 4, sm: 4, md: 10, lg: 20}}
                mr={{xs: 4, sm: 4, md: 10, lg: 20}}
                alignItems={'center'}
                mt={8}
            >
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    gap={4}
                >
                    <Typography
                        variant='h2'
                        sx={{fontFamily: 'Roboto Slab, serif', fontSize: '36px'}}
                        fontWeight={'bold'}
                        color={theme.palette.primary.main}
                    >
                        Learn from CS professors directly
                    </Typography>
                    <Typography
                        variant='body1'
                        fontSize={'17px'}
                        lineHeight={'24px'}
                        color={theme.palette.getContrastText(theme.palette.background.default)}
                    >
                        Set your goals with CS professors experienced in cutting-edge technology, identify knowledge gaps and learn only what you need, plan your career.
                    </Typography>
                </Box>
                <Box width={{xs:'300px', sm:'400px', md:'600px', lg:'800px'}}>
                    <img src={'./benefits/1.png'} width={'100%'}/>
                </Box>
            </Box>

            <Box
                component='section'
                display={'flex'}
                flexDirection={{xs:'column', sm:'column', md:'column', lg:'row-reverse'}}
                gap={{xs: 4, sm: 4, md: 10}}
                ml={{xs: 4, sm: 4, md: 10, lg: 20}}
                mr={{xs: 4, sm: 4, md: 10, lg: 20}}
                alignItems={'center'}
            >
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    gap={4}
                >
                    <Typography
                        variant='h2'
                        sx={{fontFamily: 'Roboto Slab, serif', fontSize: '36px'}}
                        fontWeight={'bold'}
                        color={theme.palette.primary.main}
                    >
                        Master topics
                    </Typography>
                    <Typography
                        variant='body1'
                        fontSize={'17px'}
                        lineHeight={'24px'}
                        color={theme.palette.getContrastText(theme.palette.background.default)}
                    >
                        Learn topics with quick, 5-minute lessons one at a time and earn experience
                    </Typography>
                </Box>
                <Box width={{xs:'300px', sm:'400px', md:'600px', lg:'800px'}}>
                    <img src={'./benefits/2.png'} width={'100%'}/>
                </Box>
            </Box>

            <Box
                component='section'
                display={'flex'}
                flexDirection={{xs:'column', sm:'column', md:'column', lg:'row'}}
                gap={{xs: 4, sm: 4, md: 10}}
                ml={{xs: 4, sm: 4, md: 10, lg: 20}}
                mr={{xs: 4, sm: 4, md: 10, lg: 20}}
                alignItems={'center'}
                mt={8}
            >
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    gap={4}
                >
                    <Typography
                        variant='h2'
                        sx={{fontFamily: 'Roboto Slab, serif', fontSize: '36px'}}
                        fontWeight={'bold'}
                        color={theme.palette.primary.main}
                    >
                        Unlock skill tree
                    </Typography>
                    <Typography
                        variant='body1'
                        fontSize={'17px'}
                        lineHeight={'24px'}
                        color={theme.palette.getContrastText(theme.palette.background.default)}
                    >
                        Stay motivated by turning learning into a game and progressing in your skill tree
                    </Typography>
                </Box>
                <Box width={{xs:'300px', sm:'400px', md:'600px', lg:'800px'}}>
                    <img src={'./benefits/3.png'} width={'100%'}/>
                </Box>
            </Box>

            <Box
                component='section'
                display={'flex'}
                flexDirection={{xs:'column', sm:'column', md:'column', lg:'row-reverse'}}
                gap={{xs: 4, sm: 4, md: 10}}
                ml={{xs: 4, sm: 4, md: 10, lg: 20}}
                mr={{xs: 4, sm: 4, md: 10, lg: 20}}
                alignItems={'center'}
            >
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    gap={4}
                >
                    <Typography
                        variant='h2'
                        sx={{fontFamily: 'Roboto Slab, serif', fontSize: '36px'}}
                        fontWeight={'bold'}
                        color={theme.palette.primary.main}
                    >
                        Attend unlimited 1:1 sessions
                    </Typography>
                    <Typography
                        variant='body1'
                        fontSize={'17px'}
                        lineHeight={'24px'}
                        color={theme.palette.getContrastText(theme.palette.background.default)}
                    >
                        Attend unlimited one-on-one chat and video calls with your professors, where you can discuss anything and everything.
                    </Typography>
                </Box>
                <Box width={{xs:'300px', sm:'400px', md:'600px', lg:'800px'}}>
                    <img src={'./benefits/4.png'} width={'100%'}/>
                </Box>
            </Box>
        </Grid2>
    )
}

export default Benefits;
