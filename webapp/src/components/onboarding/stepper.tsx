import * as React from 'react';
import Box from '@mui/material/Unstable_Grid2/Grid2';
import {Button, LinearProgress, Typography, useTheme} from '@mui/material';
import {alpha} from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


interface Props {
    progress: number;
    onStepBack: () => void;
    title: string;
}

const Stepper = (props: Props) => {
    const theme = useTheme();

    return (
        <Box width={'100%'} pl={10} pr={10}>
            <Box>
                {props.progress > 0 &&
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
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
            }}>
                <LinearProgress
                    variant="determinate"
                    value={props.progress}
                    sx={{
                        height: '6px',
                        width: '100%',
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
            {/* <Typography variant="h6" color="text.secondary" align='center'>
                {props.title}
            </Typography> */}
        </Box>
    );
}

export default Stepper;
