import React, {useState, useEffect} from 'react';
import {Button, TextField, Stack, Container, Paper, Avatar, Typography, InputLabel} from '@mui/material';
import {Person} from '@mui/icons-material';

import useAuth from "../hooks/useAuth";
import Header from "../components/header";
import Footer from "../components/footer";
import {Client} from "../client/client";
import {User} from '../types/users';

const ProfilePage: React.FC = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState<any>();
    const [hasChanges, setHasChanges] = useState(false);

    const {user} = useAuth();

    useEffect(() => {
        if (user) {
            setName(user.first_name || '');
            setSurname(user.last_name || '');
            setUsername(user.username || '');
            setProfilePic(null);
        }
    }, [user]);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        setHasChanges(true);
    };

    const handleSurnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSurname(event.target.value);
        setHasChanges(true);
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
        setHasChanges(true);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const updatedUser = {
            ...user,
            first_name: name,
            last_name: surname,
            username: username,
        };
        Client.User().update(updatedUser as User).then(() => {
            Client.User().getMe().then(() => {
                setHasChanges(false);
            })
        })


    };

    const allFieldsValid = name.trim() !== '' && surname.trim() !== '' && username.trim() !== '';

    return (
        <Stack>
            <Header/>
            <Container maxWidth="xs" style={{height: '100vh', display: 'flex', alignItems: 'center'}}>
                <Paper style={{width: '100%', padding: '32px'}} elevation={3}>
                    <Typography variant="h5" style={{textAlign: 'center', marginBottom: '16px'}}>
                        Account Information
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Avatar
                                src={profilePic}
                                style={{width: '100px', height: '100px', margin: '0 auto'}}
                            >
                                {profilePic ? null : <Person/>}
                            </Avatar>
                            <InputLabel>First Name</InputLabel>
                            <TextField
                                value={name}
                                onChange={handleNameChange}
                                required
                                error={name.trim() === ''}
                                helperText={name.trim() === '' ? 'First Name is required' : ''}
                            />
                            <InputLabel>Last Name</InputLabel>
                            <TextField
                                value={surname}
                                onChange={handleSurnameChange}
                                required
                                error={surname.trim() === ''}
                                helperText={surname.trim() === '' ? 'Last Name is required' : ''}
                            />
                            <InputLabel>Username</InputLabel>
                            <TextField
                                value={username}
                                onChange={handleUsernameChange}
                                required
                                error={username.trim() === ''}
                                helperText={username.trim() === '' ? 'Username is required' : ''}
                            />
                            <Button type="submit" disabled={!allFieldsValid || !hasChanges}>
                                Save
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
            <Footer/>
        </Stack>
    );
};

export default ProfilePage
