import React, {useEffect, useState} from 'react';
import {Avatar, Button, Container, InputLabel, Paper, Stack, TextField, Typography} from '@mui/material';
import {Person} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

import useAuth from "../hooks/useAuth";
import {Client} from "../client/client";
import {User} from '../types/users';

const ProfilePage: React.FC = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState<any>();
    const [hasChanges, setHasChanges] = useState(false);
    const {t} = useTranslation();

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
        <Container maxWidth="xs" style={{display: 'flex', alignItems: 'center'}}>
            <Paper style={{width: '100%', padding: '32px'}} elevation={3}>
                <Typography variant="h5" style={{textAlign: 'center', marginBottom: '16px'}}>
                    {t("Account Information")}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Avatar
                            src={profilePic}
                            style={{width: '100px', height: '100px', margin: '0 auto'}}
                        >
                            {profilePic ? null : <Person/>}
                        </Avatar>
                        <InputLabel>{t("First Name")}</InputLabel>
                        <TextField
                            value={name}
                            onChange={handleNameChange}
                            required
                            error={name.trim() === ''}
                            helperText={name.trim() === '' ? 'First Name is required' : ''}
                        />
                        <InputLabel>{t("Last Name")}</InputLabel>
                        <TextField
                            value={surname}
                            onChange={handleSurnameChange}
                            required
                            error={surname.trim() === ''}
                            helperText={surname.trim() === '' ? 'Last Name is required' : ''}
                        />
                        <InputLabel>{t("Username")}</InputLabel>
                        <TextField
                            value={username}
                            onChange={handleUsernameChange}
                            required
                            error={username.trim() === ''}
                            helperText={username.trim() === '' ? 'Username is required' : ''}
                        />
                        <Button type="submit" disabled={!allFieldsValid || !hasChanges}>
                            {t("Save")}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};

export default ProfilePage
