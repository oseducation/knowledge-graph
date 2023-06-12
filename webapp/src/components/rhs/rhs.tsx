import React, {useEffect, useState} from 'react';
import {Avatar, AvatarGroup, Box, BoxProps, Button, Divider, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Stack, styled, Typography, useTheme} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';

import {GraphNodeHoverContext} from '../main';
import {ActiveUser, NodeStatusFinished, NodeWithResources} from '../../types/graph';
import {Client} from '../../client/client';

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

const stringAvatar = (user: ActiveUser) => {
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

    useEffect(() => {
        if (node && node.id) {
            Client.Node().get(node.id).then((data) => {
                setNodeWithResources(data);
            });
        }
    },[node.id]);


    const markAsKnown = () => {
        if (props.userID && node.id) {
            Client.Node().markAsKnown(node.id, props.userID).then(() => {
                props.onReload();
            });
        }
    }

    return (
        <StyledBox
            width={400}
            height='100%'
        >
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
                        sx={{p:'10px'}}
                    >
                        Node Details
                    </Typography>
                    <Divider
                        orientation='vertical'
                        variant='middle'
                        flexItem
                        sx={{p:'4px 0px'}}
                    />
                    <Typography
                        fontSize={20}
                        fontWeight={500}
                        sx={{p:'10px'}}
                    >
                        {node.name}
                    </Typography>
                </Stack>

                <Box sx={{p:'10px'}}>{node.description}</Box>
                {nodeWithResources.active_users && nodeWithResources.active_users.length > 0 &&
                    <Stack direction='row' alignItems='center'>
                        <Typography
                            sx={{p:'10px'}}
                            fontSize={18}
                            fontWeight={500}
                        >
                            Active Learners
                        </Typography>
                        <AvatarGroup max={5}>
                            {nodeWithResources.active_users.map(user =>
                                <Avatar key={user.user_id} alt={user.username} {...stringAvatar(user)}/>
                            )}
                        </AvatarGroup>
                    </Stack>
                }
                {nodeWithResources.videos && nodeWithResources.videos.length > 0 &&
                    <>
                        <Divider/>
                        <List
                            sx={{width: '100%', maxWidth: 400, height:'100%', bgcolor: 'background.paper'}}
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
                                <ListItemButton key={video.id}>
                                    <ListItemIcon>
                                        <YouTubeIcon/>
                                    </ListItemIcon>
                                    <ListItemText primary={video.name} secondary={"(" + (Math.floor(video.length/60) +1) + " min)" } />
                                </ListItemButton>
                            )}

                        </List>
                    </>
                }
                <Box bgcolor='background.paper' display='flex' justifyContent='center'>
                    <Button
                        variant="contained"
                        sx={{margin:'40px'}}
                        onClick={() => markAsKnown()}
                        disabled={node.status === NodeStatusFinished}
                    >
                        I know this
                    </Button>
                </Box>
            </Stack>
        </StyledBox>
    )
}

const StyledBox = styled(Box)<BoxProps>(({theme}) => ({
    boxShadow: theme.shadows[3],
}));

export default RHS;
