import React, {useEffect, useState} from 'react';
import YouTube, {YouTubeProps} from 'react-youtube';

import useAuth from '../hooks/useAuth';
import {UserInteraction} from '../types/users';
import {Client} from '../client/client';

import {generateRandomString} from './time_tracker';

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
    onVideoStarted: (videoKey: string) => void;
    onVideoEnded: (videoKey: string) => void;
}

let player: any = null;

const MINIMUM_TIME_SPENT = 1000 * 10; // 10 seconds

const VideoPlayer = (props: VideoPlayerProps) => {
    const [startTime, setStartTime] = useState(0);
    const [id, setID] = useState('')
    const {user} = useAuth();

    useEffect(() => {
        if (player) {
            player.loadVideoById(props.videoKey);
        }
        return () => {
            if (player) {
                player.destroy();
                player = null;
            }
            sendInteraction();
        };
    }, [props.videoKey]);

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

    const onReady = (event: any) => {
        player = event.target
    }

    return (
        <YouTube
            style={{height: props.height, width: props.width}}
            videoId={props.videoKey}
            key={props.id}
            opts={opts}
            onStateChange={onPlayerStateChange}
            onReady={onReady}
            onError={(event)=>{console.log("youtube player error", event)}}
        />
    );

};

export default VideoPlayer;
