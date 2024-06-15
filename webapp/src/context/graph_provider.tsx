
import React, {createContext, useEffect, useState} from 'react';

import {Client} from "../client/client";
import {Graph, Link, Node, NodeStatusFinished, NodeStatusNext, NodeStatusStarted, NodeStatusWatched, NodeTypeLecture, NodeTypeExample, NodeTypeAssignment, castToLink, Goal, cloneGraph, NodeStatusUnseen, NodeWithResources} from '../types/graph';
import useAuth from '../hooks/useAuth';

interface GraphContextState {
    globalGraph: Graph | null;
    graph: Graph | null;
    setParentID: React.Dispatch<React.SetStateAction<string>>
    pathToGoal: Map<string, string> | null;
    goals: Goal[];
    currentGoalID: string | null;
    setCurrentGoal: (goal: Goal) => void;
    nextNodeTowardsGoal: NodeWithResources | null;
    onReload: () => void;
    // addGoal: (goal: Goal) => void;
    removeGoal: (goal: string) => void;
    selectedNode: Node | null;
    setSelectedNode: (node: Node | null) => void;
    focusedNodeID: string;
    setFocusedNodeID: (nodeID: string) => void;
}

const GraphContext = createContext<GraphContextState>({
    globalGraph: null,
    graph: null,
    setParentID: () => {},
    pathToGoal: null,
    goals: [],
    currentGoalID: null,
    setCurrentGoal: () => {},
    nextNodeTowardsGoal: null,
    onReload: () => {},
    // addGoal: () => {},
    removeGoal: () => {},
    selectedNode: null,
    setSelectedNode: () => {},
    focusedNodeID: '',
    setFocusedNodeID: () => {},
});

interface Props {
    children: React.ReactNode
}

export const GraphProvider = (props: Props) => {
    const [graphState, setGraphState] = useState<GraphContextState>({} as GraphContextState);
    const [reload, setReload] = useState<boolean>(false);
    const {user, preferences} = useAuth();

    const onReload = () => {
        setGraphState({} as GraphContextState);
        setReload(prev => !prev);
    }

    const setCurrentGoal = (newGoal: Goal) => {
        if (!graphState.globalGraph) {
            return;
        }
        if (newGoal.node_id === graphState.currentGoalID) {
            return;
        }

        const computedPathToGoal = computePathToGoal(graphState.globalGraph, newGoal.node_id);
        const nextNodeID = nextNodeToGoal(graphState.globalGraph, computedPathToGoal, newGoal.node_id);
        if (!nextNodeID) {
            return;
        }
        const exists = graphState.goals.find(goal => goal.node_id === newGoal.node_id);
        let newGoals = graphState.goals;
        if (!exists) {
            newGoals = [newGoal, ...graphState.goals];
        }

        Client.Node().get(nextNodeID).then((node) => {
            setGraphState({...graphState, pathToGoal: computedPathToGoal, goals: newGoals, nextNodeTowardsGoal: node, currentGoalID: newGoal.node_id});
        });
    }

    const removeGoal = (goal: string) => {
        if (!graphState.globalGraph) {
            return;
        }
        const newGoals = graphState.goals.filter(value => value.node_id !== goal)
        if (graphState.currentGoalID == goal && newGoals.length > 0) {
            const computedPathToGoal = computePathToGoal(graphState.globalGraph, newGoals[0].node_id);
            const nextNodeID = nextNodeToGoal(graphState.globalGraph, computedPathToGoal, newGoals[0].node_id);
            if (!nextNodeID) {
                setGraphState({...graphState, pathToGoal: computedPathToGoal, goals: newGoals, currentGoalID: newGoals[0].node_id});
                return;
            }
            Client.Node().get(nextNodeID).then((node) => {
                setGraphState({...graphState, pathToGoal: computedPathToGoal, goals: newGoals, nextNodeTowardsGoal: node, currentGoalID: newGoals[0].node_id});
            }).catch(() => {
                setGraphState({...graphState, pathToGoal: computedPathToGoal, goals: newGoals, nextNodeTowardsGoal: null, currentGoalID: newGoals[0].node_id});
            });
        } else {
            setGraphState({...graphState, goals: newGoals});
        }
    }

    const fetchGraphData = async () => {
        Client.Graph().get().then((data: Graph | null) => {
            if (!data) {
                setGraphState({} as GraphContextState);
                return;
            }
            const filteredGraph = filterGraph(data);
            const updatedGraph = getGraphWithUpdatedNodeStatuses(filteredGraph)

            Client.Graph().getGoals().then((newGoals: Goal[]) => {
                if (newGoals && newGoals.length > 0) {
                    const computedPathToGoal = computePathToGoal(updatedGraph, newGoals[0].node_id);
                    const nextNodeID = nextNodeToGoal(updatedGraph, computedPathToGoal, newGoals.length > 0 ? newGoals[0].node_id : '');
                    if (nextNodeID) {
                        Client.Node().get(nextNodeID).then((node) => {
                            setGraphState({...graphState, globalGraph: updatedGraph, pathToGoal: computedPathToGoal, goals: newGoals, nextNodeTowardsGoal: node, currentGoalID: newGoals[0].node_id});
                        }).catch(error => {
                            console.log('error fetching next node', error)
                            setGraphState({} as GraphContextState);
                        });
                    } else {
                        console.log('no next Node ID, should not happen', updatedGraph, computedPathToGoal, newGoals[0].node_id);
                        setGraphState({} as GraphContextState);
                    }
                }
            }).catch(error => {
                console.log('error fetching goals', error)
                setGraphState({} as GraphContextState);
            });
        }).catch(error => {
            console.log('error fetching graph', error)
            setGraphState({} as GraphContextState);
        });
    }

    useEffect(() => {
        if (!graphState.globalGraph || !graphState.pathToGoal || !graphState.nextNodeTowardsGoal) {
            fetchGraphData();
        }
    }, [reload, preferences?.language, user?.id])

    const setSelectedNode = (node: Node | null) => {
        setGraphState({...graphState, selectedNode: node});
    }

    const setFocusedNodeID = (nodeID: string) => {
        setGraphState({...graphState, focusedNodeID: nodeID});
    }

    return (
        <GraphContext.Provider value={{
            globalGraph:graphState.globalGraph,
            graph: graphState.graph,
            setParentID: ()=>{},
            pathToGoal: graphState.pathToGoal,
            onReload,
            goals: graphState.goals,
            currentGoalID: graphState.currentGoalID,
            setCurrentGoal,
            nextNodeTowardsGoal: graphState.nextNodeTowardsGoal,
            // addGoal,
            removeGoal,
            selectedNode: graphState.selectedNode,
            setSelectedNode,
            focusedNodeID: graphState.focusedNodeID,
            setFocusedNodeID
        }}>
            {props.children}
        </GraphContext.Provider>
    );
}

export default GraphContext;

export const getGraphForParent = (graph: Graph, parentID: string) => {
    const nodes = graph.nodes.filter(node => node.parent_id === parentID);
    const links = [];
    for (const link of graph.links) {
        if (nodes.find(node => node.id === link.source) && nodes.find(node => node.id === link.target)) {
            links.push(link);
        }
    }
    return cloneGraph({nodes, links});
}

export const filterGraph = (graph: Graph) => {
    for (const node of graph.nodes) {
        if (node.parent_id === "" && node.name === "Intro to Startups") {
            return getGraphForParent(graph, node.id);
        }
    }
    return graph;
}

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

export const allPreviousNodes = (reverseNeighbors: Map<string, string[]>, goalNodeID: string) => {
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

export const computePathToGoal = (graph: Graph, goalNodeID: string) => {
    const neighbors = generateGraph(graph.nodes, graph.links)
    const reverseNeighbors = generateReverseGraph(graph.nodes, graph.links)

    let start = ''
    for (const node of graph.nodes) {
        if (reverseNeighbors.get(node.id)?.length === 0 && node.parent_id !== "") {
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

export const nextNodeToGoal = (graph: Graph | null, pathToGoal: Map<string, string> | null, goalNodeID: string) => {
    if (graph === null || pathToGoal === null) {
        return null;
    }
    const [inProgressNodes, nextNodes] = computeNextNodes(graph);
    if (goalNodeID === "") {
        if (inProgressNodes && inProgressNodes.length !== 0) {
            return inProgressNodes[0].id;
        } else if (nextNodes && nextNodes.length !== 0) {
            return nextNodes[0].id;
        }
        return null;
    }

    if (inProgressNodes && inProgressNodes.length !== 0) {
        for (const node of inProgressNodes) {
            if (pathToGoal.has(node.id)) {
                return node.id;
            } else if (node.id === goalNodeID) {
                return node.id;
            }
        }
    }
    if (nextNodes && nextNodes.length !== 0) {
        for (const node of nextNodes) {
            if (pathToGoal.has(node.id)) {
                return node.id;
            } else if (node.id === goalNodeID) {
                return node.id;
            }
        }
    }

    return null;
}

export const goalGraph = (graph: Graph | null, pathToGoal: Map<string, string> | null, goalNodeID: string) => {
    const goalNodes = [];
    const goalLinks = [];
    for (const node of graph?.nodes || []) {
        if (pathToGoal?.has(node.id) || node.id == goalNodeID) {
            goalNodes.push(node);
        }
    }

    for (const generalLink of graph?.links || []) {
        const link = castToLink(generalLink);
        if (goalNodes.find(node => node.id === link.source) && goalNodes.find(node => node.id === link.target)) {
            goalLinks.push(link);
        }
    }

    return cloneGraph({nodes: goalNodes, links: goalLinks});
}


const computeParentMap = (graph: Graph) => {
    const parentMap = new Map<string, Node[]>();
    for (const node of graph.nodes) {
        if (!parentMap.has(node.id)) {
            parentMap.set(node.id, []);
        }
        if (!parentMap.has(node.parent_id)) {
            parentMap.set(node.parent_id, []);
        }
        parentMap.get(node.parent_id)!.push(node);
    }
    return parentMap;
}

const computeNextNodes = (graph: Graph) => {
    const inProgressNodes = [];
    const nextNodes = [];
    for (const node of graph.nodes) {
        if(node.parent_id !== "") {
            if (node.status === NodeStatusStarted || node.status === NodeStatusWatched) {
                inProgressNodes.push(node);
            } else if (node.status === NodeStatusNext) {
                nextNodes.push(node);
            }
        }
    }
    nextNodes.sort(nodeCmpFn);
    inProgressNodes.sort(nodeCmpFn);

    return [inProgressNodes, nextNodes];
}

const getGraphWithUpdatedNodeStatuses = (graph: Graph) => {
    const nodeStatuses = getNodeStatuses(graph);
    const updatedGraph = cloneGraph(graph);
    for (const node of updatedGraph.nodes) {
        node.status = nodeStatuses.get(node.id) || NodeStatusUnseen;
    }
    return updatedGraph;
}

const getNodeIDToNodeMap = (graph: Graph): Map<string, Node> => {
    const nodesMap = new Map<string, Node>();
    graph.nodes.forEach((node) => {
        if (node.parent_id !== "") {
            nodesMap.set(node.id, node)
        }
    })
    return nodesMap
}

const getNodesWithNotFinishedPrerequisites = (links: Link[], nodesMap: Map<string, Node>): Map<string, Node> => {
    const nodesWithNotFinishedPrereqs = new Map<string, Node>();
    for (let i = 0; i < links.length; i++) {
        const link = castToLink(links[i]);
        const tar = nodesMap.get(link.target);
        if (tar === undefined || tar.status === NodeStatusFinished) {
            continue
        }
        const sou = nodesMap.get(link.source);
        if (sou === undefined || sou.status === NodeStatusFinished) {
            continue
        }
        nodesWithNotFinishedPrereqs.set(tar.id, tar);
    }
    return nodesWithNotFinishedPrereqs;
}

const getNodeStatuses = (graph: Graph): Map<string, string> => {
    const nodeStatuses = new Map<string, string>();
    const nodesMap = getNodeIDToNodeMap(graph);
    const nodesWithNotFinishedPrereqs = getNodesWithNotFinishedPrerequisites(graph.links, nodesMap);

    // for child nodes
    for (const node of graph.nodes) {
        if (node.parent_id === "") {
            continue
        }
        if (!nodesWithNotFinishedPrereqs.has(node.id) && node.status !== NodeStatusFinished) {
            nodeStatuses.set(node.id, NodeStatusNext);
        } else {
            nodeStatuses.set(node.id, node.status);
        }
    }

    const parentMap = computeParentMap(graph);
    // for parent nodes
    for (const node of graph.nodes) {
        if (node.parent_id !== "") {
            continue
        }

        const children = parentMap.get(node.id) || []
        if (children.length === 0) {
            continue
        }

        // check if parent node is finished(all children are finished)
        let allChildrenFinished = true;
        for (const child of children) {
            if (nodeStatuses.has(child.id) && nodeStatuses.get(child.id) !== NodeStatusFinished) {
                allChildrenFinished = false;
                break
            }
        }
        if (allChildrenFinished){
            nodeStatuses.set(node.id, NodeStatusFinished);
            continue
        }

        // check if parent node is started(at least one child is started)
        for (const child of children) {
            if (nodeStatuses.has(child.id) && (nodeStatuses.get(child.id) === NodeStatusStarted || nodeStatuses.get(child.id) === NodeStatusWatched)) {
                nodeStatuses.set(node.id, NodeStatusStarted);
                break
            }
        }

        // check if parent node is next(at least one child is next)
        for (const child of children) {
            if (nodeStatuses.has(child.id) && nodeStatuses.get(child.id) === NodeStatusNext) {
                node.status = NodeStatusNext;
                break
            }
        }
    }

    return nodeStatuses;
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

export const generateReverseGraph = (nodes: Node[], links: Link[]): Map<string, string[]> => {
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


export const generateGraph = (nodes: Node[], links: Link[]): Map<string, string[]> => {
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
