import React, {useEffect, useState} from 'react';
import {Stack} from '@mui/material';

import {NodeWithResources} from '../types/graph';
import {Client} from '../client/client';

interface Props {
    nodeID: string;
}

const Node = (props: Props) => {
    if (!props.nodeID) {
        return null;
    }

    const [node, setNode] = useState<NodeWithResources>({} as NodeWithResources);

    useEffect(() => {
        Client.Node().get(props.nodeID).then((data) => {
            setNode(data);
        });
    },[]);

    return (
        <Stack>
            <h2>{node.name}</h2>
            <p>{node.description}</p>
            <div>
                {node.videos && node.videos.map((video) => (
                    <div key={video.key}>
                        <iframe
                            width='560'
                            height='315'
                            src={`https://www.youtube.com/embed/${video.key}`}
                            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        />
                    </div>
                ))}
            </div>
        </Stack>
    )
}

export default Node;
