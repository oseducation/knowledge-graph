import * as React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';

import useAuth from '../../hooks/useAuth';
import RHS from '../rhs/rhs';
import useGraph from '../../hooks/useGraph';
import GraphComponent from '../graph/graph_component';

const staticHeight = `calc(100vh - (64px))`;

const GraphComp = () => {
    const {user} = useAuth();
    const {globalGraph, onReload, selectedNode} = useGraph();

    return (
        <Grid2 container disableEqualOverflow>
            <Grid2 xs={true} sx={{
                height: staticHeight,
                overflowY: 'hidden',
            }}>
                {globalGraph && globalGraph.nodes?
                    <GraphComponent graph={globalGraph} heightAdjust={64} drawGoalPath={true}/>
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
