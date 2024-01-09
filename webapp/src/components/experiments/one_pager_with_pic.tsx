import {Box, Button, FormControl, TextField, ThemeProvider, Typography, createTheme, responsiveFontSizes} from '@mui/material';
import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

interface Props {
    imageURL: string;
    name: string;
    description: string;
    onSignUp: (email: string) => void;
    comingSoon?: boolean;
}

const OnePagerWithPicture = (props: Props) => {
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
                    {props.name}
                </Typography>
                <Button variant="text" size='large' sx={{mr: 2, ml: 2}} onClick={() => navigate('/en')}>
                    Vitsi AI
                </Button>
            </Grid2>
            <Grid2 sx={{display:'flex', alignItems:'center', flexDirection:{xs:'column', md:'row'}}}>
                <Grid2 sx={{width: {xs:'100%', md:'50%'}, marginLeft:2, mt:10}}>
                    <Typography variant="h3" component="span" color={'black'}>
                        {props.description}
                    </Typography>

                    {props.comingSoon &&
                        <div>
                            <br/>
                            <br/>
                            <Typography variant="h2" component="span" color={'black'}>
                                Coming Soon
                            </Typography>
                        </div>
                    }
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
                                props.onSignUp(email);
                                navigate(`/experiments/thanks?name=${props.name}`);
                            }}>
                            Sign Up
                        </Button>
                    </FormControl>
                </Grid2>
                <Box sx={{width: {xs:'100%', md:'50%'}}} component='img' src={props.imageURL}/>
            </Grid2>
        </ThemeProvider>
    );
}

export default OnePagerWithPicture;
