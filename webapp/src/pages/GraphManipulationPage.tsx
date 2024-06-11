import React, {useEffect, useState} from 'react';
import {Box, Toolbar} from '@mui/material';

import {Client} from '../client/client';
import {Graph, NodeStatusFinished, NodeStatusUnseen} from '../types/graph';
import GraphComponent from '../components/graph/graph_component';
import {filterGraph} from '../context/graph_provider';
import DashboardHeader from '../components/dashboard/dashboard_header';

const GraphManipulationPage = () => {
    const [graph, setGraph] = useState({} as Graph);

    useEffect(() => {
        Client.Graph().getStaticGraph().then((data) => {
            const filteredGraph = filterGraph(data);
            setGraph(filteredGraph)
        });
    }, []);

    return (
        <>
            <Box sx={{height: '64px'}}>
                <Toolbar disableGutters>
                    <DashboardHeader/>
                </Toolbar>
            </Box>
            {graph && graph.nodes?
                <GraphComponent
                    graph={graph}
                    drawGoalPath={false}
                    // noClick={true}
                    onClick={(node) => {
                        console.log(node);
                        if (node.status === NodeStatusFinished) {
                            node.status = NodeStatusUnseen
                        } else {
                            node.status = NodeStatusFinished
                        }
                    }}
                />
                :
                <div>Loading Graph...</div>
            }
        </>
    );
}

export default GraphManipulationPage;
