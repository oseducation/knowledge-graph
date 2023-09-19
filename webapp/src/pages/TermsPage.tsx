import React from 'react';
import { Container, Typography } from '@mui/material';

const Terms = () => {
    return (
        <Container>
            <Typography variant="h2">Terms and Conditions</Typography>

            <Typography variant="h5">1. Introduction</Typography>
            <Typography paragraph>
                Welcome to Vitsi! These terms and conditions outline the rules and regulations for the use of Vitsi&apos;s Website, located at www.vitsi.ai.
                By accessing this website we assume you accept these terms and conditions. Do not continue to use Vitsi if you do not agree to take all of the terms and conditions stated on this page.
            </Typography>
            <Typography variant="h5">2. License</Typography>
            <Typography paragraph>
                Unless otherwise stated, Vitsi and/or its licensors own the intellectual property rights for all material on Vitsi. All intellectual property rights are reserved. You may access this from Vitsi for your own personal use subjected to restrictions set in these terms and conditions.
            </Typography>
            <Typography variant="h5">3. Cookies</Typography>
            <Typography paragraph>
                We employ the use of cookies. By accessing Vitsi, you agreed to use cookies in agreement with the Vitsi&apos;s Privacy Policy.
            </Typography>
            <Typography variant="h5">4. User Content</Typography>
            <Typography paragraph>
                Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Vitsi does not filter, edit, publish or review Comments prior to their presence on the website.
            </Typography>
            <Typography variant="h5">5. Hyperlinking to our Content</Typography>
            <Typography paragraph>
                You may link to our Website without prior written approval.
            </Typography>
            <Typography variant="h5">6. Content Liability</Typography>
            <Typography paragraph>
                We shall not be hold responsible for any content that appears on Website
            </Typography>
            <Typography variant="h5">7. Removal of links from our website</Typography>
            <Typography paragraph>
                If you find any link on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.
            </Typography>
            <Typography variant="h5">8. Changes to these Terms and Conditions</Typography>
            <Typography paragraph>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
            </Typography>
        </Container>
    );
};

export default Terms;
