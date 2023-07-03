import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import * as React from "react";

import Footer from "./components/footer";


const FooterContainer: React.FC = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
            }}
        >
            <Container maxWidth={false}>
                <Footer/>
            </Container>
        </Box>);
}

export default FooterContainer;
