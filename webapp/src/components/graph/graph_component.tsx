import React, {useEffect, useRef, useState} from 'react';
import {Box} from '@mui/material';

import {Graph} from '../../types/graph';
import useWindowDimensions from '../../hooks/use_window_dimensions';

import ForceGraph from './3d_force_graph';

interface GraphComponentProps {
    graph: Graph;
    focusNodeID?: string;
}

const GraphComponent = (props: GraphComponentProps) => {
    const myRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (myRef.current) {
            setWidth(myRef.current.offsetWidth)
        }
    }, []);

    return (
        <Box ref={myRef}>
            <ForceGraph
                graph={props.graph}
                width={width}
                height={windowHeight-64}
                dimension3={false}
                focusNodeID={props.focusNodeID}
            />
        </Box>
    );
}

export default GraphComponent;

