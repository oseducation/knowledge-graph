import * as React from 'react';
import Box from '@mui/material/Unstable_Grid2/Grid2';
import {Button, LinearProgress, Typography, useTheme} from '@mui/material';
import {alpha} from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';

interface Props {
    onBoardingProgress: number;
    questionsProgress: number;
    onStepBack: () => void;
}

const Stepper = (props: Props) => {
    const theme = useTheme();

    let title = 'Profile Setup'
    if (props.onBoardingProgress === 100) {
        title = '2 Minute Quiz'
    }
    if (props.questionsProgress > 100) {
        title = 'Registration'
    }

    return (
        <Box width={'100%'} pl={10} pr={10}>
            <Box>
                {props.onBoardingProgress > 0 &&
                    <Button
                        aria-label="back"
                        variant="text"
                        startIcon={<ArrowBackIcon/>}
                        sx={{position: 'absolute', left:0, ml:10, mt:1}}
                        onClick={props.onStepBack}
                    >
                        Back
                    </Button>
                }
                <Typography variant="h3" color='primary' align='center'>
                    VitsiAI
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1
            }}>
                <LinearProgress
                    variant="determinate"
                    value={props.onBoardingProgress}
                    sx={{
                        height: '6px',
                        width: '30%',
                        ml:'8px',
                        borderRadius: '5px',
                        backgroundColor: alpha(theme.palette.primary.light, 0.5),
                        '& .MuiLinearProgress-bar': {
                            borderRadius: '5px',
                            backgroundColor: theme.palette.primary.main,
                        },
                    }}
                />
                {props.questionsProgress > 0 || props.onBoardingProgress === 100 ?
                    <CheckIcon sx={{width: '12px', height:'12px', ml:'1px', mr:'1px'}}/>
                    :
                    <Box
                        sx={{
                            width: '12px',
                            height: '12px',
                            border: `2px solid ${theme.palette.primary.main}`,
                            borderRadius: '50%',
                            display: 'inline-block',
                            marginLeft: '1px',
                            marginRight: '1px',
                            padding: 0,
                        }}
                    />
                }
                <LinearProgress
                    variant="determinate"
                    value={Math.min(props.questionsProgress, 100)}
                    sx={{
                        height: '6px',
                        width: '70%',
                        borderRadius: '5px',
                        mr:'8px',
                        backgroundColor: alpha(theme.palette.primary.light, 0.5),
                        '& .MuiLinearProgress-bar': {
                            borderRadius: '5px',
                            backgroundColor: theme.palette.primary.main,
                        },
                    }}
                />

                {/* <Typography variant="body1" color="text.secondary">
                    {Math.floor(props.progress)}%
                </Typography> */}
            </Box>
            <Typography variant="h6" color={'secondary'} align='center'>
                {title}
            </Typography>
        </Box>
    );
}

export default Stepper;


