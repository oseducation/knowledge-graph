import React from 'react';
import {InputBase, Autocomplete, useTheme} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {useLocation} from 'react-router-dom';

import useGraph from '../../hooks/useGraph';
import {DashboardColors} from '../../ThemeOptions';

const SearchBar = () => {
    const location = useLocation();
    const {graph, setSelectedNode, setFocusedNodeID} = useGraph();
    const theme = useTheme();

    if (!graph) {
        return null;
    }
    if (!location.pathname.endsWith('graph')) {
        return null;
    }



    return (
        <Autocomplete
            id="search"
            options={graph.nodes}
            getOptionLabel={(option) => option.name}
            disablePortal
            color={'text.secondary'}
            sx={{
                '& + .MuiAutocomplete-popper .MuiAutocomplete-listbox' : {
                    borderRadius: '12px',
                    backgroundColor: theme.palette.background.default,
                    color: 'text.secondary',
                },
                '& + .MuiAutocomplete-popper .MuiAutocomplete-paper' : {
                    borderRadius: '12px',
                    backgroundColor: DashboardColors.onSelect,
                },
            }}

            renderInput={(params) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const {InputLabelProps, InputProps, ...rest} = params;
                return (
                    <InputBase
                        {...params.InputProps} {...rest}
                        placeholder="Search for a topic"
                        endAdornment={<SearchOutlinedIcon/>}
                        sx={{
                            border:'none',
                            flex: 1,
                            pl: 2,
                            borderRadius: '12px',
                            backgroundColor: DashboardColors.onSelect,
                            width: {xs: '200px', sm: '300px', md: '400px', lg: '500px'},
                            color: 'text.secondary',
                        }}
                    />
                )}
            }
            onInputChange={(_, newInputValue) => {
                for (let i=0; i<graph.nodes.length || 0; i++) {
                    if (graph.nodes[i].name === newInputValue) {
                        setSelectedNode(graph.nodes[i]);
                        setFocusedNodeID(graph.nodes[i].id);
                        return;
                    }
                }
            }}
        />
    );
}

export default SearchBar;
