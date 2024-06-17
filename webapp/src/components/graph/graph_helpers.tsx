import {allPreviousNodes, generateGraph, generateReverseGraph} from "../../context/graph_provider";
import {Goal, Graph, Link, NodeStatusFinished, NodeStatusStarted, cloneGraph} from "../../types/graph";

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

export const filterGraphByGoals = (graph: Graph, goals: Goal[]): Graph => {
    const parentIDs = new Map<string, boolean>();
    for (const goal of goals) {
        const parentID = getParentIDForNode(graph, goal.node_id);
        if (parentID) {
            parentIDs.set(parentID, true);
        } else {
            console.log(`Parent node not found for goal: ${goal.node_id} - ${goal.name}`);
        }
    }
    return filterGraphByParentIDs(graph, parentIDs);
}

const filterGraphByParentIDs = (graph: Graph, parentIDs: Map<string, boolean>): Graph => {
    const newNodes = [];
    const newNodesMap = new Map<string, boolean>();
    for (const node of graph.nodes) {
        if (parentIDs.has(node.parent_id)) {
            newNodes.push(node);
            newNodesMap.set(node.nodeID, true);
        }
    }

    return {
        nodes: newNodes,
        links: filterLinksByNodes(graph.links, newNodesMap),
    };
}

export const filterGraphByParentName = (graph: Graph, parentName: string) => {
    const parentID = getParentID(graph, parentName);
    if (parentID) {
        return filterGraphByParent(graph, parentID);
    }
    return graph;
}

export const filterGraphByParent = (graph: Graph, parentID: string) => {
    return filterGraphByParentIDs(graph, new Map([[parentID, true]]));
}

export const getParentID = (graph: Graph, parentName: string) => {
    for (const node of graph.nodes) {
        if (node.parent_id === "" && node.name === parentName) {
            return node.nodeID;
        }
    }
}

const getParentIDForNode = (graph: Graph, nodeID: string) => {
    for (const node of graph.nodes) {
        if (node.nodeID === nodeID) {
            return node.parent_id;
        }
    }
}

const filterLinksByNodes = (links: Link[], nodesMap: Map<string, boolean>): Link[] => {
    const newLinks = [];
    for (const link of links) {
        if (nodesMap.has(link.sourceID) && nodesMap.has(link.targetID)) {
            newLinks.push(link);
        }
    }
    return newLinks;
}



const clone = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
}


