import * as React from 'react';
import {Button, Typography, Box, styled} from '@mui/material';

interface Props {
    onContinue: (goal: string) => void;
}

const GoalChooser = (props: Props) => {

    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} width={'400px'} mt={10}>
            <img src={"./images/onboarding/goal.png"} alt={'goals'} width={'100%'}/>
            <Typography variant='h5' fontWeight={'bold'} m={1}>
                {"Yay, glad you are here! Let's start by setting your goals."}
            </Typography>
            <Typography variant='body1' m={1}>
                {"What are you looking to achieve with VitsiAI? The choice won’t limit your experience"}
            </Typography>

            <Box>
                <StyledButton variant='contained' size='large' color='primary' fullWidth sx={{m:1}} onClick={() => {props.onContinue('startup')}}>
                    <Typography textAlign={'left'} variant='body1'>
                        Learn how to build a Startup
                    </Typography>
                </StyledButton>
                <StyledButton variant='contained' size='large' color='primary' fullWidth sx={{m:1}} onClick={() => {props.onContinue('gmat')}}>
                    Ace the GMAT
                </StyledButton>
            </Box>

            {/* <Button variant='contained' color='primary' fullWidth sx={{m:10}} onClick={props.onContinue}>
                Continue
            </Button> */}
        </Box>
    );
}

export default GoalChooser;

export const StyledButton = styled(Button)(({theme}) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: '12px',
    padding: '8px 24px',
    height: '64px',
    color: theme.palette.common.black,
    boxShadow: 'none',
    border: `2px solid ${theme.palette.grey[300]}`,
    textTransform: 'none',
    justifyContent: 'flex-start',
    '&:hover': {
        borderColor: `${theme.palette.primary.main}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'none',
    },
}));
