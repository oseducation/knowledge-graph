import React, {useEffect, useState} from 'react';
import {Avatar, Button, Container, InputLabel, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography, tableCellClasses} from '@mui/material';
import {Person} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

import useAuth from "../hooks/useAuth";
import {Client} from "../client/client";
import {Plan, User} from '../types/users';
import UpgradeModal from '../components/pricing/upgrade_modal';

const ProfilePage: React.FC = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState<any>();
    const [hasChanges, setHasChanges] = useState(false);
    const {t} = useTranslation();

    const [open, setOpen] = useState(false);

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
    const plan = getUserPlan(user);

    return (
        <Container style={{display: 'flex', alignItems: 'center'}}>
            <Paper style={{width: '100%', padding: '32px'}} elevation={3}>
                <Typography variant="h5" style={{textAlign: 'center', marginBottom: '16px'}}>
                    {t("Account Information")}
                </Typography>

                {user &&
                    <TableContainer component={Paper} sx={{m:2}}>
                        <Table
                            aria-label="simple table"
                            sx={{
                                [`& .${tableCellClasses.root}`]: {
                                    borderBottom: "none"
                                }
                            }}
                        >
                            <TableBody>
                                <TableRow
                                    key={"plan"}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">Plan</TableCell>
                                    <TableCell align="right">{plan.name}</TableCell>
                                </TableRow>
                                <TableRow
                                    key={"questions"}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">AI prompts daily</TableCell>
                                    <TableCell align="right">{plan.number_of_questions_daily}</TableCell>
                                </TableRow>
                                <TableRow
                                    key={"chatgpt"}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">ChatGPT Version</TableCell>
                                    <TableCell align="right">{plan.chat_gpt_version}</TableCell>
                                </TableRow>
                                <TableRow
                                    key={"price"}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">Price</TableCell>
                                    <TableCell align="right">{plan.price}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        {user && user.role === 'user' &&
                            <>
                                <Button
                                    sx={{display: 'flex', justifyContent:'flex-end'}}
                                    onClick={() => setOpen(true)}
                                >
                                    Upgrade Plan
                                </Button>
                                <UpgradeModal open={open} onClose={() => setOpen(false)}/>
                            </>
                        }
                        {user && user.role === 'customer' &&
                            <Button
                                sx={{display: 'flex', justifyContent:'flex-end'}}
                                href={'https://billing.stripe.com/p/login/28o8yE3EQ8B09IQeUU'}
                            >
                                Manage Subscription
                            </Button>
                        }
                    </TableContainer>
                }
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

export const getUserPlan = (user: User | null): Plan => {
    if (user && (user.role === 'customer' || user.role === 'admin')) {
        return {
            name: 'Premium',
            number_of_questions_daily: 'unlimited',
            chat_gpt_version: '4.0',
            price: '$20/month',
            url: 'https://www.google.com',
        }
    }
    return {
        name: 'Free',
        number_of_questions_daily: '10',
        chat_gpt_version: '3.5',
        price: '0',
        url: 'https://www.google.com',
    }

}
