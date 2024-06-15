import React, {useEffect, useState} from 'react';
import {Autocomplete, Box, Button, InputBase, TextField, useTheme} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

import {Client} from '../client/client';
import {Graph, NodeStatusFinished, NodeStatusUnseen} from '../types/graph';
import GraphComponent from '../components/graph/graph_component';
import {filterGraph} from '../context/graph_provider';
import {findRedundantLinks} from '../components/graph/graph_helpers';
import {DashboardColors} from '../ThemeOptions';

const GraphManipulationPage = () => {
    const [graph, setGraph] = useState({} as Graph);
    const [url, setURL] = useState('');
    const theme = useTheme();
    const [currentNodeID, setCurrentNodeID] = useState('');

    useEffect(() => {
        if (url === '') {
            Client.Graph().getStaticGraph().then((data) => {
                const filteredGraph = filterGraph(data);
                setGraph(filteredGraph)
            });
        } else {
            downloadGraph(url).then((data) => {
                setGraph(data)
            });
        }
    }, [url]);

    const handleURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setURL(event.target.value);
    };

    return (
        <>
            <Box display={'flex'} flexDirection={'row'} alignContent={'center'} alignItems={'center'}>
                <TextField
                    value={url}
                    onChange={handleURLChange}
                    sx={{borderRadius: '12px'}}
                />
                <Button onClick={() => {
                    const newLinks = [];
                    for (let i = 0; i < graph.links.length; i++) {
                        newLinks.push({
                            source: graph.links[i].target,
                            target: graph.links[i].source
                        })
                    }
                    setGraph({
                        nodes: graph.nodes,
                        links: newLinks
                    })
                }}>switch</Button>

                <Autocomplete
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
                        for (const node of graph.nodes) {
                            if (node.name === newInputValue) {
                                setCurrentNodeID(node.id);
                                return;
                            }
                        }
                    }}
                />
            </Box>

            {graph && graph.nodes?
                <GraphComponent
                    graph={graph}
                    drawGoalPath={false}
                    // noClick={true}
                    onClick={(node) => {
                        console.log(node);
                        if (node.status === NodeStatusFinished) {
                            node.status = NodeStatusUnseen
                        } else {
                            node.status = NodeStatusFinished
                        }
                    }}
                    currentNodeID={currentNodeID}
                />
                :
                <div>Loading Graph...</div>
            }
        </>
    );
}

const fetchJSONData = async (url: string): Promise<any> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetching JSON data failed:', error);
        throw error;
    }
};

const downloadGraph = async (url: string): Promise<Graph> => {
    const rawNodes = await fetchJSONData(url + '/nodes.json');
    const rawLinks = await fetchJSONData(url + '/graph.json');
    const nodes = [];
    for (const id in rawNodes) {
        nodes.push({
            id: id,
            name: rawNodes[id].name,
            description: rawNodes[id].description,
            node_type: rawNodes[id].node_type,
            status: NodeStatusUnseen,
            parent_id: rawNodes[id].parent_id
        });
    }

    const links = [];
    for (const target in rawLinks) {
        for (let j = 0; j < rawLinks[target].length; j++) {
            links.push({
                source: rawLinks[target][j],
                target: target
            })
        }

    }

    console.log(findRedundantLinks(links))
    return {nodes, links}
}


export default GraphManipulationPage;
