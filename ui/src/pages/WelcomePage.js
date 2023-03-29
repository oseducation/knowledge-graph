import {Button, Stack} from "@mui/material";
import axios from "axios";
import {useNavigate} from "react-location";

const WelcomePage = () => {

    const navigate = useNavigate();

    const logOutHandler = () => {
        axios.post("/api/v1/users/logout").then(r => {
            navigate({to: "/login"})
        })
    }

    return (
        <Stack direction={'column'} justifyContent={'center'} alignItems={'center'}>
            <h1>Welcome Page!</h1>
            <Button onClick={logOutHandler}>Log Out</Button>
        </Stack>
    )

}

export default WelcomePage;