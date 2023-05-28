import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import {Stack} from '@mui/material';

import {Client} from '../../client/client';
import {Graph, Node} from '../../types/graph';

import useWindowDimensions from '../../hooks/use_window_dimensions';

import ForceGraph from './3d_force_graph';
import GraphRHS from './graph_rhs';

type GraphNodeHoverContextType = {
    node: Node;
    setNode: React.Dispatch<React.SetStateAction<Node>>;
}
export const GraphNodeHoverContext = React.createContext<GraphNodeHoverContextType>({node: {} as Node, setNode: ()=>{}});

const GraphComponent = () => {
    const [graph, setGraph] = useState<Graph>({} as Graph);
    const [node, setNode] = useState<Node>({} as Node);
    const myRef = useRef<HTMLDivElement>(null);
    const [parentWidth, setParentWidth] = useState(0);
    const {windowHeight} = useWindowDimensions();

    useEffect(() => {
        Client.Graph().get().then((data) => {
            setGraph(data);
        });
    },[]);

    useLayoutEffect(() => {
        if (myRef.current){
            setParentWidth(myRef.current.offsetWidth);
        }
    }, [myRef.current]);


    if (!graph.nodes){
        return (
            <div>
                Graph
            </div>
        )
    }

    return (
        <Stack width='100%' height={windowHeight*2/3}  display={'flex'} alignItems={'center'} direction={'row'}>
            <GraphNodeHoverContext.Provider value={{node, setNode}}>
                <Stack width='75%' height={windowHeight*2/3} direction={'column'} ref={myRef}>
                    <ForceGraph
                        graph={graph}
                        width={parentWidth}
                        height={windowHeight*2/3}
                        dimension3={false}
                    />
                </Stack>
                <Stack width='25%' height={windowHeight*2/3} direction={'column'}>
                    <GraphRHS/>
                </Stack>
            </GraphNodeHoverContext.Provider>
        </Stack>
    );
}

export default GraphComponent;

