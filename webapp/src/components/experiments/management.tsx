import React from 'react';

import {Client} from '../../client/client';

import OnePagerWithPicture from './one_pager_with_pic';

const Management = () => {
    return (
        <OnePagerWithPicture
            name='Learn Product Management With AI Tutor'
            description='Master Product Management faster and smarter by learning 5-minute topics daily with our AI tutor'
            imageURL='/experiments/management.png'
            onSignUp={(email: string) => {Client.Experiments().addManagement(email);}}
        />
    );
}

export default Management;
