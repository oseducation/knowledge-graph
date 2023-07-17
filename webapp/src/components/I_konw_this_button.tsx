import {LoadingButton} from "@mui/lab";
import {CheckCircle} from "@mui/icons-material";
import React from "react";

type Props = {
    isNodeFinished: boolean;
    loading: boolean;
    onMarkAsKnown: () => void;
}
const IKnowThisButton = (props: Props) => {
    return (
        <>
            {props.isNodeFinished ?
                <>
                    <LoadingButton
                        disabled={props.isNodeFinished}
                        loading={props.loading}
                        endIcon={<CheckCircle color={"success"}></CheckCircle>}
                        variant="outlined"
                        onClick={props.onMarkAsKnown}
                        sx={{
                            "&.Mui-disabled": {
                                color: "success.main"
                            },
                            outlineColor: "success.main",
                            alignSelf: "center",
                            ml: 2,
                        }}
                    >
                        Finished
                    </LoadingButton>
                </>
                :
                <>
                    <LoadingButton
                        disabled={props.isNodeFinished}
                        loading={props.loading}
                        variant="contained"
                        onClick={props.onMarkAsKnown}
                        sx={{
                            alignSelf: "center",
                            ml: 2,
                        }}
                    >
                        I know this
                    </LoadingButton>
                </>
            }
        </>
    );
}

export default IKnowThisButton;
