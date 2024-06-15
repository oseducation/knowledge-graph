import React, {useState} from 'react';
import {Button, Typography, Box, styled, ToggleButton} from '@mui/material';

import {LearningStyles} from '../../types/onboarding';

interface Props {
    onContinue: (styles: LearningStyles) => void;
}

const LearningStyleChooser = (props: Props) => {
    const [learningStyles, setLearningStyles] = useState<LearningStyles>({
        visual_learning: false,
        auditory_learning: false,
        reading_writing: false,
        kinesthetic: false,
        verbal: false,
        social: false,
        solitary: false,
        other: false
    });

    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} width={'400px'} mt={6}>
            <Typography variant='h5' m={1}>
                <span style={{fontWeight: 'bold'}}>{"What's your preferred learning style? "}</span>(Select all that apply)
            </Typography>
            <Box display={'flex'} flexDirection={'column'} m={1} width={'100%'}>
                <StyledButton fullWidth value={learningStyles.visual_learning} selected={learningStyles.visual_learning} aria-label="visual learning" onClick={() => setLearningStyles({...learningStyles, visual_learning: !learningStyles.visual_learning})}>
                    Visual (seeing)
                </StyledButton>
                <StyledButton fullWidth value={learningStyles.auditory_learning} selected={learningStyles.auditory_learning}  aria-label="auditory learning" onClick={() => setLearningStyles({...learningStyles, auditory_learning: !learningStyles.auditory_learning})}>
                    Auditory (hearing)
                </StyledButton>
                <StyledButton fullWidth value={learningStyles.reading_writing} selected={learningStyles.reading_writing}  aria-label="Reading and writing" onClick={() => setLearningStyles({...learningStyles, reading_writing: !learningStyles.reading_writing})}>
                    Reading/Writing
                </StyledButton>
                <StyledButton fullWidth value={learningStyles.kinesthetic} selected={learningStyles.kinesthetic}  aria-label="Kinesthetic" onClick={() => setLearningStyles({...learningStyles, kinesthetic: !learningStyles.kinesthetic})}>
                    Kinesthetic (doing)
                </StyledButton>
                <StyledButton fullWidth value={learningStyles.verbal} selected={learningStyles.verbal}  aria-label="Verbal or linguistic learning" onClick={() => setLearningStyles({...learningStyles, verbal: !learningStyles.verbal})}>
                    Verbal (speaking)
                </StyledButton>
                <StyledButton fullWidth value={learningStyles.social} selected={learningStyles.social}  aria-label="Social or interpersonal learning" onClick={() => setLearningStyles({...learningStyles, social: !learningStyles.social})}>
                    Social (group)
                </StyledButton>
                <StyledButton fullWidth value={learningStyles.solitary} selected={learningStyles.solitary}  aria-label="Solitary or intrapersonal learning" onClick={() => setLearningStyles({...learningStyles, solitary: !learningStyles.solitary})}>
                    Independent (solo)
                </StyledButton>
                <StyledButton fullWidth value={learningStyles.other} selected={learningStyles.other}  aria-label="Other" onClick={() => setLearningStyles({...learningStyles, other: !learningStyles.other})}>
                    Other
                </StyledButton>
            </Box>

            <Button variant='contained' color='primary' fullWidth sx={{mt:4}} onClick={() => {props.onContinue(learningStyles)}}>
                Continue
            </Button>
        </Box>
    );
}

export default LearningStyleChooser;


const StyledButton = styled(ToggleButton)(({theme}) => ({
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
    '&.Mui-selected': {
        borderColor: `${theme.palette.primary.main}`,
        // backgroundColor: theme.palette.background.paper,
        // boxShadow: 'none',
    },
    margin: 1
}));
