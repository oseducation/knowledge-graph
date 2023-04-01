import React from 'react';
import './App.css';
import {Routes, Route} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';


function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/welcome" element={<WelcomePage/>}/>
        </Routes>
    );
}

export default App;
