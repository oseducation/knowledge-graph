import React from 'react';

import {Client} from '../../client/client';

import OnePagerWithPicture from './one_pager_with_pic';

const Javascript = () => {
    return (
        <OnePagerWithPicture
            name='Learn Javascript With AI Tutor'
            description='Master Javascript faster and smarter by learning 5-minute topics daily with our AI tutor'
            imageURL='/experiments/javascript.jpeg'
            onSignUp={(email: string) => {Client.Experiments().addJavascript(email);}}
        />
    );
}

export default Javascript;
