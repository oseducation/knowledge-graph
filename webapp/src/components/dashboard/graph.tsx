import * as React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import {useState } from 'react';

import useAuth from '../../hooks/useAuth';
import RHS from '../rhs/rhs';
import useGraph from '../../hooks/useGraph';
import GraphComponent from '../graph/graph_component';
import {GraphNodeHoverContext} from '../main';
import {Node} from '../../types/graph';

const staticHeight = `calc(100vh - (64px))`;

const GraphComp = () => {
    const [node, setNode] = useState<Node>({} as Node);
    const {user} = useAuth();
    const {graph, onReload} = useGraph();

    return (
        <GraphNodeHoverContext.Provider value={{node, setNode}}>

            <Grid2 container disableEqualOverflow>
                <Grid2 xs={true} sx={{
                    height: staticHeight,
                    overflowY: 'hidden',
                }}>
                    {graph && graph.nodes?
                        <GraphComponent graph={graph} hightAdjust={64}/>
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
                    {node && node.id &&
                        <RHS
                            userID={user?.id || ''}
                            onReload={onReload}
                        /> }
                </Grid2>
            </Grid2>
        </GraphNodeHoverContext.Provider>
    );
}

export default GraphComp;
