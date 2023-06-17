import {VideoStatusFinished, VideoStatusStarted} from "../types/graph";

import {Rest} from "./rest";

export class VideoClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getVideosRoute() {
        return `${this.rest.getBaseRoute()}/videos`;
    }

    getVideoRoute(videoID: string) {
        return `${this.getVideosRoute()}/${videoID}`;
    }

    videoStarted = async (videoID: string) => {
        const status = {
            video_status: VideoStatusStarted
        }
        return this.changeStatus(videoID, status);
    }

    videoFinished = async (videoID: string) => {
        const status = {
            video_status: VideoStatusFinished
        }
        return this.changeStatus(videoID, status);
    }

    videoAbandoned = async (videoID: string, abandonWatchingAt: number) => {
        const status = {
            video_status: VideoStatusFinished,
            abandon_watching_at: abandonWatchingAt
        }
        return this.changeStatus(videoID, status);
    }

    changeStatus = async (videoID: string, status: any) => {
        try {
            this.rest.doPost(`${this.getVideoRoute(videoID)}`, JSON.stringify(status));
        } catch (error) {
            return {error};
        }
    }
}
