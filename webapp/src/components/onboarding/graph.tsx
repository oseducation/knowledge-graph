import React,{useEffect, useState} from 'react';
import {Typography, Box} from '@mui/material';

import {Graph} from '../../types/graph';
import {Client} from '../../client/client';
import {filterGraph} from '../../context/graph_provider';
import GraphComponent from '../graph/graph_component';

const OnboardingGraph = () => {
    const [graph, setGraph] = useState<Graph | null>(null);

    useEffect(() => {
        Client.Graph().getStaticGraph().then((data: Graph | null) => {
            if (!data) {
                setGraph(null);
                return;
            }
            setGraph(filterGraph(data));
        });
    }, [])
    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} width={'400px'} mt={6}>
            <Box flexGrow={1}>
                {graph && graph.nodes?
                    <GraphComponent
                        graph={graph}
                        drawGoalPath={false}
                        noClick={true}
                        heightAdjust={100}
                        height={400}
                    />
                    :
                    <div>Loading Graph...</div>
                }
            </Box>
            <Typography variant='h5' fontWeight={'bold'} m={1}>
                {"These are all the topics you should know to ace the GMAT, you can see how the topics are connected with each other."}
            </Typography>
        </Box>
    );
}

export default OnboardingGraph;

