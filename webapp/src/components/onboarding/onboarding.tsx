import React, {useState}  from 'react';
import Box from '@mui/material/Unstable_Grid2/Grid2';

import {LearningStyles} from '../../types/onboarding';

import TimeChooser from './time_chooser';
import Graph from './graph';
import Body from './body';
import Stepper from './stepper';
import GoalChooser from './goal_chooser';
import LearningStyleChooser from './learning_style_chooser';

const Onboarding = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [state, setState] = useState({});
    const steps = [{
        component: <GoalChooser onContinue={(goal: string) => {
            setState({...state, goal: goal});
            setActiveStep(activeStep + 1);
        }}/>
    }, {
        component: <LearningStyleChooser onContinue={(styles: LearningStyles)=>{
            setState({...state, learningStyles: styles});
            setActiveStep(activeStep + 1);
        }}/>
    }, {
        image: './images/onboarding/plan.png',
        title: 'We\'ll tailor a personal plan for your learning style',
    }, {
        component: <TimeChooser onContinue={(time: string) => {
            setState({...state, time: time});
            setActiveStep(activeStep + 1);
        }}/>
    }, {
        image: './images/onboarding/success.png',
        title: 'Motivation is your key to success!',
        description: 'You\'re twice as motivated when you see your path and progress clearly.',
    }, {
        component: <Graph/>
    }];
    console.log(state)
    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <Stepper
                progress={activeStep/steps.length * 100}
                onStepBack={() => {
                    if (activeStep > 0) setActiveStep(activeStep - 1);
                }}
                title={'Profile Setup'}
            />
            <Body
                step={steps[activeStep]}
                onContinue={() => {
                    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
                }}
            />
        </Box>
    );
}

export default Onboarding;
