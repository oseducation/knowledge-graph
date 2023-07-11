import React from 'react';
import {Typography, Box, Container} from '@mui/material';

const PrivacyPolicy = () => {
    return (
        <Container>
            <Box my={2}>
                <Typography variant="h2">Privacy Policy</Typography>
                <Typography variant="body1" paragraph>
                    Your privacy is important to us. It is Company&apos;s policy to respect your privacy regarding any information we may collect from you across our website, http://www.vitsi.ai, and other sites we own and operate.
                </Typography>
                <Typography variant="h4">Information we collect</Typography>
                <Typography variant="body1" paragraph>
                    We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
                </Typography>
                <Typography variant="h4">How we use your information</Typography>
                <Typography variant="body1" paragraph>
                    We only use your personal information to provide you with information or services you request from us, or to fulfill our legal obligations. We do not share your personal data with third-parties, except where required by law or to protect our rights.
                </Typography>
                <Typography variant="h4">Your rights</Typography>
                <Typography variant="body1" paragraph>
                    You have the right to access, correct, or delete your personal information. You can do this by contacting us at info@vitsi.ai.
                </Typography>
                <Typography variant="body1" paragraph>
                    We review our privacy practices regularly and will update this policy as necessary. It was last updated on July 10, 2023.
                </Typography>
                <Typography variant="body1" paragraph>
                    For any questions or concerns about your privacy, you may contact us using the information below:
                </Typography>
                <Typography variant="body1" paragraph>
                    Email: info@vitsi.ai
                </Typography>
            </Box>
        </Container>
    );
}

export default PrivacyPolicy;
