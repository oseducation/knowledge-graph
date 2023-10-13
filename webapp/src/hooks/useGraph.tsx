import {useContext} from 'react';

import GraphContext from '../context/graph_provider';

const useGraph = () => {
    return useContext(GraphContext);
}

export default useGraph;
