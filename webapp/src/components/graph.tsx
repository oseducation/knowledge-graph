import React, {useEffect, useState} from 'react';
import {Container, Stack} from '@mui/material';

import {Client} from '../client/client';
import {Graph} from '../types/graph';

import DAG from './force_graph';


const GraphComponent = () => {
    const [graph, setGraph] = useState<Graph>({} as Graph);

    useEffect(() => {
        Client.Graph().get().then((data) => {
            setGraph(data.data);
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
                <DAG graph={graph}/>
            </Stack>
        </Container>
    );
}

export default GraphComponent;

