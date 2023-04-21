import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';

import {Graph} from '../types/graph';


interface Props {
    graph: Graph;
}

const DAG = ({graph}: Props) => {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        // Define nodes and links
        let nodes = graph.nodes;
        let links = graph.links;

        const width = 1000; // outer width, in pixels
        const height = 600;
        const linkStroke = '#999';
        const linkStrokeOpacity = 0.6;
        const linkStrokeLinecap = 'round';

        const nodeFill = 'steelblue';
        const nodeStroke = '#fff'; // node stroke color
        const nodeStrokeWidth = 1.5; // node stroke width, in pixels
        const nodeStrokeOpacity = 1; // node stroke opacity
        const nodeRadius = 5; // node radius, in pixels

        function intern(value) {
            return value !== null && typeof value === "object" ? value.valueOf() : value;
        }
        const nodesList = d3.map(nodes, d => d.id).map(intern);
        const linksSource = d3.map(links, ({source}) => source).map(intern);
        const linksTarget = d3.map(links, ({target}) => target).map(intern);
        const titles = d3.map(nodes, d => d.name);

        // Replace the input nodes and links with mutable objects for the simulation.
        nodes = d3.map(nodes, (_, i) => ({id: nodesList[i]}));
        links = d3.map(links, (_, i) => ({source: linksSource[i], target: linksTarget[i]}));

        const forceNode = d3.forceManyBody();
        const forceLink = d3.forceLink(links).id(({index: i}) => nodesList[i]);

        const simulation = d3.forceSimulation(nodes)
            .force("link", forceLink)
            .force("charge", forceNode)
            .force("center",  d3.forceCenter())
            .force("collision", d3.forceCollide(5))
            .on("tick", ticked);

        const svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const link = svg.append("g")
            .attr("stroke", linkStroke)
            .attr("stroke-opacity", linkStrokeOpacity)
            .attr("stroke-width", 2)
            .attr("stroke-linecap", linkStrokeLinecap)
            .selectAll("line")
            .data(links)
            .join("line");

        const node = svg.append("g")
            .attr("fill", nodeFill)
            .attr("stroke", nodeStroke)
            .attr("stroke-opacity", nodeStrokeOpacity)
            .attr("stroke-width", nodeStrokeWidth)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", nodeRadius)
            .call(drag(simulation));

        const labels =svg.selectAll(".texts")
            .data(nodes)
            .enter()
            .append("text")
            .attr("dx", 12)
            .attr("dy", "0.35em")
            .text(({index: i}) => titles[i])
            .call(drag(simulation));

        node.append("title")
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em').
            text(({index: i}) => titles[i]);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        }

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    }, []);

    return (
        <svg ref={ref} width="1000" height="600">
            <g/>
        </svg>
    );
}

export default DAG;
