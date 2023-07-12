import React from 'react';
import './App.css';
import {Routes, Route} from 'react-router-dom';
import {useMediaQuery, Theme} from '@mui/material';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import NodePage from './pages/NodePage';
import RequireAuth from './components/require_auth';
import {ROLES} from './types/users';
import VerifyPage from "./pages/VerifyPage";
import DoVerifyEmailPage from "./pages/DoVerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import CarouselPage from './pages/CarouselPage';
import ContactUs from './pages/ContactUsPage';
import Terms from './pages/TermsPage';
import PrivacyPolicy from './pages/PrivacyPage';

function App() {
    const isSmallScreen = useMediaQuery<Theme>((theme: Theme) => theme.breakpoints.down('lg'));
    if (isSmallScreen) {
        return <div>Sorry, this app is not optimized for mobile devices. Please visit us on a larger screen for the best experience.</div>
    }
    return (
        <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/verify" element={<VerifyPage/>}/>
            <Route path="/do_verify_email" element={<DoVerifyEmailPage/>}/>
            <Route path="/contact" element={<ContactUs/>}/>
            <Route path="/terms" element={<Terms/>}/>
            <Route path="/privacy" element={<PrivacyPolicy/>}/>
            <Route element={<RequireAuth allowedRoles={[ROLES.User]}/>}>
                <Route path="/nodes/:nodeID" element={<NodePage/>}/>
                <Route path="/welcome" element={<WelcomePage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/carousel" element={<CarouselPage/>}/>
            </Route>
        </Routes>
    );
}

export default App;
