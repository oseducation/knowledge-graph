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
        try {
            this.rest.doPost(`${this.getExperimentsRoute()}`, JSON.stringify({
                email: email,
                source: 'calculus',
            }));
        } catch (error) {
            return {error};
        }
    }
}
