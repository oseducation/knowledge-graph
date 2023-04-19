import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Stack, Typography, Box} from '@mui/material';
import {Container} from '@mui/system';


const Content = () => {
    const navigate = useNavigate();

    return (
        <Box
            id='content'
            alignItems={'center'}
            display={'flex'}
            height={300}
            bgcolor={'primary.dark'}
        >
            <Container>
                <Stack direction={'row'}>
                    <Stack p={'0 100px'}>
                        <Typography
                            fontSize={32}
                            fontWeight={'bold'}
                            color={'white'}
                            p={'30px 0'}
                        >
                            Lifelong Learning
                        </Typography>
                        <Typography
                            fontSize={26}
                            fontWeight={'bold'}
                            color={'white'}
                        >
                            Explore the world&apos;s knowledge, curated just for you
                        </Typography>
                    </Stack>
                    <Box display={'flex'} alignItems={'center'}>
                        <Button variant='contained' color='secondary' size='large' onClick={() => navigate('/register')}>Sign Up For Free</Button>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};


export default Content;
