import * as React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import {Box} from '@mui/material';

import useAuth from '../../hooks/useAuth';
import RHS from '../rhs/rhs';
import useGraph from '../../hooks/useGraph';
import GraphComponent from '../graph/graph_component';
import Legend from '../graph/legend';
import { UserPreferencesDefaultValues } from '../../types/users';

const staticHeight = `calc(100vh - (64px))`;

const GraphComp = () => {
    const {user, preferences, setPreferences} = useAuth();
    const {globalGraph, onReload, selectedNode} = useGraph();

    return (
        <Grid2 container disableEqualOverflow>
            <Grid2 xs={true} sx={{
                height: staticHeight,
                overflowY: 'hidden',
            }}>
                {globalGraph && globalGraph.nodes?
                    <Box display={'flex'} flexDirection={'column'} flexGrow={1}>
                        <GraphComponent graph={globalGraph} heightAdjust={64} drawGoalPath={true}/>
                        <Box sx={{position: 'absolute', m:1, bottom:0}}>
                            <Legend
                                userPreference={preferences !== null ? preferences.legend_on_topic_graph : UserPreferencesDefaultValues.legend_on_topic_graph}
                                updateUserPreference={(value) => setPreferences && preferences && setPreferences({...preferences, legend_on_topic_graph: value})}
                            />
                        </Box>
                    </Box>
                    :
                    <div>Loading Graph...</div>
                }
            </Grid2>
            <Grid2 xs={3} sx={{
                height: staticHeight,
                overflowY: 'auto',
                maxWidth: '400px',
                display: {xs: 'none', sm: 'none', md: 'none', lg: 'block'}
            }}>
                {selectedNode && selectedNode.id &&
                    <RHS
                        userID={user?.id || ''}
                        onReload={onReload}
                    /> }
            </Grid2>
        </Grid2>
    );
}

export default GraphComp;
