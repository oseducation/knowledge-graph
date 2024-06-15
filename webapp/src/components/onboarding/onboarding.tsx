import React, {useEffect, useState}  from 'react';
import Box from '@mui/material/Unstable_Grid2/Grid2';

import {LearningStyles, OnboardingState} from '../../types/onboarding';
import {Client} from '../../client/client';
import {Graph} from '../../types/graph';
import {filterGraph} from '../../context/graph_provider';
import Registration from '../registration';

import TimeChooser from './time_chooser';
import Stepper from './stepper';
import GoalChooser from './goal_chooser';
import LearningStyleChooser from './learning_style_chooser';
import ProfileSetupQuiz from './profile_setup_quiz';
import GraphProgress from './graph_progress';
import QuizQuestion from './quiz_question';


const Onboarding = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [state, setState] = useState<OnboardingState>({answers: new Map()} as OnboardingState);
    const [graph, setGraph] = useState<Graph | null>(null);
    const [questionFeedback, setQuestionFeedback] = useState({title: 'These are all the topics you should know to ace the GMAT', description: 'You can see how the topics are connected with each other'});
    const [registrationStep, setRegistrationStep] = useState(false);

    useEffect(() => {
        if (!state.courseID) return;
        Client.Onboarding().getQuestions(state.courseID).then((questions) => {
            setState({...state, questions: questions});
        });
        if (graph) return;
        Client.Graph().getStaticGraph().then((data: Graph | null) => {
            if (!data) {
                setGraph(null);
                return;
            }
            setGraph(filterGraph(data));
        });
    }, [state.courseID]);

    const profileSetupSteps = [{
        component: <GoalChooser onContinue={(goal: string) => {
            setState({...state, courseID: goal});
            setActiveStep(activeStep + 1);
        }}/>
    }, {
        component: <LearningStyleChooser onContinue={(styles: LearningStyles)=>{
            setState({...state, learningStyles: styles});
            setActiveStep(activeStep + 1);
        }}/>
    }, {
        image: './images/onboarding/plan.png',
        title: "Thanks! We'll create a learning plan tailored to your preferred learning style.",
    }, {
        component: <TimeChooser onContinue={(time: string) => {
            setState({...state, time: time});
            setActiveStep(activeStep + 1);
        }}/>
    }, {
        image: './images/onboarding/success.png',
        title: 'Motivation is your key to success!',
        description: 'You\'re twice as motivated when you see your path and progress clearly.',
    }];

    let component = <ProfileSetupQuiz
        step={profileSetupSteps[activeStep]}
        onContinue={() => setActiveStep(activeStep + 1)}
    />
    if (activeStep === profileSetupSteps.length) {
        if (registrationStep) {
            component = <Registration onboarding={state}/>
        } else if (questionFeedback.title) {
            component = <GraphProgress
                graph={graph}
                onContinue={() => setQuestionFeedback({title: '', description: ''})}
                title={questionFeedback.title}
                description={questionFeedback.description}
            />
        } else if (activeQuestion >= state.questions.length) {
            component = <GraphProgress
                graph={graph}
                onContinue={() => setRegistrationStep(true)}
                title="Good job! You're all set."
                description="Let's start learning!"
            />
        } else {
            component = <QuizQuestion
                question={state.questions[activeQuestion][0]}
                onRightChoice={() => {
                    setState({...state, answers: new Map(state.answers.set(state.questions[activeQuestion][0].id, true))})
                    setQuestionFeedback({title: 'Correct! We\'ve marked some topics which you most likely know already', description: state.questions[activeQuestion][0].explanation})
                    setActiveQuestion(activeQuestion*2 + 1);
                }}
                onWrongChoice={() => {
                    setState({...state, answers: new Map(state.answers.set(state.questions[activeQuestion][0].id, false))})
                    setQuestionFeedback({title: 'You\'ll have all the chance to learn this', description: state.questions[activeQuestion][0].explanation})
                    setActiveQuestion(activeQuestion*2 + 2);
                }}
            />
        }
    }

    let questionsProgress = 0
    if (activeStep === profileSetupSteps.length) {
        if (state.questions && state.questions.length > 0) {
            questionsProgress = activeQuestion/(Math.log2(state.questions.length)) * 100
        } else {
            questionsProgress = 100
        }
    }

    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <Stepper
                onBoardingProgress={activeStep/(profileSetupSteps.length) * 100}
                questionsProgress={questionsProgress}
                onStepBack={() => {
                    if (activeQuestion > 0) {
                        setActiveQuestion(activeQuestion - 1);
                    } else if (activeStep > 0) setActiveStep(activeStep - 1);
                }}
            />
            {component}
        </Box>
    );
}

export default Onboarding;
