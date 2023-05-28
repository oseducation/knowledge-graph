import React from 'react';
import {Box} from '@mui/material';

import {GraphNodeHoverContext} from './../main';


const RHS = () => {
    const {node} = React.useContext(GraphNodeHoverContext);

    return (
        <Box
            width={400}
            height='100%'
        >
            <h1>Node</h1>
            <h2>{node.name}</h2>
            <p>{node.description}</p>
        </Box>
    )
}

export default RHS;
