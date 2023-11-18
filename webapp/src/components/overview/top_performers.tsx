import React from 'react';
import { Box, Typography, Avatar, ListItem, ListItemAvatar, ListItemText, List, Card, createTheme } from '@mui/material';

type Performer = {
    rank: number;
    name: string;
    goals: number;
    topics: number;
    imageUrl: string;
};

// Define the props for the component
interface TopPerformerProps {
    performers: Performer[];
}

const TopPerformer: React.FC<TopPerformerProps> = ({ performers }) => {
    const theme = createTheme();
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
                {performers.map((performer) => (
                    <ListItem key={performer.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ListItemAvatar>
                                <Avatar sx={{
                                    bgcolor: performer.rank === 1 ? theme.palette.primary.main : performer.rank === 2 ? '#ffa216' : '#ec1b80',
                                    width: 24,
                                    height: 24,
                                    minWidth: 24,
                                }}>
                                    {performer.rank}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemAvatar>
                                <Avatar
                                    alt={performer.name}
                                    src={performer.imageUrl}
                                    sx={{width: 64, height: 64}}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={performer.name}
                                secondary={`${performer.goals} Goal${performer.goals > 1 ? 's' : ''}`}
                                sx={{marginLeft: '8px'}}
                                primaryTypographyProps={{
                                    fontSize: 20,
                                    fontWeight: 'medium',
                                    letterSpacing: 0,
                                }}
                            />
                        </Box>
                        <Typography variant="subtitle1" component="span" sx={{fontWeight: 'bold'}}>
                            {`${performer.topics} Topics`}
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </Card>
    );
};

// Usage of the TopPerformer component with inline image URLs
const performers: Performer[] = [
    {
        rank: 1,
        name: 'Rasel Mondol',
        goals: 15,
        topics: 85,
        imageUrl: 'https://d9jhi50qo719s.cloudfront.net/k63/samples/pju_800.JPG?230914091559'
    },
    {
        rank: 2,
        name: 'Devon Lane',
        goals: 17,
        topics: 78,
        imageUrl: 'data:image/jpeg;base64,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'
    },
    {
        rank: 3,
        name: 'Bessie Cooper',
        goals: 20,
        topics: 75,
        imageUrl: 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg'
    },
];

const TopPerformers = () => {
    return <TopPerformer performers={performers} />
}

export default TopPerformers;
