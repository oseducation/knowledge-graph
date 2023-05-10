import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Graph as ReactD3GraphComponent} from "react-d3-graph";

import {Graph, Node} from '../types/graph';

interface Props {
    graph: Graph;
    width: number;
    height: number;
}

const ReactD3Graph = (props: Props) => {
    const navigate = useNavigate();

    const labelProperty = (node: Node) => {
        return node.name;
    }

    const onClickNode = (id: string) => {
        navigate(`/nodes/${id}`)
    };

    const config = {
        nodeHighlightBehavior: true,
        node: {
            color: "lightgreen",
            size: 120,
            highlightStrokeColor: "blue",
            labelProperty: labelProperty,
        },
        link: {
            highlightColor: "lightblue",
        },
        directed: true,
        panAndZoom: true,
        automaticRearrangeAfterDropNode: true,
        width: props.width,
        height: props.height,
    };

    return (
        <ReactD3GraphComponent
            id="graph-id"
            data={props.graph}
            config={config}
            onClickNode={onClickNode}
        />
    );
}

export default ReactD3Graph;
