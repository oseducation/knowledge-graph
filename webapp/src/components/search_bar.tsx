import React from 'react';
import {alpha, InputBase} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {styled} from "@mui/material/styles";

const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        flexGrow: 1
    },
}));


const SearchIconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            flexGrow: 1,
        },
    },
}));

const SearchBar = () => {
    return <Search>
        <SearchIconWrapper>
            <SearchIcon/>
        </SearchIconWrapper>
        <StyledInputBase
            placeholder="Search for a topic"
            inputProps={{'aria-label': 'search'}}
        />
    </Search>;
}

export default SearchBar;
