import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {Client} from '../client/client';
import {Graph} from '../types/graph';
import GraphComponent from '../components/graph/graph_component';

const GraphPage = () => {
    const {userID} = useParams<{userID: string}>();
    if (!userID) {
        return null;
    }

    const [graph, setGraph] = useState({} as Graph);

    useEffect(() => {
        Client.User().getGraphForUser(userID).then((data) => setGraph(data));
    }, []);

    return (
        <>
            {graph && graph.nodes?
                <GraphComponent graph={graph}/>
                :
                <div>Loading Graph...</div>
            }
        </>
    );
}

export default GraphPage;
