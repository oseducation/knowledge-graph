import React, {useEffect, useState} from 'react';
import {Container, Stack} from '@mui/material';

import {Client} from '../client/client';
import {Graph} from '../types/graph';

import ReactD3Graph from './react_d3_graph';


const GraphComponent = () => {
    const [graph, setGraph] = useState<Graph>({} as Graph);

    useEffect(() => {
        Client.Graph().get().then((data) => {
            setGraph(data);
        });
    },[]);


    if (!graph.nodes){
        return (
            <div>
                Graph
            </div>
        )
    }

    return (
        <Container>
            <Stack width={1000} height={600}  display={'flex'} alignItems={'center'}>
                <ReactD3Graph
                    graph={graph}
                    width={1000}
                    height={600}
                />
            </Stack>
        </Container>
    );
}

export default GraphComponent;

