import React, {useEffect, useRef, useState} from 'react';
import {Box} from '@mui/material';

import {Graph} from '../../types/graph';
import useWindowDimensions from '../../hooks/use_window_dimensions';
import {DagMode} from '../../types/users';
import useAppbarHeight from '../../hooks/use_app_bar_height';

import D3ForceGraph from './3d_force_graph';

interface GraphComponentProps {
    graph: Graph;
    hightAdjust?: number;
    noClick?: boolean;
    dir?: DagMode;
    textColor?: string;
    isLarge?: boolean;
}

const GraphComponent = (props: GraphComponentProps) => {
    const myRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();
    const [width, setWidth] = useState(0);
    const appBarHeight = useAppbarHeight();

    useEffect(() => {
        if (myRef.current) {
            setWidth(myRef.current.offsetWidth)
        }
    }, []);

    return (
        <Box ref={myRef}>
            <D3ForceGraph
                graph={props.graph}
                width={width}
                height={props.hightAdjust? windowHeight - props.hightAdjust: windowHeight-appBarHeight}
                dimension3={false}
                noClick={props.noClick}
                dir={props.dir}
                textColor={props.textColor}
                isLarge={props.isLarge}
            />
        </Box>
    );
}

export default GraphComponent;

