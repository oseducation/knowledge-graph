import {Box, Button, FormControl, TextField, ThemeProvider, Typography, createTheme, responsiveFontSizes} from '@mui/material';
import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import {Client} from '../../client/client';

const Calculus = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');

    let theme = createTheme();
    theme = responsiveFontSizes(theme);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid2 sx={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <Typography variant="h3" sx={{ml: 2}} component="span" color={'black'}>
                    Learn Calculus With AI Tutor
                </Typography>
                <Button variant="text" size='large' sx={{mr: 2, ml: 2}} onClick={() => navigate('/en')}>
                    Vitsi AI
                </Button>
            </Grid2>
            <Grid2 sx={{display:'flex', alignItems:'center', flexDirection:{xs:'column', md:'row'}}}>
                <Grid2 sx={{width: {xs:'100%', md:'50%'}, marginLeft:2, mt:10}}>
                    <Typography variant="h3" component="span" color={'black'}>
                        Master Calculus faster and smarter by learning 5-minute topics daily with
                        our AI tutor
                    </Typography>
                    <FormControl sx={{display:'flex', flexDirection:'row', mt:10}}>
                        <TextField
                            value={email}
                            id="outlined-basic"
                            label="Email Address"
                            variant="outlined"
                            onChange={handleInputChange}
                        />
                        <Button
                            variant="outlined"
                            sx={{
                                mr: 2,
                                ml: 2,
                                bgcolor: 'white',
                                color: 'black',
                                borderColor: 'black',
                                borderWidth: '2px',
                            }}
                            onClick={() => {
                                Client.Experiments().addCalculus(email);
                                navigate('/experiments/thanks?name=Learn Calculus With AI Tutor');
                            }}>
                            Sign Up
                        </Button>
                    </FormControl>
                </Grid2>
                <Box sx={{width: {xs:'100%', md:'50%'}}} component='img' src='/experiments/calculus.jpg'/>
            </Grid2>
        </ThemeProvider>
    );
}

export default Calculus;
