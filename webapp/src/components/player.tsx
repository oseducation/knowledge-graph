import React from 'react';
import YouTube, {YouTubeProps} from 'react-youtube';

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

type VideoPlayerProps = {
    videoKey: string;
    width: string;
    height: string;
    autoplay: boolean;
    onVideoStarted: () => void;
    onVideoEnded: () => void;
}

const VideoPlayer = (props: VideoPlayerProps) => {
    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            props.onVideoStarted();
        } else if (event.data === window.YT.PlayerState.ENDED) {
            props.onVideoEnded();
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

    return (
        <YouTube
            style={{height: props.width, width: props.height}}
            videoId={props.videoKey}
            id={props.videoKey}
            opts={opts}
            onStateChange={onPlayerStateChange}
        />
    );

};

export default VideoPlayer;
