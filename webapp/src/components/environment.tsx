import React from 'react';
import {Container, Typography, Button} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

interface Props {
    nodeID: string;
    nodeName: string;
    environmentType: string;
}

const EnvironmentTeaser = (props: Props) => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    return (
        <Container style={{display: 'flex', alignItems: 'center'}}>
            <Typography>
                {t("Try out karel here")}
            </Typography>
            <Button
                variant="contained"
                onClick={() => {
                    navigate(`/${props.environmentType}?node_id=${props.nodeID}&node_name=${props.nodeName}`)
                }}
                sx={{m:2}}
            >
                {t("Karel Environment")}
            </Button>
        </Container>
    );
}

export default EnvironmentTeaser;
