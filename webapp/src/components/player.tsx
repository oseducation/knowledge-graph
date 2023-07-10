import React, {useEffect} from 'react';
import YouTube, {YouTubeProps} from 'react-youtube';

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

const VideoPlayer = (props: VideoPlayerProps) => {
    useEffect(() => {
        if (player) {
            player.loadVideoById(props.videoKey);
        }
        return () => {
            if (player) {
                player.destroy();
                player = null;
            }
        };
    }, [props.videoKey]);

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            props.onVideoStarted(props.videoKey);
        } else if (event.data === window.YT.PlayerState.ENDED) {
            props.onVideoEnded(props.videoKey);
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
            style={{height: props.width, width: props.height}}
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
