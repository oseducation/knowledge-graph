import React from 'react';
import {useParams} from 'react-router-dom';

import Node from '../components/node';

const HomePage = () => {
    const {nodeID} = useParams<{ nodeID: string }>();
    if (!nodeID) {
        return null;
    }

    return (
        <Node nodeID={nodeID}/>
    )
}

export default HomePage;
