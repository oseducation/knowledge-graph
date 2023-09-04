import React from 'react';
import {Box, IconButton} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

interface Props {
    onRun: () => void;
    onStop: () => void;
}

const IDEActions = (props: Props) => {
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
            <IconButton onClick={props.onRun} aria-label="run" color="secondary" size="large" sx={{backgroundColor:'white'}}>
                <DirectionsRunIcon/>
            </IconButton>
            <IconButton onClick={props.onStop} aria-label="open" color="secondary" size="large" sx={{backgroundColor:'white'}}>
                <FolderOpenIcon/>
            </IconButton>
        </Box>
    )

}

export default IDEActions;
