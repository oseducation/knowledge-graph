import React, {useEffect, useState} from 'react';
import {Stack} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Grid2 from '@mui/material/Unstable_Grid2';

import {NodeWithResources} from '../types/graph';
import {Client} from '../client/client';
import {GroupItem, SidebarGroup} from '../types/sidebar';

import LHSNavigation from './lhs/lhs_navigation';

interface Props {
    nodeID: string;
}

const computeGroups = (node: NodeWithResources) => {
    const videoItems = node.videos? node.videos.map(video => {
        return {
            areaLabel: video.key,
            display_name: video.name + " (" + Math.floor(video.length/60) + " min)",
            secondary: "by " + video.author_username,
            id: video.id,
            link: node.id,
            icon: <YouTubeIcon/>,
        } as GroupItem;
    }): [];

    const videosGroup = {
        collapsed: false,
        display_name: "Videos",
        id: "videos",
        items: videoItems
    } as SidebarGroup;

    const textsGroup = {
        collapsed: false,
        display_name: "Texts",
        id: "texts",
        items: []
    } as SidebarGroup;

    const testsGroup = {
        collapsed: false,
        display_name: "Tests",
        id: "tests",
        items: []
    } as SidebarGroup;

    return [videosGroup, textsGroup, testsGroup];
}

const Node = (props: Props) => {
    if (!props.nodeID) {
        return null;
    }

    const [node, setNode] = useState<NodeWithResources>({} as NodeWithResources);

    useEffect(() => {
        Client.Node().get(props.nodeID).then((data) => {
            setNode(data);
        });
    },[]);

    const groups = computeGroups(node)

    return (
        <Grid2 container height={'100vh'}>
            <Grid2 xs={3} sx={{maxWidth: '240px'}} height={'100%'}>
                <LHSNavigation groups={groups}/>
            </Grid2>
            <Grid2 xs={true}>
                <Stack>
                    <h2>{node.name}</h2>
                    <p>{node.description}</p>
                    <div>
                        {node.videos && node.videos.map((video) => (
                            <div key={video.key}>
                                <iframe
                                    width='560'
                                    height='315'
                                    src={`https://www.youtube.com/embed/${video.key}`}
                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                />
                            </div>
                        ))}
                    </div>
                </Stack>
            </Grid2>
            <Grid2 xs={4} sx={{maxWidth: '400px'}} bgcolor={'gray'} textAlign={'center'}>
                Chat coming soon
            </Grid2>
        </Grid2>
    )
}

export default Node;
