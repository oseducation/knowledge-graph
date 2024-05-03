import React, {createContext, useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";

import {DagMode, User, UserNoteForDisplay, UserPreferences} from '../types/users';
import {Client} from "../client/client";
import {Analytics} from '../analytics';

interface UserContextState {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>> | null;
    preferences: UserPreferences | null;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences | null>> | null;
    userNotes: UserNoteForDisplay[];
    setUserNotes: React.Dispatch<React.SetStateAction<UserNoteForDisplay[]>>;
}

const AuthContext = createContext<UserContextState>({
    user: null,
    loading: true,
    setUser: null,
    preferences: null,
    setPreferences: null,
    userNotes: [],
    setUserNotes: () => {},
});

interface Props {
    children: React.ReactNode
}

export const AuthProvider = (props: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true)
    const {i18n} = useTranslation();
    const [userNotes, setUserNotes] = useState<UserNoteForDisplay[]>([]);

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
                    } else if (data[i].key === 'tutor_personality') {
                        prefs.tutor_personality = data[i].value;
                    } else if (data[i].key === 'legend_on_graph_message') {
                        prefs.legend_on_graph_message = Boolean(data[i].value);
                    } else if (data[i].key === 'legend_on_topic_graph') {
                        prefs.legend_on_topic_graph = Boolean(data[i].value);
                    }
                }
                setPreferences(prefs);
                setLoading(false);
            }).catch((err) => {
                console.log('error while preferences me', err);
                setUser(null);
                setLoading(false);
            });

            Client.User().getNotes(data.id).then((data) => {
                /*const x = [
                    {
                        id: 'startups',
                        note_name: 'startups'
                    },
                    {
                        id: 'startups1',
                        note_name: 'startups'
                    },
                    {
                        id: 'startups2',
                        note_name: 'blublu'
                    },
                    {
                        id: 'startups3',
                        note_name: 'bla bla'
                    },
                    {
                        id: 'Where Do Great Startup Ideas Come From: Stripe',
                        note_name: 'Where Do Great Startup Ideas Come From: Stripe'
                    },
                    {
                        id: 'startups4',
                        note_name: 'startups'
                    },
                    {
                        id: 'Are you wondering if youre cut out to be a startup founder? Its a complex question and, frankly',
                        note_name: 'Are you wondering if youre cut out to be a startup founder? Its a complex question and, frankly'
                    },
                    {
                        id: 'startups25',
                        note_name: 'blublu'
                    },
                    {
                        id: 'startups36',
                        note_name: 'bla bla'
                    },
                    {
                        id: '7Where Do Great Startup Ideas Come From: Stripe',
                        note_name: 'Where Do Great Startup Ideas Come From: Stripe'
                    }
                ]*/
                if (data) {
                    setUserNotes(data);
                }
            })
        }).catch((err) => {
            console.log('error while getting me', err);
            setUser(null);
            setLoading(false);
        });
    }

    useEffect(() => {
        if (!user || !preferences) {
            fetchUserData();
        }
    }, [])

    return (
        <AuthContext.Provider value={{user, loading, setUser, preferences, setPreferences, userNotes, setUserNotes}}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;


