import React, {useEffect, useState} from 'react';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {Box, Drawer, useTheme} from '@mui/material';
import {useTranslation} from 'react-i18next';

import {Client} from '../client/client';
import useAuth from '../hooks/useAuth';
import {Graph, Node, NodeStatusFinished, NodeStatusNext, NodeStatusStarted, NodeStatusWatched} from '../types/graph';
import {GroupItem, InProgressNodesCategoryName, NextNodesCategoryName, SidebarGroup} from '../types/sidebar';
import useDrawer from '../hooks/useDrawer';

import LHSNavigation from './lhs/lhs_navigation';
import GraphComponent from './graph/graph_component';
import RHS from './rhs/rhs';
import NodeDropDownMenu from './node_drop_down';


type GraphNodeHoverContextType = {
    node: Node;
    setNode: React.Dispatch<React.SetStateAction<Node>>;
}
export const GraphNodeHoverContext = React.createContext<GraphNodeHoverContextType>({
    node: {} as Node, setNode: () => {
    }
});

const useGraph = (reload: boolean, computeGroups: (graph: Graph) => SidebarGroup[], language?: string) => {
    type GraphDataType = {
        graph: Graph;
        groups: SidebarGroup[];
    }

    const [graphData, setGraphData] = useState<GraphDataType>({} as GraphDataType);

    useEffect(() => {
        Client.Graph().get().then((data: Graph) => {
            setGraphData({graph: data, groups: computeGroups(data)})
        });

    }, [reload, language]);

    return graphData;
}

const nodeCmpFn = (a: Node, b:Node) => {
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
        .set('lecture', 3)
        .set('example', 2)
        .set('assignment', 1);
    return nodeTypeMap.get(a.node_type) - nodeTypeMap.get(b.node_type);
}

const Main = () => {
    const [node, setNode] = useState<Node>({} as Node);
    const [focusedNodeID, setFocusedNodeID] = useState<string>('');
    const [reload, setReload] = useState<boolean>(false);
    const {user, preferences} = useAuth();
    const {open, setOpen} = useDrawer();
    const {t} = useTranslation();

    const {
        mixins: {toolbar},
    } = useTheme();

    const handleReload = () => {
        setReload(prev => !prev);
    };

    const handleDrawerToggle = () => {
        setOpen?.(!open);
    };

    const computeGroups = (graph: Graph) => {
        const nodesMap = new Map<string, Node>();
        graph.nodes.forEach((node) => {
            nodesMap.set(node.id, node)
        })

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
        nextNodes.sort(nodeCmpFn);
        inProgressNodes.sort(nodeCmpFn);

        const inProgressItems = inProgressNodes.map((node) => {
            return {
                areaLabel: node.name,
                display_name: node.name,
                id: node.id,
                link: node.id,
                itemMenu:
                    <NodeDropDownMenu
                        nodeID={node.id}
                        userID={user!.id}
                        onReload={handleReload}
                    />,
                onClick: () => {
                    setNode(node);
                    setFocusedNodeID(node.id);
                }
            } as GroupItem;
        });

        const inProgressGroup = {
            collapsed: false,
            display_name: t("Topics In Progress"),
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
                        userID={user!.id}
                        onReload={handleReload}
                    />,
                onClick: () => {
                    setNode(node);
                    setFocusedNodeID(node.id);
                }
            } as GroupItem;
        });

        const nextGroup = {
            collapsed: false,
            display_name: t("Next Topics"),
            id: NextNodesCategoryName,
            items: nextItems
        } as SidebarGroup;

        return [inProgressGroup, nextGroup];
    }

    const {graph, groups} = useGraph(reload, computeGroups, preferences?.language);

    // https://github.com/mui/material-ui/issues/10739#issuecomment-1365008174
    const staticHeight = `calc(100vh - (${toolbar?.minHeight}px + ${8}px))`;
    return (
        <GraphNodeHoverContext.Provider value={{node, setNode}}>
            {user && <Box
                component="nav"
                sx={{
                    width: {sm: 240},
                    flexShrink: {sm: 0}
                }}
                aria-label="drawer"
            >
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        height: staticHeight,
                        overflowY: 'auto',
                        display: {xs: 'block', sm: 'block', md: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: 240},
                    }}
                >
                    <LHSNavigation groups={groups}/>
                </Drawer>
            </Box>}

            <Grid2 container disableEqualOverflow>
                <Grid2 xs={3} sx={{
                    height: staticHeight,
                    overflowY: 'auto',
                    maxWidth: '240px',
                    display: {xs: 'none', sm: 'none', md: 'block', lg: 'block'}
                }}>
                    <LHSNavigation groups={groups}/>
                </Grid2>
                <Grid2 xs={true} sx={{
                    height: staticHeight,
                    overflowY: 'hidden',
                }}>
                    {graph && graph.nodes?
                        <GraphComponent
                            graph={graph}
                            focusNodeID={focusedNodeID}
                        />
                        :
                        <div>Loading Graph...</div>
                    }
                </Grid2>
                <Grid2 xs={3} sx={{
                    height: staticHeight,
                    overflowY: 'auto',
                    maxWidth: '400px',
                    display: {xs: 'none', sm: 'none', md: 'none', lg: 'block'}
                }}>
                    <RHS
                        userID={user?.id || ''}
                        onReload={handleReload}
                    />
                </Grid2>
            </Grid2>
        </GraphNodeHoverContext.Provider>
    );
}

export default Main;

