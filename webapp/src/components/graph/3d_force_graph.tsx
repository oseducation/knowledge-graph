import React, {useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D, {ForceGraphMethods} from 'react-force-graph-2d';
import {forceCollide} from 'd3';
import {useTheme} from '@mui/material/styles';

import {Graph, Node, Link, NodeStatusFinished, NodeStatusStarted, NodeStatusWatched, NodeStatusNext} from '../../types/graph';

import {GraphNodeHoverContext} from './../main';

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
    const nodeRadius = 30;
    const theme = useTheme();

    const onNodeClick = ({id} : Node) => {
        navigate(`/nodes/${id}`)
    };

    useEffect(() => {
        fgRef.current!.d3Force('collide', forceCollide(50))
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

    const getNodeColor = (node: Node) => {
        if (node.status === NodeStatusFinished) {
            return theme.palette.success.main;
        } else if (node.status === NodeStatusStarted || node.status === NodeStatusWatched){
            return theme.palette.secondary.main;
        } else if (node.status === NodeStatusNext) {
            return theme.palette.primary.main;
        } else {
            return theme.palette.grey[400];
        }
    }

    return (
        <ForceGraph2D
            ref={fgRef}
            graphData={props.graph}
            nodeLabel="description"
            width={props.width}
            height={props.height}
            // linkDirectionalParticles={1}
            linkDirectionalParticleWidth={4}
            linkWidth={2}
            onNodeClick={onNodeClick}
            dagMode={"bu"}
            nodeVal={20}
            nodeCanvasObject={(node, ctx) => {
                const label = node.name;
                const fontSize = 5;
                ctx.font = `${fontSize}px Sans-Serif`;

                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, 2 * Math.PI, false);
                ctx.fillStyle = getNodeColor(node);
                ctx.fill();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText(label, node.x||0, node.y||0);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, 2 * Math.PI, false);
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
