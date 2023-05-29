import React from 'react';
import {Box, BoxProps, styled} from '@mui/material';

import {GraphNodeHoverContext} from './../main';


const RHS = () => {
    const {node} = React.useContext(GraphNodeHoverContext);

    return (
        <StyledBox
            width={400}
            height='100%'
        >
            <h1>Node</h1>
            <h2>{node.name}</h2>
            <p>{node.description}</p>
        </StyledBox>
    )
}

const StyledBox = styled(Box)<BoxProps>(({theme}) => ({
    boxShadow: theme.shadows[3],
}));

export default RHS;
