import React from 'react'
import {useLocation, Navigate, Outlet} from "react-router-dom";
import useAuth from "../hooks/useAuth";

interface Props {
    allowedRoles: string[];
}

const RequireAuth = (props: Props) => {
    const {user} = useAuth();
    const location = useLocation();

    if (user?.role && props.allowedRoles?.includes(user?.role)){
        return <Outlet/>
    }
    if (user) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace/>
    }
    return <Navigate to="/login" state={{ from: location }} replace/>
}

export default RequireAuth;
