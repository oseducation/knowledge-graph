import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import * as React from "react";

import Footer from "./components/footer";
import {useLocation} from "react-router-dom";
import useAuth from "./hooks/useAuth";


const FooterContainer: React.FC = () => {
    const location = useLocation();
    const {user} = useAuth()

    console.log(location.pathname)
    if ((location.pathname == '/' && user != null)) {
        return null;
    }
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
