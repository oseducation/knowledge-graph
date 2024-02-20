import React from 'react';
import {Stack, Typography} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

interface Props {
    height: string;
    color: string;
}

const Problem = (props: Props) => {
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
                    {t("90% of Learners Drop Out of Online Courses")}
                </Typography>

                <Typography
                    variant='h5'
                    fontWeight={'bold'}
                    color={'white'}
                >
                    {t("Learners Have Frustration Caused By Unidentified Knowledge Gaps")}
                </Typography>

                <Typography
                    variant='h5'
                    fontWeight={'bold'}
                    color={'white'}
                >
                    {t("Learners Seek For Instant Gratification Like in Duolingo or TikTok")}
                </Typography>

                <Typography
                    variant='h5'
                    fontWeight={'bold'}
                    color={'white'}
                >
                    {t("Learners Want Instant Answers To Their Questions")}
                </Typography>

            </Stack>
        </Grid2>
    )
}

export default Problem;
