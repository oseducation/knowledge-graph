import React from 'react';
import {Container, Paper, IconButton, InputBase} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
    return (
        <Container id='search_bar_container'>
            <Paper
                component='form'
                sx={{p: '2px 4px', display: 'flex', alignItems: 'center'}}
            >
                <InputBase
                    sx={{ml: 1, flex: 1}}
                    placeholder='Search for a topic'
                    inputProps={{'aria-label': 'search for a topic'}}
                />
                <IconButton type='button' sx={{p: '10px'}} aria-label='search'>
                    <SearchIcon />
                </IconButton>
            </Paper>
        </Container>
    );
}

export default SearchBar;
