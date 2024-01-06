import {ThemeProvider, Typography, createTheme, responsiveFontSizes} from '@mui/material';
import React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import useQuery from '../../hooks/useQuery';

const Thanks = () => {
    let theme = createTheme();
    theme = responsiveFontSizes(theme);

    const query = useQuery();
    const name = query.get("name");
    if (!name) {
        return null;
    }


    return (
        <ThemeProvider theme={theme}>
            <Grid2 sx={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <Typography variant="h3" sx={{ml: 2}} component="span" color={'black'}>
                    {name}
                </Typography>
            </Grid2>
            <Grid2 sx={{display:'flex', alignItems:'flex-start', flexDirection:'column', marginLeft:2, mt:10}}>
                <Typography variant="h3" component="span" color={'black'}>
                    Thank you!
                </Typography>
                <Typography variant="h3" component="span" color={'black'}>
                    We will be in touch soon.
                </Typography>
            </Grid2>
        </ThemeProvider>
    );
}

export default Thanks;
