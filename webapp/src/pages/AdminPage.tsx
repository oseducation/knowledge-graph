import React, {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Paper
} from '@mui/material';
import {useNavigate} from 'react-router-dom';

import {Client} from '../client/client';
import {UserWithNodeCount} from '../types/users';

const AdminPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([] as UserWithNodeCount[]);

    useEffect(() => {
        Client.User().getUsersWithNodeCount().then((data) => setUsers(data.sort((a, b) => {return b.created_at - a.created_at})));
    }, []);

    return (
        <Paper elevation={3}>
            <Typography variant="h4" component="div" style={{padding: '16px'}}>
                User List
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>Num</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>ID</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>Name</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>Email</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>Username</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>Finished</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>In Progress</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>Graph</TableCell>
                            <TableCell sx={{backgroundColor: 'grey', fontWeight: 'bold'}}>Chat</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow
                                key={user.id}
                                sx={{'&:nth-of-type(odd)': {backgroundColor: theme => theme.palette.action.hover}}}
                            >
                                <TableCell>{index}</TableCell>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.first_name + ' ' + user.last_name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.finished_node_count}</TableCell>
                                <TableCell>{user.in_progress_node_count}</TableCell>
                                <TableCell>
                                    <Button
                                        variant='text'
                                        style={{margin: '10px'}}
                                        onClick={() => navigate(`/graph/${user.id}`)}
                                    >
                                        {"view graph"}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant='text'
                                        style={{margin: '10px'}}
                                        onClick={() => navigate(`/chat/${user.id}`)}
                                    >
                                        {"view chat"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default AdminPage;
