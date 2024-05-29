import React, {useCallback, useState, ChangeEvent, AnimationEvent} from 'react';
import {TextField, TextFieldProps} from '@mui/material';

interface AutoFillAwareTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const AutoFillAwareTextField: React.FC<AutoFillAwareTextFieldProps> = ({
    onChange,
    inputProps,
    InputLabelProps,
    ...rest
}) => {
    const [fieldHasValue, setFieldHasValue] = useState(false);

    const makeAnimationStartHandler = (stateSetter: React.Dispatch<React.SetStateAction<boolean>>) => (e: AnimationEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const autofilled = !!target.matches('*:-webkit-autofill');
        if (e.animationName === 'mui-auto-fill' || e.animationName === 'mui-auto-fill-cancel') {
            stateSetter(autofilled);
        }
    };

    const onChangeCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        setFieldHasValue(e.target.value !== '');
    }, [onChange]);

    return (
        <TextField
            inputProps={{
                onAnimationStart: makeAnimationStartHandler(setFieldHasValue),
                ...inputProps,
            }}
            InputLabelProps={{
                shrink: fieldHasValue,
                ...InputLabelProps,
            }}
            onChange={onChangeCallback}
            {...rest}
        />
    );
};

export default AutoFillAwareTextField;
