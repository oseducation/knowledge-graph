import {Rest} from "./rest";

export class ExperimentsClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getExperimentsRoute() {
        return `${this.rest.getBaseRoute()}/experiments`;
    }

    addCalculus = async (email: string) => {
        return this.addExperiment(email, 'calculus');
    }

    addJavascript = async (email: string) => {
        return this.addExperiment(email, 'javascript');
    }

    addEngineer = async (email: string) => {
        return this.addExperiment(email, 'engineer');
    }

    addExperiment = async (email: string, source: string) => {
        try {
            this.rest.doPost(`${this.getExperimentsRoute()}`, JSON.stringify({
                email: email,
                source: source,
            }));
        } catch (error) {
            return {error};
        }
    }
}
