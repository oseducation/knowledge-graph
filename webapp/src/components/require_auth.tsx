import React from 'react'
import {Navigate, Outlet, useLocation} from "react-router-dom";

import useAuth from "../hooks/useAuth";

import Loading from '../components/loading';

interface Props {
    allowedRoles: string[];
}

const RequireAuth = (props: Props) => {
    const {user, loading} = useAuth();
    const location = useLocation();
    if (loading) {
        return <Loading/>
    }
    if (user?.role && props.allowedRoles?.includes(user?.role)) {
        return <Outlet/>
    }
    if (user) {
        return <Navigate to="/unauthorized" state={{from: location}} replace/>
    }
    return <Navigate to="/login" state={{from: location}} replace/>
}

export default RequireAuth;
