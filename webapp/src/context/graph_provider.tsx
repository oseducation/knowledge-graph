
import React, {createContext, useEffect, useState} from 'react';

import {Client} from "../client/client";
import {Graph, Link, Node, NodeStatusFinished, NodeStatusNext, NodeStatusStarted, NodeStatusWatched, NodeTypeLecture, NodeTypeExample, NodeTypeAssignment, castToLink} from '../types/graph';
import useAuth from '../hooks/useAuth';

interface GraphContextState {
    graph: Graph | null;
    pathToGoal: Map<string, string> | null;
    goal: string | null;
    onReload: () => void;
}

const GraphContext = createContext<GraphContextState>({
    graph: null,
    pathToGoal: null,
    goal: null,
    onReload: () => {},
});

interface Props {
    children: React.ReactNode
}

export const GraphProvider = (props: Props) => {
    const [graph, setGraph] = useState<Graph | null>(null);
    const [pathToGoal, setPathToGoal] = useState<Map<string, string> | null>(null);
    const [goal, setGoal] = useState<string | null>(null);
    const [reload, setReload] = useState<boolean>(false);
    const {preferences} = useAuth();

    const onReload = () => {
        setPathToGoal(null);
        setGraph(null);
        setReload(prev => !prev);
    }

    const fetchGraphData = async () => {
        Client.Graph().get().then((data: Graph | null) => {
            setGraph(data);
            if (!data) {
                return;
            }
            if (pathToGoal) {
                return;
            }
            Client.Graph().getGoal().then((goal: string) => {
                // assuming we have a single goal here
                if (goal) {
                    const computedPathToGoal = compute(data, goal);
                    setPathToGoal(computedPathToGoal);
                    setGoal(goal);
                }
            });
        });
    }

    useEffect(() => {
        if (!graph || !pathToGoal) {
            fetchGraphData();
        }
    }, [reload, preferences?.language])

    return (
        <GraphContext.Provider value={{graph, pathToGoal, onReload, goal}}>
            {props.children}
        </GraphContext.Provider>
    );
}

export default GraphContext;


function topologicalSort(neighbors: Map<string, string[]>, start: string): string[] {
    const stack: string[] = [];
    const visited: { [key: string]: boolean } = {};

    function visit(node: string) {
        if (!visited[node]) {
            visited[node] = true;
            for (const neighbor of neighbors.get(node) || []) {
                visit(neighbor);
            }
            stack.push(node);
        }
    }

    visit(start);
    return stack.reverse();
}

const allPreviousNodes = (reverseNeighbors: Map<string, string[]>, goalNodeID: string) => {
    const visited: { [key: string]: boolean } = {};
    const queue: string[] = [goalNodeID];
    const nodes: Map<string, boolean> = new Map();

    while (queue.length > 0) {
        const currentNode = queue.shift()!;
        if (!visited[currentNode]) {
            visited[currentNode] = true;
            nodes.set(currentNode, true);

            const neighbors = reverseNeighbors.get(currentNode) || [];
            for (const neighbor of neighbors) {
                if (!visited[neighbor]) {
                    queue.push(neighbor);
                }
            }
        }
    }

    return nodes;
}

const compute = (graph: Graph, goalNodeID: string) => {
    const neighbors = generateGraph(graph.nodes, graph.links)
    const reverseNeighbors = generateReverseGraph(graph.nodes, graph.links)

    let start = ''
    for (const node of graph.nodes) {
        if (reverseNeighbors.get(node.id)?.length === 0) {
            start = node.id;
            break;
        }
    }

    const topologicallySortedNodes = topologicalSort(neighbors, start)
    const prevNodes = allPreviousNodes(reverseNeighbors, goalNodeID)

    const pathToGoalList = [];
    for (const node of topologicallySortedNodes) {
        if (prevNodes.has(node)){
            pathToGoalList.push(node);
        }
    }

    const pathToGoal = new Map<string, string>();

    for (let i = 0; i < pathToGoalList.length - 1; i++){
        pathToGoal.set(pathToGoalList[i], pathToGoalList[i+1])
    }

    return pathToGoal;
}

export const computeNextNodeInProgress = (graph: Graph, pathToGoal: Map<string, string>) => {
    const [inProgressNodes, ] = computeNextNodes(graph);
    if (!inProgressNodes || inProgressNodes.length === 0) {
        return null;
    }

    for (const node of inProgressNodes) {
        if (pathToGoal.has(node.id)) {
            return node;
        }
    }
}

export const computeNextNodeNew = (graph: Graph, pathToGoal: Map<string, string>) => {
    const [, nextNodes] = computeNextNodes(graph);
    if (!nextNodes || nextNodes.length === 0) {
        return null;
    }

    for (const node of nextNodes) {
        if (pathToGoal.has(node.id)) {
            return node;
        }
    }
}

export const computeNextNode = (graph: Graph | null, pathToGoal: Map<string, string> | null, goal: string | null) => {
    if (graph === null || pathToGoal === null || goal === null) {
        return null;
    }
    const [inProgressNodes, nextNodes] = computeNextNodes(graph);

    if (inProgressNodes && inProgressNodes.length !== 0) {
        for (const node of inProgressNodes) {
            if (pathToGoal.has(node.id)) {
                return node.id;
            } else if (node.id === goal) {
                return node.id;
            }
        }
    }
    if (nextNodes && nextNodes.length !== 0) {
        for (const node of nextNodes) {
            if (pathToGoal.has(node.id)) {
                return node.id;
            } else if (node.id === goal) {
                return node.id;
            }
        }
    }

    return "";
}

export const computeNextNodes = (graph: Graph) => {
    const nodesMap = new Map<string, Node>();
    graph.nodes.forEach((node) => {
        nodesMap.set(node.id, node)
    })

    const prereqMap = new Map<string, Node>();
    for (let i = 0; i < graph.links.length; i++) {
        const link = castToLink(graph.links[i]);
        const tar = nodesMap.get(link.target);
        if (tar === undefined || tar.status === NodeStatusFinished) {
            continue
        }
        const sou = nodesMap.get(link.source);
        if (sou === undefined || sou.status === NodeStatusFinished) {
            continue
        }
        prereqMap.set(tar.id, tar);
    }

    const inProgressNodes = [];
    const nextNodes = [];
    for (let i = 0; i < graph.nodes.length; i++) {
        const node = graph.nodes[i];
        if (node.status === NodeStatusStarted || node.status === NodeStatusWatched) {
            inProgressNodes.push(node);
        } else if (!prereqMap.has(node.id) && node.status !== NodeStatusFinished) {
            nextNodes.push(node);
            node.status = NodeStatusNext;
        }
    }
    nextNodes.sort(nodeCmpFn);
    inProgressNodes.sort(nodeCmpFn);

    return [inProgressNodes, nextNodes];
}

const nodeCmpFn = (a: Node, b: Node) => {
    if (a.node_type === b.node_type) {
        const name1 = a.name.toUpperCase();
        const name2 = b.name.toUpperCase();
        if (name1 > name2) {
            return 1;
        } else if (name1 < name2) {
            return -1;
        } else {
            return 0;
        }
    }
    const nodeTypeMap = new Map();

    nodeTypeMap
        .set(NodeTypeLecture, 3)
        .set(NodeTypeExample, 2)
        .set(NodeTypeAssignment, 1);
    return nodeTypeMap.get(a.node_type) - nodeTypeMap.get(b.node_type);
}

const generateReverseGraph = (nodes: Node[], links: Link[]): Map<string, string[]> => {
    const graph: Map<string, string[]> = new Map();

    // Initialize the graph with empty arrays for each node
    for (const node of nodes) {
        graph.set(node.id, []);
    }

    // Populate the graph based on the links
    for (const l of links) {
        const link = castToLink(l)
        if (graph.has(link.source) && graph.has(link.target)) {
            graph.get(link.target)!.push(link.source);
        }
    }

    return graph;
}


const generateGraph = (nodes: Node[], links: Link[]): Map<string, string[]> => {
    const graph: Map<string, string[]> = new Map();

    // Initialize the graph with empty arrays for each node
    for (const node of nodes) {
        graph.set(node.id, []);
    }

    // Populate the graph based on the links
    for (const l of links) {
        const link = castToLink(l)
        if (graph.has(link.source) && graph.has(link.target)) {
            graph.get(link.source)!.push(link.target);
        }
    }

    return graph;
}
