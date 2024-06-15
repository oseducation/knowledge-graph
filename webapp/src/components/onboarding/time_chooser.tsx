import * as React from 'react';
import {Typography, Box} from '@mui/material';

import {StyledButton} from './goal_chooser';

interface Props {
    onContinue: (goal: string) => void;
}

const TimeChooser = (props: Props) => {

    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} width={'400px'} mt={6}>
            <Typography variant='h5' fontWeight={'bold'} m={1}>
                {"How much time can you dedicate to learning each day?"}
            </Typography>
            <Typography variant='body1' m={1}>
                {"Select your daily learning time:"}
            </Typography>

            <Box>
                <StyledButton variant='contained' size='large' color='primary' fullWidth sx={{m:1}} onClick={() => {props.onContinue('5min')}}>
                    5 minutes
                </StyledButton>
                <StyledButton variant='contained' size='large' color='primary' fullWidth sx={{m:1}} onClick={() => {props.onContinue('15min')}}>
                    15 minutes
                </StyledButton>
                <StyledButton variant='contained' size='large' color='primary' fullWidth sx={{m:1}} onClick={() => {props.onContinue('30min')}}>
                    30 minutes
                </StyledButton>
                <StyledButton variant='contained' size='large' color='primary' fullWidth sx={{m:1}} onClick={() => {props.onContinue('2hours')}}>
                    2+ hours
                </StyledButton>
            </Box>
        </Box>
    );
}

export default TimeChooser;

