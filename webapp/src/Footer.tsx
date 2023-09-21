import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import * as React from "react";

import {useLocation} from "react-router-dom";

import Footer from "./components/footer";

import useAuth from "./hooks/useAuth";


const FooterContainer: React.FC = () => {
    const location = useLocation();
    const {user} = useAuth()

    if (location.pathname !== '/') {
        return null;
    }

    if ((location.pathname == '/' && user != null)) {
        return null;
    }
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
                scrollSnapAlign: 'start'
            }}
        >
            <Container maxWidth={false}>
                <Footer/>
            </Container>
        </Box>);
}

export default FooterContainer;
