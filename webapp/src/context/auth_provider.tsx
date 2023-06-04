import React, {createContext, useEffect, useState} from 'react';

import {User} from '../types/users';
import {Client} from "../client/client";

interface UserContextState {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>> | null;
}

const AuthContext = createContext<UserContextState>({
    user: null,
    loading: true,
    setUser: null
});

interface Props {
    children: React.ReactNode
}

export const AuthProvider = (props: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true)

    async function getUser() {
        await setLoading(true);
        if (user !== null) {
            return user;
        }
        return Client.User().getMe()
            .catch(() => null)
    }

    async function isAuthenticated() {
        const user = await getUser();
        await setUser(user);
        await setLoading(false)
    }

    useEffect(() => {
        isAuthenticated();
    }, [])

    return (
        <AuthContext.Provider value={{user, loading, setUser}}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;


