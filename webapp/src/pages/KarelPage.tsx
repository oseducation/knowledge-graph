import React from 'react';

import IDE from '../components/karel/ide';
import useQuery from '../hooks/useQuery';
import {Analytics} from '../analytics';

interface Props {
    lang: string;
}

const KarelPage = (props: Props) => {
    const query = useQuery();
    const nodeID = query.get("node_id");
    const nodeName = query.get("node_name");

    if (!nodeName || !nodeID) {
        return <div>no IDE</div>
    }
    Analytics.viewKarelPage({
        "Node ID": nodeID,
        "Node Name": nodeName,
        "Language": props.lang
    })

    return (
        <IDE
            nodeName={nodeName}
            nodeID={nodeID}
            lang={props.lang}
        />
    );
}

export default KarelPage;
