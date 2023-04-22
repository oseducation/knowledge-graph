import React, {createContext, useState}  from 'react';

import {User} from '../types/users';


interface UserContextState {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>> | null;
}

const AuthContext = createContext<UserContextState>({
    user: null,
    setUser: null
});

interface Props{
    children: React.ReactNode
}

export const AuthProvider = (props: Props) => {
    const [user, setUser] = useState<User | null>(null);

    return (
        <AuthContext.Provider value={{user, setUser}}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;


