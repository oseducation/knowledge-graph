import React, { useEffect, useState } from 'react';

import { getVideoUrl } from '../utils';
import { Client } from '../client/client';

import LinkFallback from './link_fallback';

interface Props {
    fallback: boolean
    videoProps: Record<string, any>;
    children: React.ReactNode;
}

const VideoFallback = ({fallback, videoProps, children}: Props) => {
    const [text, setText] = useState<string>('')
    
    const videoKey = videoProps.video_key as string;
    const start = videoProps.start as number;
    const length = videoProps.length as number;
    const nodeID = videoProps.node_id as string;

    const link = getVideoUrl(videoKey, start, length);

    const getNodeData = async (nodeID: string) => {
        if(nodeID){
            const {name} = await Client.Node().get(nodeID)
            setText(name)
        }
    }

    useEffect(()=>{
        if(fallback){
            getNodeData(nodeID)
        }
    }, [fallback])
    
    return (<LinkFallback fallback={fallback} link={link} text={text}>
        {children}
    </LinkFallback>)
};


export default VideoFallback;
