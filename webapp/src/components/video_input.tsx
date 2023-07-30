import React, {useState} from 'react';
import {Container, TextField, Typography, Button, Snackbar, Alert} from '@mui/material';

import {Client} from '../client/client';

interface Props {
    nodeID: string;
}

const VideoInput = (props: Props) => {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleClick = () => {
        try {
            const urlObj = new URL(inputValue);
            const params = new URLSearchParams(urlObj.search);
            const videoID = params.get('v');
            if (videoID) {
                Client.Node().addVideoToNode(props.nodeID, videoID).catch(() => {
                    setOpen(true);
                });
            }
        } catch {
            setOpen(true);
        }
    };

    return (
        <Container style={{display: 'flex', alignItems: 'center'}}>
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{width: '100%'}}>
                    Please insert youtube video url
                </Alert>
            </Snackbar>
            <Typography>
                Do you know the better way to explain this topic? Please upload the YouTube video here:
            </Typography>
            <TextField
                inputProps={{
                    inputMode: 'url',
                    autoSave: 'off',
                    autoCorrect: 'off',
                    placeholder: 'https://www.youtube.com/watch?v=XXXXXXX'
                }}
                sx={{
                    m: 2,
                    width: '300px'
                }}
                id="youtube-video-upload"
                variant="outlined"
                value={inputValue}
                onChange={handleInputChange}
            />
            <Button variant="contained" onClick={handleClick}>Upload Video</Button>
        </Container>
    );
}

export default VideoInput;
