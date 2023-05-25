import React, {useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D, {ForceGraphMethods} from 'react-force-graph-2d';
import {forceCollide} from 'd3';

import {Graph, Node, Link} from '../types/graph';

import {GraphNodeHoverContext} from './graph';

interface Props {
    graph: Graph;
    width?: number;
    height?: number;
    dimension3: boolean;
}

const D3ForceGraph = (props: Props) => {
    const navigate = useNavigate();
    const fgRef = useRef<ForceGraphMethods<Node, Link>>();
    const {setNode} = React.useContext(GraphNodeHoverContext);


    const onNodeClick = ({id} : Node) => {
        navigate(`/nodes/${id}`)
    };

    useEffect(() => {
        fgRef.current!.d3Force('collide', forceCollide(13))
    },[]);

    if (props.dimension3) {
        return (
            <ForceGraph3D
                graphData={props.graph}
                nodeLabel="name"
                showNavInfo={false}
                height={props.height}
                dagMode="zout"
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={2}
                // d3VelocityDecay={0.3}
                linkWidth={2}
                onNodeClick={onNodeClick}
                nodeAutoColorBy={"status"}
            />
        );
    }
    return (
        <ForceGraph2D
            ref={fgRef}
            graphData={props.graph}
            nodeLabel="description"
            width={props.width}
            height={props.height}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={4}
            linkWidth={2}
            onNodeClick={onNodeClick}
            dagMode={"lr"}
            nodeVal={20}
            nodeCanvasObject={(node, ctx) => {
                const label = node.name;
                const fontSize = 5;
                ctx.font = `${fontSize}px Sans-Serif`;

                const r = 5;

                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, r, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(31, 120, 180, 0.92)';
                ctx.fill();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText(label, node.x||0, node.y||0);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                const r = 5
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, r, 0, 2 * Math.PI, false);
                ctx.fill();
            }}
            nodeAutoColorBy={"status"}
            nodeRelSize={1}
            dagLevelDistance={50}
            d3VelocityDecay={0.3}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            onNodeHover={(node: Node | null) => {
                if (node) {
                    setNode(node)
                }
            }}
        />
    )

}

export default D3ForceGraph;
