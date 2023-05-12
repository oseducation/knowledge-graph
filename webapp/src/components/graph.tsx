import React, {useEffect, useState} from 'react';
import {Container, Stack} from '@mui/material';

import {Client} from '../client/client';
import {Graph} from '../types/graph';

import ReactD3Graph from './react_d3_graph';
import ForceGraph from './3d_force_graph';

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
            <Stack width={1000} height={1800}  display={'flex'} alignItems={'center'}>
                <ForceGraph
                    graph={graph}
                    width={1000}
                    height={600}
                    d3={false}
                />
                <ForceGraph
                    graph={graph}
                    width={1000}
                    height={600}
                    d3={true}
                />
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

