import React, { useEffect } from 'react';
import {Box, Stack, Typography} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

import {Client} from '../../../client/client';
import {Graph} from '../../../types/graph';
import GraphComponent from '../../graph/graph_component';
import {filterGraph} from '../../../context/graph_provider';

interface Props {
    height: string;
    color: string;
}

const Content = (props: Props) => {
    const {t} = useTranslation();
    const [graph, setGraph] = React.useState<Graph | null>(null);

    useEffect(() => {
        Client.Graph().getStaticGraph().then((data: Graph | null) => {
            if (!data) {
                setGraph(null);
                return;
            }
            setGraph(filterGraph(data));
        });
    }, [])

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='content-section'
            height={props.height}
            bgcolor={props.color}
            padding={0}
            sx={{
                scrollSnapAlign: 'start',
                display: {xs: 'none', sm: 'none', md: 'flex'}
            }}

        >
            <Stack
                m={{xs: 0, sm: 4, md: 10}}
            >
                <Typography
                    variant='h3'
                    fontWeight={'bold'}
                    color={'black'}
                    p={'30px 0'}
                >
                    {t("Course Content")}
                </Typography>

            </Stack>

            <Box flexGrow={1}>
                {graph && graph.nodes?
                    <GraphComponent
                        graph={graph}
                        drawGoalPath={false}
                        noClick={true}
                        heightAdjust={100}
                    />
                    :
                    <div>Loading Graph...</div>
                }
            </Box>
        </Grid2>
    )
}

export default Content;
