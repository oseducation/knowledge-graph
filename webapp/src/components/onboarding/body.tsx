import * as React from 'react';
import {Button, Typography, Box} from '@mui/material';

import {Step} from '../../types/onboarding';

interface Props {
    step: Step;
    onContinue: () => void;
}

const Body = (props: Props) => {
    if (props.step.component) {
        return props.step.component;
    }

    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} width={'400px'} mt={10}>
            <img src={props.step.image} alt={props.step.title} width={'100%'}/>
            <Typography variant='h5' fontWeight={'bold'} m={1}>
                {props.step.title}
            </Typography>
            <Typography variant='body2' m={1}>
                {props.step.description}
            </Typography>
            <Button variant='contained' color='primary' size={'large'} fullWidth sx={{mt:10}} onClick={props.onContinue}>
                Continue
            </Button>
        </Box>
    );
}

export default Body;
