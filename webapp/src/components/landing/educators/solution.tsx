import React from 'react';
import {Stack, Typography} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';

interface Props {
    height: string;
    color: string;
}

const Solution = (props: Props) => {
    const {t} = useTranslation();

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='problem-section'
            height={props.height}
            bgcolor={props.color}
            padding={0}
            sx={{scrollSnapAlign: 'start'}}

        >
            <Stack
                m={{xs: 0, sm: 4, md: 10}}
                justifyContent={'center'}
            >
                <Typography
                    variant='h3'
                    fontWeight={'bold'}
                    color={'black'}
                    p={'30px 0'}
                >
                    {t("We Represent Course As a Map of 5-Minute Topics")}
                </Typography>

                <Stack direction={'row'}>
                    <CheckIcon sx={{color: '#03045e'}}/>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'black'}
                    >
                        {t("Learners See What They Know and What They Don't")}
                    </Typography>
                </Stack>
                <Stack direction={'row'}>
                    <CheckIcon sx={{color: '#03045e'}}/>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'black'}
                    >
                        {t("They Advance Through Topics Like in a Game Levels")}
                    </Typography>
                </Stack>
                <Stack direction={'row'}>
                    <CheckIcon sx={{color: '#03045e'}}/>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'black'}
                    >
                        {t("AI Tutor Guides Learners and Answers Any Question")}
                    </Typography>
                </Stack>
            </Stack>
        </Grid2>
    )
}

export default Solution;
