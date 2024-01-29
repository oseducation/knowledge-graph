export const getVideoUrl = (videoKey: string) => {
    return `https://www.youtube.com/watch?v=${videoKey}`
};

export const getKarelUrl = (nodeId: string, nodeName: string) => {
    return `https://www.vitsi.ai/karel_js?node_id=${nodeId}&node_name=${nodeName}`
};
