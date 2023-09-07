import React from 'react';
import {Box, IconButton, Slider, Typography} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ReplayIcon from '@mui/icons-material/Replay';
import RestorePageIcon from '@mui/icons-material/RestorePage';

interface Props {
    onRun: () => void;
    onSpeedChange: (value: number) => void;
    onResetWorld: () => void;
    onResetCode: () => void;
}

const IDEActions = (props: Props) => {

    const handleChange = (event: Event, value: number | number[]) => {
        props.onSpeedChange(value as number);
    };

    return (
        <Box
            id='groups'
            width={64}
            sx={{
                flexDirection: 'column',
                height: '100%',
                direction: 'column',
                bgcolor: 'primary.dark',
            }}
            display={'flex'}

        >
            <IconButton onClick={props.onRun} aria-label="run"  size="large" sx={{color:'white'}}>
                <DirectionsRunIcon/>
            </IconButton>
            <Box display={'flex'} flexDirection={'column'} alignContent={'center'} alignItems={'center'}>
                <Typography sx={{color:'white'}}>Speed</Typography>
                <Slider
                    onChange={handleChange}
                    orientation="vertical"
                    defaultValue={30}
                    sx={{color:'white', height: 100, m: 1}}
                />
            </Box>
            <IconButton onClick={props.onResetWorld} aria-label="run"  size="large" sx={{color:'white'}}>
                <ReplayIcon/>
            </IconButton>
            <IconButton onClick={props.onResetCode} aria-label="run"  size="large" sx={{color:'white'}}>
                <RestorePageIcon/>
            </IconButton>
        </Box>
    )

}

export default IDEActions;
