import React, {useEffect, useState} from 'react';
import {Stack, Typography, useTheme} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Grid2 from '@mui/material/Unstable_Grid2';

import {NodeWithResources, Video} from '../types/graph';
import {Client} from '../client/client';
import {GroupItem, SidebarGroup} from '../types/sidebar';

import LHSNavigation from './lhs/lhs_navigation';

interface Props {
    nodeID: string;
}

const Node = (props: Props) => {
    const [node, setNode] = useState<NodeWithResources>({} as NodeWithResources);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null)
    const theme = useTheme();

    useEffect(() => {
        if (!activeVideo) {
            Client.Node().get(props.nodeID).then((data) => {
                setNode(data);
            });
        }
    });

    const computeGroups = (node: NodeWithResources) => {
        const videoItems = node.videos? node.videos.map(video => {
            return {
                areaLabel: video.name,
                display_name: video.name + " (" + Math.floor(video.length/60) + " min)",
                secondary: "by " + video.author_username,
                id: video.id,
                link: node.id,
                icon: <YouTubeIcon/>,
                onClick: () => setActiveVideo(video)
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

    const groups = computeGroups(node)

    const header = (
        <Typography
            fontSize={20}
            fontWeight={600}
            color={theme.palette.primary.contrastText}
            onClick={() => setActiveVideo(null)}
            sx={{
                p: '10px 2px',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                },
                '&:active': {
                    backgroundColor: theme.palette.action.active,
                },
            }}
        >
            {node.name}
        </Typography>
    );

    return (
        <Grid2 container height={'100vh'}>
            <Grid2 xs={3} sx={{maxWidth: '240px'}} height={'100%'}>
                <LHSNavigation groups={groups} header={header}/>
            </Grid2>
            <Grid2 xs={true}>
                {activeVideo?
                    <iframe
                        src={`https://www.youtube.com/embed/${activeVideo.key}`}
                        height={'100%'}
                        width={'100%'}
                        allow='autoplay; encrypted-media'
                        allowFullScreen
                    />
                    :
                    <Stack>
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
                }
            </Grid2>
            <Grid2 xs={4} sx={{maxWidth: '400px'}} bgcolor={'gray'} textAlign={'center'}>
                Chat coming soon
            </Grid2>
        </Grid2>
    )
}

export default Node;
