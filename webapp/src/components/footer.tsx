import React from 'react';
import {Grid, Typography, Link} from '@mui/material';


const Footer = () => {
    return (
        <footer>
            <Grid container spacing={4} margin={'10px 20px'}>
                <Grid item xs={12} sm={6}>
                    <Typography variant='h5' gutterBottom>
                        Knowledge Graph
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
                                Contact
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
                            <Link href='https://github.com/oseducation/knowledge-graph' underline='none' rel='noopener noreferrer'>
                                GitHub
                            </Link>
                        </li>
                        <li>
                            <Link href='https://knowledge.cloud.mattermost.com' underline='none' target="_blank" rel='noopener noreferrer'>
                                Mattermost
                            </Link>
                        </li>
                    </ul>
                </Grid>
            </Grid>
        </footer>
    );
}

export default Footer;
