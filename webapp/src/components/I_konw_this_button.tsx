import {LoadingButton} from "@mui/lab";
import React from "react";

type Props = {
    isNodeFinished: boolean;
    loading: boolean;
    onMarkAsKnown: () => void;
    onMarkAsStarted: () => void;
}
const IKnowThisButton = (props: Props) => {
    return (
        <>
            {props.isNodeFinished ?
                <>
                    <LoadingButton
                        loading={props.loading}
                        variant="outlined"
                        onClick={props.onMarkAsStarted}
                        sx={{
                            "&.Mui-disabled": {
                                color: "success.main"
                            },
                            outlineColor: "success.main",
                            alignSelf: "center",
                            ml: 2,
                        }}
                    >
                        Revisit
                    </LoadingButton>
                </>
                :
                <>
                    <LoadingButton
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
