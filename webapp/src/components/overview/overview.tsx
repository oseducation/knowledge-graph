import * as React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import Snippets from './snippets';
import Goals from './goals';
import Progress from './progress';
import Activity from './activity';
import TopPerformers from './top_performers';


const Overview = () => {
    return (
        <Grid2 display={'flex'} flexDirection={'row'} m={1}>
            <Grid2 xs={8} display={'flex'} flexDirection={'column'} m={1}>
                <Snippets/>
                <Goals/>
                <Progress/>
            </Grid2>
            <Grid2 xs={4} display={'flex'} flexDirection={'column'} m={1}>
                <Activity/>
                <TopPerformers/>
            </Grid2>
        </Grid2>
    );
}

export default Overview;
