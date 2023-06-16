import React, {useEffect, useState} from 'react';
import {Button, Stack, Typography, useTheme} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Grid2 from '@mui/material/Unstable_Grid2';

import {NodeWithResources, Video, getVideoLength} from '../types/graph';
import {Client} from '../client/client';
import {GroupItem, SidebarGroup} from '../types/sidebar';

import useAuth from '../hooks/useAuth';

import LHSNavigation from './lhs/lhs_navigation';
import VideoPlayer from './player';
import VideoInput from './video_input';

interface Props {
    nodeID: string;
}

const Node = (props: Props) => {
    const [node, setNode] = useState<NodeWithResources>({} as NodeWithResources);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null)
    const theme = useTheme();
    const {user} = useAuth()

    useEffect(() => {
        if (!activeVideo) {
            Client.Node().get(props.nodeID).then((data) => {
                setNode(data);
            });
        }
    },[props.nodeID]);

    const computeGroups = (node: NodeWithResources) => {
        const videoItems = node.videos? node.videos.map(video => {
            return {
                areaLabel: video.name,
                display_name: video.name + " (" + getVideoLength(video.length)+ " min)",
                secondary: "by " + video.author_username,
                id: video.id,
                link: node.id,
                icon: <YouTubeIcon/>,
                onClick: () => {
                    setActiveVideo(video);
                }
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

    const onVideoStarted = () => {
        if (user && user.id) {
            Client.Node().markAsStarted(node.id, user.id);
        }
    }

    const onVideoEnded = () => {
        if (user && user.id) {
            Client.Node().markAsWatched(node.id, user.id);
        }
    }

    return (
        <Grid2 container height={'100vh'}>
            <Grid2 xs={3} sx={{maxWidth: '240px'}} height={'100%'}>
                <LHSNavigation groups={groups} header={header}/>
            </Grid2>
            <Grid2 xs={true}>
                {activeVideo?
                    <VideoPlayer
                        videoKey={activeVideo.key}
                        width={'100%'}
                        height={'100%'}
                        autoplay={true}
                        onVideoStarted={onVideoStarted}
                        onVideoEnded={onVideoEnded}
                    />
                    :
                    <Stack>
                        <p>{node.description}</p>
                        <div>
                            {node.videos && node.videos.map((video) => (
                                <div key={video.key}>
                                    <VideoPlayer
                                        videoKey={video.key}
                                        width={'560'}
                                        height={'315'}
                                        autoplay={false}
                                        onVideoStarted={onVideoStarted}
                                        onVideoEnded={onVideoEnded}
                                    />
                                </div>
                            ))}
                        </div>
                    </Stack>
                }
                <VideoInput nodeID={props.nodeID}/>
            </Grid2>
            <Grid2 xs={4} sx={{maxWidth: '400px'}} bgcolor={'gray'} textAlign={'center'}>
                Chat coming soon
            </Grid2>
        </Grid2>
    )
}

export default Node;
