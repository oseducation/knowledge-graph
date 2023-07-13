import React, {useEffect, useState} from 'react';
import {Box, Divider, Typography, useTheme} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Grid2 from '@mui/material/Unstable_Grid2';

import {getVideoLength, NodeStatusFinished, NodeWithResources, Video} from '../types/graph';
import {Client} from '../client/client';
import {GroupItem, SidebarGroup} from '../types/sidebar';

import useAuth from '../hooks/useAuth';

import LHSNavigation from './lhs/lhs_navigation';
import VideoPlayer from './player';
import VideoInput from './video_input';
import NodeTitleSection from "./node_title_section";

interface Props {
    nodeID: string;
}

const Node = (props: Props) => {
    const [node, setNode] = useState<NodeWithResources>({} as NodeWithResources);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const theme = useTheme();
    const {user} = useAuth()

    function loadNode() {
        setLoading(true)
        Client.Node().get(props.nodeID).then((data) => {
            setNode(data);
            setLoading(false)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }).catch(_ => {
            setLoading(false)
        });
    }

    useEffect(() => {
        if (!activeVideo) {
            loadNode();
        }
    }, [props.nodeID]);

    const computeGroups = (node: NodeWithResources) => {
        const videoItems = node.videos ? node.videos.map(video => {
            return {
                areaLabel: video.name,
                display_name: video.name + " (" + getVideoLength(video.length) + " min)",
                secondary: "by " + video.author_username,
                id: video.id,
                link: node.id,
                icon: <YouTubeIcon/>,
                onClick: () => {
                    setActiveVideo(video);
                }
            } as GroupItem;
        }) : [];

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

    const onVideoStarted = (videoKey: string) => {
        if (user && user.id) {
            Client.Node().markAsStarted(node.id, user.id);
            Client.Video().videoStarted(videoKey);
        }
    }

    const onVideoEnded = (videoKey: string) => {
        if (user && user.id) {
            Client.Node().markAsWatched(node.id, user.id);
            Client.Video().videoFinished(videoKey);
        }
    }

    const markAsKnown = () => {
        if (user && user.id) {
            Client.Node().markAsKnown(node.id, user.id).then(() => {
                loadNode();
            });
        }
    }

    return (
        <Grid2 container height={'100vh'}>
            <Grid2 xs={3} sx={{maxWidth: '240px'}} height={'100%'}>
                <LHSNavigation groups={groups} header={header}/>
            </Grid2>
            <Grid2 xs={true}>
                {activeVideo ?
                    <VideoPlayer
                        videoKey={activeVideo.key}
                        width={'100%'}
                        height={'100%'}
                        autoplay={true}
                        onVideoStarted={onVideoStarted}
                        onVideoEnded={onVideoEnded}
                    />
                    :
                    <Box
                        display={"flex"}
                        flexDirection={"column"}
                        sx={{
                            width: '100%',
                            alignItems: 'center',
                        }}
                    >
                        <NodeTitleSection
                            nodeTitle={node.name}
                            nodeDescription={node.description}
                            nodeFinished={node.status === NodeStatusFinished}
                            loading={loading}
                            onMarlAsKnown={markAsKnown}
                        />
                        {node.videos && node.videos.map((video) => (
                            <Box
                                key={video.key}
                                sx={{
                                    mb: 8
                                }}
                            >
                                <VideoPlayer
                                    videoKey={video.key}
                                    key={video.key}
                                    width={'560'}
                                    height={'315'}
                                    autoplay={false}
                                    onVideoStarted={onVideoStarted}
                                    onVideoEnded={onVideoEnded}
                                />
                                <Divider variant={"fullWidth"}/>
                            </Box>
                        ))}
                        <VideoInput nodeID={props.nodeID}/>
                    </Box>
                }

            </Grid2>
            <Grid2 xs={4} sx={{maxWidth: '400px'}} bgcolor={'gray'} textAlign={'center'}>
                Chat coming soon
            </Grid2>
        </Grid2>
    )
}

export default Node;
