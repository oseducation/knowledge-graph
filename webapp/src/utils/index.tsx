export const getVideoUrl = (videoKey: string, start?: number, length?: number) => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('v', videoKey);
    if(start){
        urlSearchParams.append('start', start.toString());
    }
    if(length){
        const end = ((start || 0)+length)
        urlSearchParams.append('end', end.toString());
    }
    return `https://www.youtube.com/watch?${urlSearchParams.toString()}`
};

export const getKarelUrl = (nodeId: string, nodeName: string) => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('nodeId', nodeId);
    urlSearchParams.append('nodeName', nodeName);
    return `https://www.vitsi.ai/karel_js?${urlSearchParams.toString()}`
};
