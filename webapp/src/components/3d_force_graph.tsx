import React from 'react';
import {useNavigate} from 'react-router-dom';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';

import {Graph, Node} from '../types/graph';

interface Props {
    graph: Graph;
    width: number;
    height: number;
    d3: boolean;
}

const D3ForceGraph = (props: Props) => {
    const navigate = useNavigate();

    const onNodeClick = ({id} : Node) => {
        navigate(`/nodes/${id}`)
    };

    if (props.d3) {
        return (
            <ForceGraph3D
                graphData={props.graph}
                nodeLabel="name"
                showNavInfo={false}
                width={props.width}
                height={props.height}
                dagMode="zout"
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={2}
                linkWidth={2}
                onNodeClick={onNodeClick}
                nodeAutoColorBy={"node_type"}
            />
        );
    }
    return (
        <ForceGraph2D
            graphData={props.graph}
            nodeLabel="description"
            width={props.width}
            height={props.height}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkWidth={2}
            onNodeClick={onNodeClick}
            dagMode='lr'
            nodeVal={20}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12/globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(node.x||0 - bckgDimensions[0] / 2, node.y||0 - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText(label, node.x||0, node.y||0);

                node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                if (bckgDimensions) {
                    ctx.fillRect(node.x||0 - bckgDimensions[0] / 2, node.y||0 - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                }
            }}
            nodeAutoColorBy={"node_type"}
        />
    )

}

export default D3ForceGraph;
