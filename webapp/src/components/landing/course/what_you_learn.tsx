import React from 'react';
import {Stack, Typography} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';

interface Props {
    height: string;
    color: string;
}

const WhatYouLearn = (props: Props) => {
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
                    color={'white'}
                    p={'30px 0'}
                >
                    {t("What You'll Learn")}
                </Typography>

                <Stack direction={'row'}>
                    <CheckIcon sx={{color: 'white'}}/>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'white'}
                    >
                        {t("Getting and Evaluating Startup Ideas")}
                    </Typography>
                </Stack>
                <Stack direction={'row'}>
                    <CheckIcon sx={{color: 'white'}}/>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'white'}
                    >
                        {t("Planning an MVP and Launching")}
                    </Typography>
                </Stack>
                <Stack direction={'row'}>
                    <CheckIcon sx={{color: 'white'}}/>
                    <Typography
                        variant='h5'
                        fontWeight={'bold'}
                        color={'white'}
                    >
                        {t("Growth and Fundraising")}
                    </Typography>
                </Stack>
            </Stack>
        </Grid2>
    )
}

export default WhatYouLearn;
