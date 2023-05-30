import React, {useEffect, useState} from 'react';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import {Client} from '../client/client';
import useAuth from '../hooks/useAuth';
import {User} from '../types/users';
import {Graph, Node, NodeStatusFinished, NodeStatusNext, NodeStatusStarted, NodeStatusWatched} from '../types/graph';
import {GroupItem, InProgressNodesCategoryName, NextNodesCategoryName, SidebarGroup} from '../types/sidebar';

import LHSNavigation from './lhs/lhs_navigation';
import GraphComponent from './graph/graph_component';
import RHS from './rhs/rhs';
import NodeDropDownMenu from './node_drop_down';

type GraphNodeHoverContextType = {
    node: Node;
    setNode: React.Dispatch<React.SetStateAction<Node>>;
}
export const GraphNodeHoverContext = React.createContext<GraphNodeHoverContextType>({node: {} as Node, setNode: ()=>{}});

const computeGroups = (graph: Graph, userID: string, onReload: () => void) => {
    const nodesMap = new Map<string, Node>();
    graph.nodes.forEach((node) => {nodesMap.set(node.id, node)})

    const prereqMap = new Map<string, Node>();
    for (let i = 0; i < graph.links.length; i++) {
        const link = graph.links[i];
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

    const inProgressItems = inProgressNodes.map((node) => {
        return {
            areaLabel: node.name,
            display_name: node.name,
            id: node.id,
            link: node.id,
            itemMenu:
                <NodeDropDownMenu
                    nodeID={node.id}
                    userID={userID}
                    onReload={onReload}
                />
        } as GroupItem;
    });

    const inProgressGroup = {
        collapsed: false,
        display_name: "Nodes In Progress",
        id: InProgressNodesCategoryName,
        items: inProgressItems
    } as SidebarGroup;

    const nextItems = nextNodes.map((node) => {
        return {
            areaLabel: node.name,
            display_name: node.name,
            id: node.id,
            link: node.id,
            itemMenu:
            <NodeDropDownMenu
                nodeID={node.id}
                userID={userID}
                onReload={onReload}
            />
        } as GroupItem;
    });

    const nextGroup = {
        collapsed: false,
        display_name: "Next Nodes",
        id: NextNodesCategoryName,
        items: nextItems
    } as SidebarGroup;

    return [inProgressGroup, nextGroup];
}

const useGraph = (reload: boolean, user: User | null, handleReload: () => void) => {
    type GraphDataType = {
        graph: Graph;
        groups: SidebarGroup[];
    }

    const [graphData, setGraphData] = useState<GraphDataType>({} as GraphDataType);

    useEffect(() => {
        if (user) {
            Client.Graph().get().then((data: Graph) => {
                setGraphData({graph: data, groups: computeGroups(data, user.id, handleReload)})
            });
        }
    },[reload, user]);

    return graphData;
}

const Main = () => {
    const [node, setNode] = useState<Node>({} as Node);
    const [reload, setReload] = useState<boolean>(false);
    const {user} = useAuth()

    const handleReload = () => {
        setReload(prev => !prev);
    };

    const {graph, groups} = useGraph(reload, user, handleReload);

    return (
        <GraphNodeHoverContext.Provider value={{node, setNode}}>
            <Grid2 container>
                <Grid2 xs={3} sx={{maxWidth: '240px'}}>
                    <LHSNavigation groups={groups}/>
                </Grid2>
                <Grid2 xs={true}>
                    <GraphComponent graph={graph}/>
                </Grid2>
                <Grid2 xs={4} sx={{maxWidth: '400px'}}>
                    <RHS/>
                </Grid2>
            </Grid2>
        </GraphNodeHoverContext.Provider>
    );
}

export default Main;

