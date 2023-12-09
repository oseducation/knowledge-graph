import React, {useEffect} from 'react';
import {Box, Typography, Avatar, ListItem, ListItemAvatar, ListItemText, List, Card, createTheme} from '@mui/material';

import {PerformerUser, User} from '../../types/users';
import {Client} from '../../client/client';
import {stringAvatar} from '../rhs/rhs';

const TopPerformers = () => {
    const theme = createTheme();
    const [topPerformers, setTopPerformers] = React.useState<PerformerUser[]>([]);

    useEffect(() => {
        Client.Dashboard().getPerformers(7, 3).then((res) => {
            if (res) {
                setTopPerformers(res);
            }
        });
    }, []);

    return (
        <Card sx={{
            p: 2,
            m:1,
            borderRadius:'16px',
            bgcolor: 'background.paper',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        }}>
            <Typography variant="h5" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                Top Performers
            </Typography>
            <List>
                {topPerformers.map((performer, index) => (
                    <ListItem key={performer.username} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ListItemAvatar>
                                <Avatar sx={{
                                    bgcolor: index === 0 ? theme.palette.primary.main : index === 1 ? '#ffa216' : '#ec1b80',
                                    width: 24,
                                    height: 24,
                                    minWidth: 24,
                                }}>
                                    {index + 1}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemAvatar>
                                <Avatar key={performer.id} alt={performer.username} {...stringAvatar({first_name: performer.first_name, last_name: performer.last_name} as User)}/>
                            </ListItemAvatar>
                            <ListItemText
                                primary={performer.username}
                                // secondary={`${performer.goals} Goal${performer.goals > 1 ? 's' : ''}`}
                                sx={{marginLeft: '8px'}}
                                primaryTypographyProps={{
                                    fontSize: 20,
                                    fontWeight: 'medium',
                                    letterSpacing: 0,
                                }}
                            />
                        </Box>
                        <Typography variant="subtitle1" component="span" sx={{fontWeight: 'bold'}}>
                            {`${performer.finished_count} Topics`}
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </Card>
    );
};


export default TopPerformers;
