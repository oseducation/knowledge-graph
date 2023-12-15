import React, {useState, useEffect, ComponentType} from 'react';

import {Client} from '../client/client';
import useAuth from '../hooks/useAuth';
import {UserInteraction} from '../types/users';

const MINIMUM_TIME_SPENT = 1000 * 30; // 30 seconds

function withTimeTracking<T>(WrappedComponent: ComponentType<T>, tag: string) {
    return function timeTracking(props: any) {
        const [startTime, setStartTime] = useState(Date.now());
        const {user} = useAuth();

        useEffect(() => {
            const id = generateRandomString();
            setStartTime(Date.now());

            return () => {
                const endDate = Date.now();
                const timeSpent = endDate - startTime;

                const interaction = {
                    id,
                    user_id: user?.id,
                    start_date: startTime,
                    end_date: endDate,
                    ui_component_name: WrappedComponent.name,
                    url: window.location.href,
                    tag,
                } as UserInteraction;
                if (user?.id && timeSpent > MINIMUM_TIME_SPENT) {
                    Client.User().saveInteraction(interaction);
                }
            };
        }, []);

        // Render the wrapped component
        return <WrappedComponent {...props}/>;
    };
}

export const generateRandomString = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < 26; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export default withTimeTracking;
