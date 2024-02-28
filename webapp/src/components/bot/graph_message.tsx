import React, {useEffect, useState} from 'react';
import {Box} from '@mui/material';

import Markdown from '../markdown';
import GraphComponent from '../graph/graph_component';
import useGraph from '../../hooks/useGraph';
import {goalGraph} from '../../context/graph_provider';
import {Graph} from '../../types/graph';

interface Props {
    message: string;
    currentNodeID: string;
    scrollToBottom: () => void;
}

const GraphMessage = (props: Props) => {
    const {pathToGoal, goals, globalGraph} = useGraph();
    const [graph, setGraph] = useState<Graph | null>(null);

    useEffect(() => {
        setGraph(goalGraph(globalGraph, pathToGoal, goals && goals.length > 0 ? goals[0].node_id : ''));
        const timer = setTimeout(() => {
            props.scrollToBottom();
        }, 10);

        return () => clearTimeout(timer);
    }, [globalGraph, goals && goals.length > 0 ? goals[0].node_id : '']);

    if (!graph) {
        return;
    }

    return (
        <Box display={'flex'} flexDirection={'column'} flexGrow={1}>
            <Markdown text={props.message}/>
            <GraphComponent
                graph={graph}
                height={400}
                drawGoalPath={false}
                noClick={true}
                zoomToFit={300}
                wormupTicks={100}
                cooldownTicks={100}
                currentNodeID={props.currentNodeID}
            />
        </Box>
    );
}

export default GraphMessage;

