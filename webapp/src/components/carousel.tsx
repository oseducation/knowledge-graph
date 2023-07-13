import React, {useState, useEffect} from 'react';
import {useSwipeable} from 'react-swipeable';
import {Container, IconButton} from '@mui/material';
import {ArrowBackIos, ArrowForwardIos} from '@mui/icons-material';

import {History} from '../types/history';
import {Client} from '../client/client';
import useAuth from '../hooks/useAuth';

import VideoPlayer from './player';

const history = new History();

const Carousel = () => {
    const [videoID, setVideoID] = useState('');
    const {preferences} = useAuth();

    useEffect(() => {
        // Fetch initial video ID
        fetchNextVideo()
    }, []);

    const handlers = useSwipeable({
        onSwipedUp: () => fetchNextVideo(),
        onSwipedDown: () => getPreviousVideo(),
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    const fetchNextVideo = () => {
        Client.Video().getNextVideo().then(data => {
            history.Save(data);
            setVideoID(data);
        })
    };

    const getNextVideo = () => {
        if (history.HasNext()) {
            const nextVideoID = history.GetNext();
            if (nextVideoID !== videoID) {
                setVideoID(nextVideoID);
            }
        } else {
            fetchNextVideo();
        }
    }

    const getPreviousVideo = () => {
        if (history.HasPrevious()) {
            const prevVideoID = history.GetPrevious();
            if (videoID !== prevVideoID) {
                setVideoID(prevVideoID);
            }
        }
    };

    if (!videoID) {
        return null; // Or a loading spinner, etc.
    }

    return (
        <div {...handlers}>
            <Container style={{height: '100%', display: 'flex', alignItems: 'center'}}>
                <IconButton onClick={getPreviousVideo}>
                    <ArrowBackIos/>
                </IconButton>
                <VideoPlayer
                    videoKey={videoID}
                    width={'100%'}
                    height={'600px'}
                    autoplay={true}
                    loop={preferences?.is_video_looped}
                    onVideoEnded={()=>{}}
                    onVideoStarted={()=>{}}
                />
                <IconButton onClick={getNextVideo}>
                    <ArrowForwardIos/>
                </IconButton>
            </Container>
        </div>
    );
};

export default Carousel;
