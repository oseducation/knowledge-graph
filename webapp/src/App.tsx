import React from 'react';
import './App.css';
import {Routes, Route, Navigate} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
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
import AboutUs from './pages/AboutUs';
import AdminPage from './pages/AdminPage';
import GraphPage from './pages/GraphPage';
import KarelPage from './pages/KarelPage';
import GuestLayout from './GuestLayout';
import Landing from './components/landing/landing';
import UserLayout from './UserLayout';
import DashboardLayout from './components/dashboard/dashboard_layout';
import AITutorChat from './components/bot/ai_tutor_chat';
import Overview from './components/overview/overview';
import Graph from './components/dashboard/graph';
import Calculus from './components/experiments/calculus';
import Thanks from './components/experiments/thanks';
import Javascript from './components/experiments/javascript';
import Engineer from './components/experiments/engineer';

function App() {
    return (
        <Routes>
            <Route element={<RequireAuth allowedRoles={[ROLES.User, ROLES.Admin]}/>}>
                <Route path="" element={<UserLayout/>}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />}/>
                    <Route path="/nodes/:nodeID" element={<NodePage/>}/>
                    <Route path="/welcome" element={<WelcomePage/>}/>
                    <Route path="/profile" element={<ProfilePage/>}/>
                    <Route path="/carousel" element={<CarouselPage/>}/>
                    <Route path="/karel_js" element={<KarelPage lang='js'/>}/>
                    <Route path="/karel_java" element={<KarelPage lang='java'/>}/>
                </Route>
                <Route path="dashboard" element={<DashboardLayout/>}>
                    <Route path="" element={<Overview/>}/>
                    <Route path="ai-tutor" element={<AITutorChat/>}/>
                    <Route path="graph" element={<Graph/>}/>
                </Route>
            </Route>
            <Route path="" element={<GuestLayout/>}>
                <Route path="" element={<Landing/>}/>
                <Route path="en" element={<Landing language='en'/>}/>
                <Route path="ge" element={<Landing language='ge'/>}/>
                <Route path="login" element={<LoginPage/>}/>
                <Route path="register" element={<RegisterPage/>}/>
                <Route path="verify" element={<VerifyPage/>}/>
                <Route path="do_verify_email" element={<DoVerifyEmailPage/>}/>
                <Route path="contact" element={<ContactUs/>}/>
                <Route path="terms" element={<Terms/>}/>
                <Route path="privacy" element={<PrivacyPolicy/>}/>
                <Route path="about" element={<AboutUs/>}/>
            </Route>
            <Route path="experiments">
                <Route path="thanks" element={<Thanks/>}/>
                <Route path="calculus" element={<Calculus/>}/>
                <Route path="javascript" element={<Javascript/>}/>
                <Route path="engineer" element={<Engineer/>}/>
            </Route>
            <Route element={<RequireAuth allowedRoles={[ROLES.Admin]}/>}>
                <Route path="/admin" element={<AdminPage/>}/>
                <Route path="/graph/:userID" element={<GraphPage/>}/>
            </Route>
        </Routes>
    );
}

export default App;
