import * as React from 'react';
import {Card, Typography, Button, LinearProgress, Box, useTheme, alpha} from '@mui/material';
import {useNavigate} from 'react-router-dom';

import useGraph from '../../hooks/useGraph';
import {Graph, Node, NodeStatusFinished} from '../../types/graph';
import {computePathToGoal, nextNodeToGoal} from '../../context/graph_provider';


interface Props {
    imageURL: string;
    title: string;
    progress: number;
    onClick: () => void;
}

const GoalCard = (props: Props) => {
    const theme = useTheme();

    return (
        <Card sx={{
            borderRadius: '16px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            margin: 1,
            // height: '100%',
        }}>
            <Box sx={{height: '100%', m: 2}}>
                <Box sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    mb: 1,
                    height:'50%',
                    pb: 0,
                }}>
                    <img src={props.imageURL} alt={props.title} width={'240px'} height={'135px'}/>
                </Box>
                <Typography variant="h6" component="div">
                    {props.title}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1
                }}>
                    <LinearProgress
                        variant="determinate"
                        value={props.progress}
                        sx={{
                            height: '6px',
                            width: '100%',
                            borderRadius: '5px',
                            mr:'8px',
                            backgroundColor: alpha(theme.palette.success.light, 0.5),
                            '& .MuiLinearProgress-bar': {
                                borderRadius: '5px',
                                backgroundColor: theme.palette.success.main,
                            },
                        }}
                    />

                    <Typography variant="body1" color="text.secondary">
                        {props.progress}%
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{mt: '16px', borderRadius: '8px'}}
                    onClick={props.onClick}
                >
                    Continue
                </Button>
            </Box>
        </Card>
    );
};

const computeGoalPercentage = (globalGraph: Graph, goalNodeID: string) => {
    const path = computePathToGoal(globalGraph, goalNodeID)
    const map = new Map<string, Node>()
    globalGraph.nodes.forEach(node => map.set(node.id, node))
    let numberOfFinishedNodes = 0;
    path.forEach((nodeID) => {
        if (map.get(nodeID)?.status === NodeStatusFinished) {
            numberOfFinishedNodes++;
        }
    });

    return Math.round(numberOfFinishedNodes / (path.size+1) * 100)
}

const Goals = () => {
    const {goals, globalGraph} = useGraph();
    const navigate = useNavigate();

    if (!globalGraph) {
        return 'loading...';
    }

    return (
        <Box
            display={'flex'}
            flexDirection={'column'}
            sx={{pt: '16px', pl:'0px', pr:'0px'}}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                ml: 4
            }}>
                <Typography variant="h5" sx={{fontWeight: 'bold'}}>
                    My Goals
                </Typography>
                {goals.length > 3 &&
                    <Button size="small" sx={{textTransform: 'none'}}>
                        See all
                    </Button>
                }
            </Box>
            <Box display={'flex'} flexDirection={'row'}>
                {goals.slice(0,3).map((goal, index) => {
                    const path = computePathToGoal(globalGraph, goal.node_id);
                    const nextNodeID = nextNodeToGoal(globalGraph, path, [goal])
                    return (
                        <Box key={index}>
                            <GoalCard
                                title={goal.name}
                                imageURL={goal.thumbnail_relative_url}
                                progress={globalGraph ? computeGoalPercentage(globalGraph, goal.node_id) : 0}
                                onClick={() => navigate(`/nodes/${nextNodeID}`)}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};


export default Goals;
