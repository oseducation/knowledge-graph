import React, {useEffect, useState} from 'react';
import {Box} from '@mui/material';

import Markdown from '../markdown';
import GraphComponent from '../graph/graph_component';
import useGraph from '../../hooks/useGraph';
import {goalGraph} from '../../context/graph_provider';
import {Graph} from '../../types/graph';
import Legend from '../graph/legend';
import useAuth from '../../hooks/useAuth';
import {UserPreferencesDefaultValues} from '../../types/users';

interface Props {
    message: string;
    currentNodeID: string;
    scrollToBottom: () => void;
}

const GraphMessage = (props: Props) => {
    const {pathToGoal, globalGraph, currentGoalID} = useGraph();
    const [graph, setGraph] = useState<Graph | null>(null);
    const {preferences, setPreferences} = useAuth();

    useEffect(() => {
        setGraph(goalGraph(globalGraph, pathToGoal, currentGoalID || ''));
        const timer = setTimeout(() => {
            props.scrollToBottom();
        }, 10);

        return () => clearTimeout(timer);
    }, [globalGraph, currentGoalID]);

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
            <Box sx={{position: 'absolute', m:1, right:0, bottom:0}}>
                <Legend
                    userPreference={preferences !== null ? preferences.legend_on_graph_message : UserPreferencesDefaultValues.legend_on_graph_message}
                    updateUserPreference={(value) => setPreferences && preferences && setPreferences({...preferences, legend_on_graph_message: value})}
                />
            </Box>
        </Box>
    );
}

export default GraphMessage;

