import React, {useRef} from 'react';
import {Box} from '@mui/material';

import {Graph} from '../../types/graph';
import useWindowDimensions from '../../hooks/use_window_dimensions';

import ForceGraph from './3d_force_graph';

interface GraphComponentProps {
    graph: Graph;
}


const GraphComponent = (props: GraphComponentProps) => {
    const myRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();

    if (!props.graph || !props.graph.nodes){
        return (
            <div>
                Graph
            </div>
        )
    }

    return (
        <Box ref={myRef}>
            <ForceGraph
                graph={props.graph}
                width={myRef.current?.offsetWidth || 0}
                height={windowHeight}
                dimension3={false}
            />
        </Box>
    );
}

export default GraphComponent;

