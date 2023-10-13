import React from 'react';

import Main from '../components/main';
import useAuth from '../hooks/useAuth';
import Landing from '../components/landing/landing';

interface Props {
    language?: string;
}

const HomePage = (props: Props) => {
    const {user} = useAuth();

    if (user) {
        return (
            <Main/>
        )
    }
    return (
        <Landing language={props.language}/>
    )
}

export default HomePage;
