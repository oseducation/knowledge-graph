import React, {useState} from 'react';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import {useTranslation} from 'react-i18next';

import  {QuestionChoice} from '../../types/graph';
import Markdown from '../markdown';
import {DashboardColors}  from '../../ThemeOptions';


interface Props {
    choices: QuestionChoice[];
    onRightChoice: (answer: string) => void;
    onWrongChoice: (answer: string) => void;
    isLast: boolean;
}

const QuestionChoices = (props: Props) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);
    const {t} = useTranslation();
    const [helperText, setHelperText] = useState(t("Choose wisely"));

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        for (let i=0; i<props.choices.length; i++) {
            const choice = props.choices[i];
            if (choice.choice === value) {
                if (choice.is_right_choice) {
                    setHelperText(t("You got it!"));
                    setError(false);
                    props.onRightChoice(value);
                } else {
                    setHelperText(t("Sorry, wrong answer!"));
                    setError(true);
                    props.onWrongChoice(value)
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
                <RadioGroup
                    aria-labelledby="question-radios"
                    name="question"
                    value={value}
                    onChange={handleRadioChange}
                >
                    {props.choices.map(value => ({value, sort: hashCode(value.choice)}))
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
                {props.isLast &&
                    <>
                        <FormHelperText>{helperText}</FormHelperText>
                        <Button
                            sx={{
                                mt: 1,
                                mr: 1,
                                color: DashboardColors.background,
                                bgcolor: DashboardColors.primary,
                                '&:hover': {
                                    bgcolor: DashboardColors.primary,
                                }
                            }}
                            type="submit"
                            variant="contained">
                            {t('Check Answer')}
                        </Button>
                    </>
                }
            </FormControl>
        </form>
    )
}

const hashCode = (str: string) => {
    let hash = 0,
        i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


export default QuestionChoices;
