import {Question} from "../types/graph";

import {Rest} from "./rest";

export class OnboardingClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getOnboardingRoute() {
        return `${this.rest.getBaseRoute()}/questions/onboarding`;
    }

    getQuestions = async (courseID: string) => {
        if (courseID === 'gmat') {
            return [[{
                id: '1',
                name: 'question1',
                question: 'What is the capital of France?',
                question_type: 'multiple_choice',
                node_id: '1',
                explanation: 'Paris is the capital of France',
                choices: [
                    {id: '1', choice: 'Paris', is_right_choice: true},
                    {id: '2', choice: 'London', is_right_choice: false},
                    {id: '3', choice: 'Berlin', is_right_choice: false},
                    {id: '4', choice: 'Madrid', is_right_choice: false},
                ]
            }],[{
                id: '2',
                name: 'question2',
                question: 'What is the capital of Germany?',
                question_type: 'multiple_choice',
                node_id: '1',
                explanation: 'Berlin is the capital of Germany',
                choices: [
                    {id: '5', choice: 'Paris', is_right_choice: false},
                    {id: '6', choice: 'London', is_right_choice: false},
                    {id: '7', choice: 'Berlin', is_right_choice: true},
                    {id: '8', choice: 'Madrid', is_right_choice: false},
                ]
            }],[{
                id: '3',
                name: 'question3',
                question: 'What is the capital of Spain?',
                question_type: 'multiple_choice',
                node_id: '1',
                explanation: 'Madrid is the capital of Spain',
                choices: [
                    {id: '9', choice: 'Paris', is_right_choice: false},
                    {id: '10', choice: 'London', is_right_choice: false},
                    {id: '11', choice: 'Berlin', is_right_choice: false},
                    {id: '12', choice: 'Madrid', is_right_choice: true},
                ]
            }],
            [{
                id: '4',
                name: 'question4',
                question: 'What is the capital of Italy?',
                question_type: 'multiple_choice',
                node_id: '1',
                explanation: 'Rome is the capital of Italy',
                choices: [
                    {id: '13', choice: 'Paris', is_right_choice: false},
                    {id: '14', choice: 'London', is_right_choice: false},
                    {id: '15', choice: 'Berlin', is_right_choice: false},
                    {id: '16', choice: 'Rome', is_right_choice: true},
                ]
            }]] as Question[][];
        }

        const data = this.rest.doFetch<Question[][]>(`${this.getOnboardingRoute()}/${'startup-school'}`, {method: 'get'});
        return data;
    };
}
