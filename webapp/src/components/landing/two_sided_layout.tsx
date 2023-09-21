import * as React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import Box from '@mui/material/Box';

import {Graph} from '../../types/graph';
import GraphComponent from '../graph/graph_component';

interface Props extends React.PropsWithChildren {
    graph: Graph;
    color: string;
    height: string;
    reversed?: boolean;
    graphTextColor?: string;
}

const TwoSidedLayout = (props: Props) =>  {

    return (
        <Box
            id='TwoSidedLayout'
            bgcolor={props.color}
            sx={{
                minHeight: props.height,
                width:'100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                flexDirection: 'row',
                margin:0,
                p:0,
                scrollSnapAlign: 'start'
            }}
        >
            <Grid2 xs={12} sm={12} md={6}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        flexShrink: 999,
                        alignItems: 'flex-start',
                        textAlign: 'initial',
                    }}
                >
                    {props.children}
                </Box>
            </Grid2>
            <Grid2 xs={0} sm={0} md={6} p={0}>
                <GraphComponent
                    graph={props.graph}
                    noClick={true}
                    dir={'lr'}
                    textColor={props.graphTextColor}
                    isLarge={true}
                />
            </Grid2>
        </Box>
    );
}

export default TwoSidedLayout;
