import React, {useEffect, useState} from 'react';
import {
    Avatar,
    AvatarGroup,
    Box,
    BoxProps,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Stack,
    styled,
    Typography,
    useTheme
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';

import {useNavigate} from "react-router-dom";

import {GraphNodeHoverContext} from '../main';
import {getVideoLength, NodeStatusFinished, NodeWithResources} from '../../types/graph';
import {Client} from '../../client/client';
import {User} from '../../types/users';
import IKnowThisButton from "../I_konw_this_button";

const stringToColor = (st: string) => {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < st.length; i += 1) {
        hash = st.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

const stringAvatar = (user: User) => {
    const name = user.first_name + ' ' + user.last_name
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${user.first_name[0]}${user.last_name[0]}`,
    };
}

type RHSProps = {
    userID: string;
    onReload: () => void;
}

const RHS = (props: RHSProps) => {
    const {node} = React.useContext(GraphNodeHoverContext);
    const theme = useTheme()

    const [nodeWithResources, setNodeWithResources] = useState<NodeWithResources>({} as NodeWithResources);
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (node && node.id) {
            Client.Node().get(node.id).then((data) => {
                setNodeWithResources(data);
            });
        }
    }, [node.id]);


    function markAsKnown() {
        if (props.userID && node.id) {
            setLoading(true)
            Client.Node().markAsKnown(node.id, props.userID)
                .then(() => {
                    props.onReload();
                    setLoading(false)
                })
                .catch(() => {
                    setLoading(false)
                });
        }
    }

    function markAsStarted() {
        if (props.userID && node.id) {
            setLoading(true)
            Client.Node().markAsStarted(node.id, props.userID)
                .then(() => {
                    props.onReload();
                    setLoading(false)
                })
                .catch(() => {
                    setLoading(false)
                });
        }
    }

    return (
        <StyledBox height='100%'>
            <Stack bgcolor={theme.palette.grey[100]} height={'100%'}>
                <Stack
                    direction='row'
                    bgcolor={theme.palette.grey[300]}
                    height='fit-content'
                    minHeight='48px'
                    alignItems='center'
                    sx={{border: (theme) => `1px solid ${theme.palette.divider}`}}
                >
                    <Typography
                        fontSize={20}
                        fontWeight={600}
                        sx={{p: '10px'}}
                    >
                        Node Details
                    </Typography>
                    <Divider
                        orientation='vertical'
                        variant='middle'
                        flexItem
                        sx={{p: '4px 0px'}}
                    />
                    <Typography
                        fontSize={20}
                        fontWeight={500}
                        sx={{p: '10px'}}
                    >
                        {node.name}
                    </Typography>
                </Stack>

                <Box sx={{p: '10px'}}>{node.description}</Box>
                {nodeWithResources.active_users && nodeWithResources.active_users.length > 0 &&
                    <Stack direction='row' alignItems='center'>
                        <Typography
                            sx={{p: '10px'}}
                            fontSize={18}
                            fontWeight={500}
                        >
                            Active Learners
                        </Typography>
                        <AvatarGroup max={5}>
                            {nodeWithResources.active_users.map(user =>
                                <Avatar key={user.id} alt={user.username} {...stringAvatar(user)}/>
                            )}
                        </AvatarGroup>
                    </Stack>
                }
                {nodeWithResources.videos && nodeWithResources.videos.length > 0 &&
                    <>
                        <Divider/>
                        <List
                            sx={{width: '100%', maxWidth: 400, height: '100%', bgcolor: 'background.paper'}}
                            component="nav"
                            aria-labelledby="resources"
                            subheader={
                                <ListSubheader component="div" id="resources">
                                    <Typography
                                        fontSize={18}
                                        fontWeight={600}
                                    >
                                        Resources
                                    </Typography>
                                </ListSubheader>
                            }
                        >
                            {nodeWithResources.videos.map(video =>
                                <ListItemButton
                                    key={video.id}
                                    onClick={
                                        () => navigate(`/nodes/${nodeWithResources.id}`)
                                    }
                                >
                                    <ListItemIcon>
                                        <YouTubeIcon/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={video.name}
                                        secondary={"(" + getVideoLength(video.length) + " min)"}/>
                                </ListItemButton>
                            )}

                        </List>
                    </>
                }
                <Box bgcolor='background.paper' display='flex' justifyContent='center' paddingY={1}>
                    <IKnowThisButton
                        isNodeFinished={node.status === NodeStatusFinished}
                        loading={loading}
                        onMarkAsKnown={markAsKnown}
                        onMarkAsStarted={markAsStarted}
                    />
                </Box>
            </Stack>
        </StyledBox>
    )
}

const StyledBox = styled(Box)<BoxProps>(({theme}) => ({
    boxShadow: theme.shadows[3],
}));

export default RHS;
