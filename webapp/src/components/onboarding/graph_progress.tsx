import React from 'react';
import {Typography, Box, Button} from '@mui/material';

import {Graph} from '../../types/graph';
import GraphComponent from '../graph/graph_component';

interface Props {
    graph: Graph | null;
    title: string;
    description?: string;
    onContinue: () => void;
}

const GraphProgress = (props: Props) => {
    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} width={'400px'} mt={6}>
            <Box flexGrow={1}>
                {props.graph && props.graph.nodes?
                    <GraphComponent
                        graph={props.graph}
                        drawGoalPath={false}
                        noClick={true}
                        heightAdjust={100}
                        height={400}
                    />
                    :
                    <div>Loading Graph...</div>
                }
            </Box>
            <Typography variant='h5' fontWeight={'bold'} m={1}>
                {props.title}
            </Typography>
            {props.description &&
                <Typography variant='body2' m={1}>
                    {props.description}
                </Typography>
            }

            <Button variant='contained' color='primary' fullWidth sx={{mt:6}} onClick={() => {props.onContinue()}}>
                Continue
            </Button>
        </Box>
    );
}

export default GraphProgress;

