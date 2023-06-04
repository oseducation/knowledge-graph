import React from 'react';
import {useLocation, useNavigate} from "react-router-dom";

const VerifyPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate("/login")
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
            <h1 style={{ color: '#444', fontSize: '2rem' }}>Almost There!</h1>
            <p style={{ color: '#666', maxWidth: '60%', textAlign: 'center', marginBottom: '2rem' }}>
                We just sent a verification email to:
                <span style={{ color: '#000', fontWeight: 'bold', marginLeft: '1rem' }}>{location.state?.email}</span>.
                Please check your inbox (and spam folder!) to confirm your account. Let&apos;s get you on board!
            </p>
            <button
                onClick={navigateToLogin}
                style={{
                    backgroundColor: '#008CBA',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#005580'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#008CBA'; }}
            >
                Back to Login
            </button>
        </div>
    );
};

export default VerifyPage;
