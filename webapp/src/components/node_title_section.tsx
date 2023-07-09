import {Box, Paper} from "@mui/material";
import {LoadingButton} from '@mui/lab';

import React from "react";


interface Props {
    nodeTitle: string;
    nodeDescription: string;
    loading: boolean;
    onMarlAsKnown: () => void;
}

const NodeTitleSection = (props: Props) => {
    return (
        <Paper sx={{
            p: 2,
            mb: 2,
            width: '100%',
        }}>
            <Box display={"flex"} flexDirection={"row"} sx={{
                justifyContent: "space-between",
            }}>
                <Box flexDirection={"column"}>
                    <h1>{props.nodeTitle}</h1>
                    <p>{props.nodeDescription}</p>
                </Box>
                <LoadingButton
                    loading={props.loading}
                    variant="contained"
                    onClick={props.onMarlAsKnown}
                    sx={{
                        alignSelf: "center",
                        ml: 2,
                    }}
                >
                    I know this
                </LoadingButton>
            </Box>
        </Paper>
    );
}

export default NodeTitleSection;
