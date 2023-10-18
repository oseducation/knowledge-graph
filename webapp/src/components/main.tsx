import React, {useState} from 'react';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {Box, Drawer} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import {Graph, Node, computeGroupContent} from '../types/graph';
import {GroupItem, InProgressNodesCategoryName, NextNodesCategoryName, SidebarGroup} from '../types/sidebar';
import useDrawer from '../hooks/useDrawer';
import {Analytics} from '../analytics';
import useAppBarHeight from '../hooks/use_app_bar_height';
import useGraph from '../hooks/useGraph';

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

const Main = () => {
    const [node, setNode] = useState<Node>({} as Node);
    const [focusedNodeID, setFocusedNodeID] = useState<string>('');
    const {user} = useAuth();
    const {open, setOpen} = useDrawer();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {graph, onReload} = useGraph();

    const handleDrawerToggle = () => {
        setOpen?.(!open);
    };

    const computeGroups = (graph: Graph) => {
        const [inProgressNodes, nextNodes] = computeGroupContent(graph)

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
                        onReload={onReload}
                    />,
                onClick: () => {
                    Analytics.clickOnTopic({
                        'node_id': node.id,
                        'Node Name': node.name,
                        'Language': user?.lang,
                        'Node Type': node.node_type,
                        'Status': node.status,
                        'Entry Point': "In Progress Nodes"
                    });
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
                        onReload={onReload}
                    />,
                onClick: () => {
                    Analytics.clickOnTopic({
                        'node_id': node.id,
                        'Node Name': node.name,
                        'Language': user?.lang,
                        'Node Type': node.node_type,
                        'Status': node.status,
                        'Entry Point': 'Next Nodes'
                    });
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

    const groups = computeGroups(graph || {nodes: [], links: []})
    if (groups && groups.length > 1 &&
        groups[1].items && groups[1].items.length === 1 &&
        (groups[1].items[0].display_name === 'Vitsi AI მიმოხილვა' ||
        groups[1].items[0].display_name === 'Vitsi AI')) {
        navigate(`/nodes/${groups[1].items[0].id}`);
    }

    const staticHeight = `calc(100vh - (${useAppBarHeight()}px))`;
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
                        onReload={onReload}
                    />
                </Grid2>
            </Grid2>
        </GraphNodeHoverContext.Provider>
    );
}

export default Main;

