import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface VideoOverlayProps {
    text: string;
    onClick: () => void;  // Function to call when the overlay is clicked
}

const VideoOverlay = (props: VideoOverlayProps) => {
    return (
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
                cursor: 'pointer',  // Make it clear that the overlay is clickable
            }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection='column'
            onClick={props.onClick}
        >
            <Typography variant="h4" sx={{textAlign: 'center', padding: '20px', display: {xs: 'none', sm: 'block'}}}>
                {props.text}
            </Typography>
            <Box>
                <img src="https://www.gstatic.com/youtube/img/branding/favicon/favicon_144x144.png"/>
            </Box>
        </Box>
    );
};

export default VideoOverlay;
