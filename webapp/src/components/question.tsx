import React, {useState} from 'react';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import {useTranslation} from 'react-i18next';

import {Question} from '../types/graph';

import Markdown from './markdown';


interface Props {
    question: Question;
}

const QuestionComponent = (props: Props) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);
    const {t} = useTranslation();
    const [helperText, setHelperText] = useState(t("Choose wisely"));

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        for (let i=0; i<props.question.choices.length; i++) {
            const choice = props.question.choices[i];
            if (choice.choice === value) {
                if (choice.is_right_choice) {
                    setHelperText(t("You got it!"));
                    setError(false);
                } else {
                    setHelperText(t("Sorry, wrong answer!"));
                    setError(true);
                }
                break
            }
        }
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
        setHelperText('');
        setError(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormControl sx={{m: 3}} error={error} variant="standard">
                <FormLabel id="question-text">
                    <Markdown text={props.question.question}/>
                </FormLabel>
                <RadioGroup
                    aria-labelledby="question-radios"
                    name="question"
                    value={value}
                    onChange={handleRadioChange}
                >
                    {props.question.choices.map(value => ({value, sort: Math.random()}))
                        .sort((a, b) => a.sort - b.sort)
                        .map(({value}) =>
                            <FormControlLabel
                                key={value.id}
                                value={value.choice}
                                control={<Radio/>}
                                label={<Markdown text={value.choice}/>}
                            />
                        )
                    }
                </RadioGroup>
                <FormHelperText>{helperText}</FormHelperText>
                <Button sx={{mt: 1, mr: 1}} type="submit" variant="outlined">
                    {t('Check Answer')}
                </Button>
            </FormControl>
        </form>
    )

}

export default QuestionComponent;
