import React from 'react';
import {Stack} from '@mui/material';

import {GraphNodeHoverContext} from './graph';


const GraphRHS = () => {
    const {node} = React.useContext(GraphNodeHoverContext);

    return (
        <Stack>
            <h1>Node</h1>
            <h2>{node.name}</h2>
            <p>{node.description}</p>
        </Stack>
    )
}

export default GraphRHS;
