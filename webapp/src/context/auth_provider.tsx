import React, {createContext, useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";

import {DagMode, User, UserPreferences} from '../types/users';
import {Client} from "../client/client";
import {Analytics} from '../analytics';

interface UserContextState {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>> | null;
    preferences: UserPreferences | null;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences | null>> | null;
}

const AuthContext = createContext<UserContextState>({
    user: null,
    loading: true,
    setUser: null,
    preferences: null,
    setPreferences: null
});

interface Props {
    children: React.ReactNode
}

export const AuthProvider = (props: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true)
    const {i18n} = useTranslation();

    const fetchUserData = async () => {
        setLoading(true);
        Client.User().getMe().then((data) => {
            setUser(data);
            Analytics.identify(data);
            Analytics.getMe();

            Client.User().getMyPreferences().then((data) => {
                const prefs = {} as UserPreferences
                for (let i=0; i<data.length; i++){
                    if (data[i].key === 'language') {
                        prefs.language = data[i].value;
                        i18n.changeLanguage(prefs.language);
                    } else if (data[i].key === 'is_video_looped') {
                        prefs.is_video_looped = Boolean(data[i].value);
                    } else if (data[i].key === 'graph_direction') {
                        prefs.graph_direction = data[i].value as DagMode;
                    }
                }
                setPreferences(prefs);
                setLoading(false);
            });
        }).catch((err) => {
            console.log('error while getting me', err);
            setUser(null);
        });
    }

    useEffect(() => {
        if (!user || !preferences) {
            fetchUserData();
        }
    }, [])

    return (
        <AuthContext.Provider value={{user, loading, setUser, preferences, setPreferences}}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;


