import React from 'react';
import {Grid, Link, Typography} from '@mui/material';

const Footer = () => {
    return (
        <Grid container spacing={4} mt={'20px'}>
            <Grid item xs={12} sm={6}>
                <Typography variant='h5' gutterBottom>
                    Vitsi AI
                </Typography>
                <ul>
                    <li>
                        <Link href='/about' underline='none'>
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href='/terms' underline='none'>
                            Terms
                        </Link>
                    </li>
                    <li>
                        <Link href='/privacy' underline='none'>
                            Privacy
                        </Link>
                    </li>
                    <li>
                        <Link href='/contact' underline='none'>
                            Contact Us
                        </Link>
                    </li>
                </ul>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant='h5' gutterBottom>
                    Community
                </Typography>
                <ul>
                    <li>
                        <Link
                            href='https://github.com/oseducation/knowledge-graph'
                            underline='none'
                            rel='noopener noreferrer'>
                            GitHub
                        </Link>
                    </li>
                    <li>
                        <Link
                            href='https://discord.gg/qGvkkd3eTM'
                            underline='none' target="_blank"
                            rel='noopener noreferrer'>
                            Discord
                        </Link>
                    </li>
                </ul>
            </Grid>
        </Grid>
    );
}

export default Footer;
