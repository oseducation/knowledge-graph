import React, {useEffect} from 'react';
import {InputBase, Autocomplete, useTheme} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {useLocation} from 'react-router-dom';

import useGraph from '../../hooks/useGraph';
import {DashboardColors} from '../../ThemeOptions';
import {getGraphForParent} from '../../context/graph_provider';
import {Graph} from '../../types/graph';

const SearchBar = () => {
    const location = useLocation();
    const {globalGraph, setSelectedNode, setFocusedNodeID, setParentID} = useGraph();
    const theme = useTheme();
    const [startupGraph, setStartupGraph] = React.useState<Graph | null>(null);


    useEffect(() => {
        if (!globalGraph){
            return;
        }
        for(const node of globalGraph.nodes) {
            if(node.name === 'Intro to Startups' && node.parent_id === '') {
                const g = getGraphForParent(globalGraph, node.id);
                setStartupGraph(g);
                return;
            }
        }
    }, [globalGraph]);

    if (!startupGraph) {
        return null;
    }
    if (!location.pathname.endsWith('graph')) {
        return null;
    }

    return (
        <Autocomplete
            options={startupGraph.nodes}
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
                        autoComplete='off'
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
                for (const node of startupGraph.nodes) {
                    if (node.name === newInputValue) {
                        if (node.parent_id !== ''){
                            setParentID(node.parent_id);
                        } else {
                            setParentID('');
                        }
                        setSelectedNode(node);
                        setFocusedNodeID(node.id);
                        return;
                    }
                }
            }}
        />
    );
}

export default SearchBar;
