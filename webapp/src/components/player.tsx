import React, {useEffect, useState} from 'react';
import YouTube, {YouTubeProps} from 'react-youtube';
import {Box} from '@mui/material';

import useAuth from '../hooks/useAuth';
import {UserInteraction} from '../types/users';
import {Client} from '../client/client';
import useGraph from '../hooks/useGraph';

import {generateRandomString} from './time_tracker';
import VideoOverlay from './player_overlay';
import {vitsiOverviewVideoKey} from './bot/messages';

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

type VideoPlayerProps = {
    id?: string;
    videoKey: string;
    width: string;
    height: string;
    autoplay: boolean;
    loop?: boolean;
    start?: number;
    length?: number;
    onVideoStarted: (videoKey: string) => void;
    onVideoEnded: (videoKey: string) => void;
    name?: string;
}

let player: any = null;

const MINIMUM_TIME_SPENT = 1000 * 10; // 10 seconds

const VideoPlayer = (props: VideoPlayerProps) => {
    const [startTime, setStartTime] = useState(0);
    const [id, setID] = useState('')
    const {user} = useAuth();
    const [once, setOnce] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true);
    const {nextNodeTowardsGoal} = useGraph();

    let title = '';
    if (props.name) {
        title = props.name;
    } else if (nextNodeTowardsGoal) {
        title = nextNodeTowardsGoal.name;
    }
    if (props.videoKey === vitsiOverviewVideoKey) {
        title = 'Vitsi Overview';
    }

    useEffect(() => {
        if (player) {
            player.loadVideoById({
                'videoId': props.videoKey,
                'startSeconds': props.start || 0,
                'endSeconds': props.length ? (props.start || 0) + props.length : undefined
            });
        }
        return () => {
            if (player) {
                player.destroy();
                player = null;
            }
            sendInteraction();
        };
    }, [props.videoKey, props.start]);

    const handleOverlayClick = () => {
        if (player) {
            player.playVideo();  // Start playing the video
        }
        setShowOverlay(false);  // Hide the overlay
    };

    const sendInteraction = () => {
        const endDate = Date.now();
        const timeSpent = endDate - startTime;

        const interaction = {
            id,
            user_id: user?.id,
            start_date: startTime,
            end_date: endDate,
            ui_component_name: 'VideoPlayer',
            url: window.location.href,
            tag: 'video',
        } as UserInteraction;

        if (user?.id && startTime !== 0 && timeSpent >= MINIMUM_TIME_SPENT && id !== '') {
            Client.User().saveInteraction(interaction);
        }
    }

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            if(player && !once) {
                player.seekTo(props.start || 0, true)
                setOnce(true);
            }
            setStartTime(Date.now());
            setID(generateRandomString());
            props.onVideoStarted(props.videoKey);
        } else if (event.data === window.YT.PlayerState.ENDED) {
            sendInteraction();
            setStartTime(0);
            setID('');
            props.onVideoEnded(props.videoKey);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            sendInteraction();
            setStartTime(0);
            setID('');
        }
    };

    const opts: YouTubeProps['opts'] = {
        height: props.height,
        width: props.width,
        playerVars: {}
    };
    if (props.autoplay) {
        opts!.playerVars = {
            autoplay: 1
        }
    }
    if (props.loop) {
        opts!.playerVars!.loop = 1;
        opts!.playerVars!.playlist = props.videoKey;
    }
    if (props.start && props.start != 0) {
        opts!.playerVars!.start = props.start;
    }
    if (props.length && props.length != 0) {
        opts!.playerVars!.end = props.length + (props.start || 0);
    }

    const onReady = (event: any) => {
        player = event.target
    }

    return (
        <Box sx={{ position: 'relative', width: props.width, height: props.height }}>
            <YouTube
                style={{height: props.height, width: props.width}}
                videoId={props.videoKey}
                key={props.id}
                opts={opts}
                onStateChange={onPlayerStateChange}
                onReady={onReady}
                onError={(event)=>{console.log("youtube player error", event)}}
            />
            {showOverlay && !props.autoplay && title && <VideoOverlay text={title} onClick={handleOverlayClick} />}
        </Box>
    );

};

export default VideoPlayer;
