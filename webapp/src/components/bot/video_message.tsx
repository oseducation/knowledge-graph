import React from 'react';
import {Box} from '@mui/material';

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
}

const VideoMessage = (props: Props) => {
    const {user} = useAuth();
    const nodeID = props.post.props.node_id;
    const videoKey = props.post.props.video_key;
    const start = props.post.props.start;
    const length = props.post.props.length;

    const {message} = useMessageReveal(props.post.message, props.isLast, props.scrollToBottom);

    if (props.post.post_type !== PostTypeVideo) {
        return null;
    }

    const onVideoStarted = (videoKey: string) => {
        if (user && user.id) {
            Client.Node().markAsStarted(nodeID, user.id);
            Client.Video().videoStarted(videoKey);
        }
    }

    const onVideoEnded = (videoKey: string) => {
        if (user && user.id) {
            Client.Node().markAsWatched(nodeID, user.id);
            Client.Video().videoFinished(videoKey);
        }
    }

    return (
        <Box display={'flex'} flexDirection={'column'}>
            <Markdown text={message}/>
            <Box sx={{
                width: {xs: '280px', sm: '500px', md: '600px', lg: '800px'},
                height: {xs: '200px', sm: '400px', md: '500px', lg: '600px'}
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
            </Box>
        </Box>
    );
}

export default VideoMessage;

