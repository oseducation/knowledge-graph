import React from 'react';

import {Client} from '../../client/client';

import OnePagerWithPicture from './one_pager_with_pic';

const Engineer = () => {
    return (
        <OnePagerWithPicture
            name='Become a Software Engineer'
            description='Become a software engineer learning 5-minute topics daily with our AI tutor'
            imageURL='/experiments/javascript.jpeg'
            onSignUp={(email: string) => {Client.Experiments().addEngineer(email);}}
            comingSoon={true}
        />
    );
}

export default Engineer;
