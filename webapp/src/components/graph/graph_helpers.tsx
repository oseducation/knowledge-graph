import {allPreviousNodes, generateGraph, generateReverseGraph} from "../../context/graph_provider";
import {Graph, Link, NodeStatusFinished, NodeStatusStarted, cloneGraph} from "../../types/graph";

type AdjacencyList = { [key: string]: string[] };

const buildAdjacencyList = (links: Link[]): AdjacencyList => {
    const adjacencyList: AdjacencyList = {};
    links.forEach(({ sourceID, targetID }) => {
        if (!adjacencyList[sourceID]) {
            adjacencyList[sourceID] = [];
        }
        if (!adjacencyList[targetID]) {
            adjacencyList[targetID] = [];
        }
        adjacencyList[sourceID].push(targetID);
    });
    return adjacencyList;
};

export const findCycles = (links: Link[]): string[][] => {
    const adjacencyList = buildAdjacencyList(links);
    const visited: Set<string> = new Set();
    const stack: Set<string> = new Set();
    const result: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
        if (stack.has(node)) {
            // Cycle detected
            const cycleStartIndex = path.indexOf(node);
            const cycle = path.slice(cycleStartIndex);
            result.push(cycle);
            return;
        }

        if (visited.has(node)) {
            return;
        }

        visited.add(node);
        stack.add(node);

        const neighbors = adjacencyList[node];
        for (const neighbor of neighbors) {
            dfs(neighbor, [...path, neighbor]);
        }

        stack.delete(node);
    };

    for (const node in adjacencyList) {
        if (!visited.has(node)) {
            dfs(node, [node]);
        }
    }

    return result;
};

export const findRedundantLinks = (links: Link[]): Link[] => {
    const result = [];
    for (let i=0; i<links.length; i++) {
        const linksClone = clone(links);
        const temp = linksClone[i].target;
        linksClone[i].target = linksClone[i].source;
        linksClone[i].source = temp;
        const cycles = findCycles(linksClone);
        if (cycles.length > 0) {
            result.push(links[i]);
            console.log('Cycle found:', cycles, links[i])
        }
    }
    return result
}

export const updateGraph = (graph: Graph, nodeID: string, isRightChoice: boolean): Graph => {
    const g = cloneGraph(graph);
    if (isRightChoice) {
        const reverseNeighbors = generateReverseGraph(g.nodes, g.links)
        const path = allPreviousNodes(reverseNeighbors, nodeID);
        for (const [n] of path){
            for (const node of g.nodes){
                if (node.nodeID === n){
                    node.status = NodeStatusFinished;
                }
            }
        }
    } else {
        const neighbors = generateGraph(g.nodes, g.links)
        let path = allPreviousNodes(neighbors, nodeID);
        for (const [n] of path){
            for (const node of g.nodes){
                if (node.nodeID === n){
                    node.status = NodeStatusStarted;
                }
            }
        }
        const reverseNeighbors = generateReverseGraph(g.nodes, g.links)
        path = allPreviousNodes(reverseNeighbors, nodeID);
        for (const [n] of path){
            for (const node of g.nodes){
                if (node.nodeID === n && node.status !== NodeStatusFinished){
                    node.status = NodeStatusStarted;
                }
            }
        }
    }

    return g;
}


const clone = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
}

// const cloneGraph = (graph: Graph): Graph => {
//     const nodes = graph.nodes.map(node => {
//         return {
//             id: node.id,
//             name: node.name,
//             status: node.status,
//             description: node.description,
//             node_type: node.node_type,
//             parent_id: node.parent_id,
//         }
//     });
//     const links = graph.links.map(link => {
//         return {
//             source: link.source,
//             target: link.target,
//         }
//     });
//     return {
//         nodes,
//         links,
//     }
// }
