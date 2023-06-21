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

    getVideoEngageRoute(videoID: string) {
        return `${this.getVideosRoute()}/engage/${videoID}`;
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
            video_status: VideoStatusAbandoned,
            abandon_watching_at: abandonWatchingAt
        }
        return this.changeStatus(videoID, status);
    }

    changeStatus = async (videoID: string, status: any) => {
        try {
            this.rest.doPost(`${this.getVideoEngageRoute(videoID)}`, JSON.stringify(status));
        } catch (error) {
            return {error};
        }
    }

    getNextVideo = async () => {
        const data = this.rest.doFetch<string>(`${this.getVideosRoute()}/next`, {method: 'get'});
        return data;
    }

}
