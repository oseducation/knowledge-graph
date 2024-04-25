import React, {useEffect, useRef, useState} from 'react';
import {Box, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import useAuth from '../../hooks/useAuth';
import {Client} from '../../client/client';
import {Post, PostTypeVideo} from '../../types/posts';
import Markdown from '../markdown';
import VideoPlayer from '../player';

import useMessageReveal from './use_message_reveal';

interface Props {
    post: Post;
    isLast: boolean;
    scrollToBottom: () => void;
    addScrollListener?: (a: ()=>void) => void;
    removeScrollListener?: (a: ()=>void) => void;
    isLastVideo?: boolean;
}

const VideoMessage = (props: Props) => {
    const {user} = useAuth();
    const nodeID = props.post.props.node_id;
    const videoKey = props.post.props.video_key;
    const start = props.post.props.start;
    const length = props.post.props.length;
    const videoRef = useRef<HTMLDivElement>(null);
    const [isFloating, setIsFloating] = useState<boolean>(false);
    const [open, setOpen] = useState(false);

    const {message} = useMessageReveal(props.post.message, props.isLast, props.scrollToBottom);

    useEffect(() => {
        if (!props.isLastVideo || !props.addScrollListener || !props.removeScrollListener){
            return;
        }
        props.addScrollListener(handleScroll);
        return () => {
            if (props.removeScrollListener) {
                props.removeScrollListener(handleScroll);
            }
        }
    }, []);

    const handleScroll = () => {
        if (!videoRef.current) return;

        const {bottom} = videoRef.current.getBoundingClientRect();
        setIsFloating(bottom < 50);
    };


    if (props.post.post_type !== PostTypeVideo) {
        return null;
    }

    const onVideoStarted = (videoKey: string) => {
        if (user && user.id && nodeID) {
            Client.Node().markAsStarted(nodeID, user.id);
            Client.Video().videoStarted(videoKey);
        }
    }

    const onVideoEnded = (videoKey: string) => {
        if (user && user.id && nodeID) {
            Client.Node().markAsWatched(nodeID, user.id);
            Client.Video().videoFinished(videoKey);
        }
    }
    const floatingStyle = isFloating && !open && !props.isLast? {
        position: 'fixed',
        top: '40px',
        right: '0',
        width: {xs: '280px', sm: '400px'},
        height: {xs: '200px', sm: '300px'},
        zIndex: 1000,
        margin: '20px'
    } : {};

    return (
        <Box display={'flex'} flexDirection={'column'}>
            <Markdown text={message}/>
            <div ref={videoRef}>
                {isFloating &&
                    <Box sx={{
                        width: {xs: '280px', sm: '500px', md: '600px', lg: '800px'},
                        height: {xs: '200px', sm: '400px', md: '500px', lg: '600px'},
                    }}/>
                }
                <Box sx={{
                    width: {xs: '280px', sm: '500px', md: '600px', lg: '800px'},
                    height: {xs: '200px', sm: '400px', md: '500px', lg: '600px'},
                    ...floatingStyle
                }}>
                    <VideoPlayer
                        videoKey={videoKey}
                        start={start}
                        length={length}
                        width={'100%'}
                        height={'100%'}
                        autoplay={false}
                        onVideoStarted={onVideoStarted}
                        onVideoEnded={onVideoEnded}
                    />
                    {isFloating &&
                        <IconButton
                            onClick={() => {
                                setOpen(true);
                            }}
                            size="small"
                            sx={{position: 'absolute', top: '-20px', right: '-20px', margin: '-2px'}}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                </Box>
            </div>
        </Box>
    );
}

export default VideoMessage;

