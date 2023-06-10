import React from 'react';
import './App.css';
import {Routes, Route} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import NodePage from './pages/NodePage';
import RequireAuth from './components/require_auth';
import {ROLES} from './types/users';
import ProfilePage from "./pages/ProfilePage";


function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
            <Route element={<RequireAuth allowedRoles={[ROLES.User]}/>}>
                <Route path="/nodes/:nodeID" element={<NodePage/>}/>
                <Route path="/welcome" element={<WelcomePage/>}/>
            </Route>
        </Routes>
    );
}

export default App;
