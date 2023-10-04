import {Box, Link, List, ListItem, Paper} from "@mui/material";
import {useTranslation} from "react-i18next";
import React from "react";

import IKnowThisButton from "./I_konw_this_button";

import {Node} from "./../types/graph";


interface Props {
    nodeTitle: string;
    nodeDescription: string;
    nodeFinished: boolean;
    loading: boolean;
    prerequisites: Node[];
    onMarkAsKnown: () => void;
    onMarkAsStarted: () => void;
}

const NodeTitleSection = (props: Props) => {
    const {t} = useTranslation();
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
                    <p>{t("Prerequisite Topics")}:</p>
                    <List dense={true}>
                        {props.prerequisites && props.prerequisites.map(n =>
                            <ListItem key={n.id}>
                                <Link href={`/nodes/${n.id}`} target="_blank" rel="noopener">
                                    {n.name}
                                </Link>
                            </ListItem>
                        )}
                    </List>
                </Box>

                <IKnowThisButton
                    isNodeFinished={props.nodeFinished}
                    loading={props.loading}
                    onMarkAsKnown={props.onMarkAsKnown}
                    onMarkAsStarted={props.onMarkAsStarted}
                />
            </Box>
        </Paper>
    );
}

export default NodeTitleSection;
