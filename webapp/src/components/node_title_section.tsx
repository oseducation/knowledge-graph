import {Box, Paper} from "@mui/material";

import React from "react";

import IKnowThisButton from "./I_konw_this_button";


interface Props {
    nodeTitle: string;
    nodeDescription: string;
    nodeFinished: boolean;
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
                <IKnowThisButton
                    isNodeFinished={props.nodeFinished}
                    loading={props.loading}
                    onMarkAsKnown={props.onMarlAsKnown}/>
            </Box>
        </Paper>
    );
}

export default NodeTitleSection;
