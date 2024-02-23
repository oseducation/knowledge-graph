import * as React from 'react';
import {useEffect} from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';

import useAuth from '../../hooks/useAuth';
import RHS from '../rhs/rhs';
import useGraph from '../../hooks/useGraph';
import GraphComponent from '../graph/graph_component';
import {getGraphForParent} from '../../context/graph_provider';
import {Graph} from '../../types/graph';

const staticHeight = `calc(100vh - (64px))`;

const GraphComp = () => {
    const {user} = useAuth();
    const {globalGraph, onReload, selectedNode} = useGraph();
    const [startupGraph, setStartupGraph] = React.useState<Graph | null>(null);

    useEffect(() => {
        if (!globalGraph){
            return;
        }
        for(const node of globalGraph.nodes) {
            if(node.name === 'Intro to Startups' && node.parent_id === '') {
                const g = getGraphForParent(globalGraph, node.id);
                setStartupGraph(g);
                return;
            }
        }
    }, [globalGraph]);

    return (
        <Grid2 container disableEqualOverflow>
            <Grid2 xs={true} sx={{
                height: staticHeight,
                overflowY: 'hidden',
            }}>
                {startupGraph && startupGraph.nodes?
                    <GraphComponent graph={startupGraph} heightAdjust={64} drawGoalPath={true}/>
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
