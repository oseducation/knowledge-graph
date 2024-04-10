import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    // FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    // Switch
} from '@mui/material';
import {useTranslation} from "react-i18next";
import {Controller, useForm} from 'react-hook-form';

import {Client} from '../client/client';
import {ClientError} from "../client/rest";
import useAuth from '../hooks/useAuth';
import {Preference, TutorPersonality, UserPreferences, UserPreferencesDefaultValues} from '../types/users';

interface Props {
    onClose: () => void;
}

const Preferences = (props: Props) => {
    const {user, preferences, setPreferences} = useAuth();
    const {t} = useTranslation();

    const {control, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<UserPreferences>();
    const [personalities, setPersonalities] = useState<TutorPersonality[]>([]);

    useEffect(() => {
        Client.User().getTutorPersonalities().then((data) => {
            setPersonalities(data);
        })
    }, []);

    const onSubmit = (data: UserPreferences) => {
        if (!user) {
            props.onClose();
            return;
        }
        const prefs: Preference[] = [
            {
                key: 'graph_direction',
                user_id: user.id,
                value: data.graph_direction || UserPreferencesDefaultValues['graph_direction']
            },
            // {
            //     key: 'is_video_looped',
            //     user_id: user.id,
            //     value: "" + (data.is_video_looped || UserPreferencesDefaultValues['is_video_looped'])
            // },
            // {
            //     key: 'language',
            //     user_id: user.id,
            //     value: data.language || UserPreferencesDefaultValues['language']
            // },
            {
                key: 'tutor_personality',
                user_id: user.id,
                value: data.tutor_personality || UserPreferencesDefaultValues['tutor_personality']
            }
        ]

        // if (i18n.language !== data.language) {
        //     i18n.changeLanguage(data.language);
        // }

        Client.User().saveMyPreferences(prefs)
            .then(() => {
                setPreferences?.(data);
                props.onClose();
            })
            .catch((err: ClientError) => {
                setError('root', {type: 'server', message: err.message});
            })
    }

    return (
        <>
            <DialogTitle>
                {`${user?.username}'s ${t("preferences")}`}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent style={{display: 'flex', alignItems: 'stretch', flexDirection: 'column'}}>
                    {errors.root &&
                        <Alert severity='error' onClose={() => {
                            clearErrors()
                        }}>
                            {errors.root.message}
                        </Alert>
                    }
                    {/* <FormControl style={{margin: '16px'}}>
                        <InputLabel id="language-label">{t("Language")}</InputLabel>
                        <Controller
                            name='language'
                            control={control}
                            defaultValue={preferences?.language || "en"}
                            render={({field}) => (
                                <Select labelId='language-label' id='language' {...field}>
                                    <MenuItem value='en'>{t("English")}</MenuItem>
                                    <MenuItem value='ge'>{t("Georgian")}</MenuItem>
                                </Select>
                            )}
                        />
                    </FormControl> */}

                    <FormControl style={{margin: '16px'}}>
                        <InputLabel id='graphDirection-label'>{t("Graph Direction")}</InputLabel>
                        <Controller
                            name='graph_direction'
                            control={control}
                            defaultValue={preferences?.graph_direction || 'lr'}
                            render={({field}) => (
                                <Select labelId='graphDirection-label' id='graphDirection' {...field}>
                                    <MenuItem value='td'>{t("Top down")}</MenuItem>
                                    <MenuItem value='bu'>{t("Bottom up")}</MenuItem>
                                    <MenuItem value='lr'>{t("Left to Right")}</MenuItem>
                                    <MenuItem value='rl'>{t("Right to Left")}</MenuItem>
                                </Select>
                            )}
                        />
                    </FormControl>

                    {/* <FormControl style={{margin: '16px'}}>
                        <Controller
                            name='is_video_looped'
                            control={control}
                            defaultValue={preferences?.is_video_looped || false}
                            render={({field}) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value}/>}
                                    label={field.value ? t('Should videos loop in carousel mode: Yes') : t('Should videos loop in carousel mode: No')}
                                />
                            )}
                        />
                    </FormControl> */}
                    <FormControl style={{margin: '16px'}}>
                        <InputLabel id='tutor-personality-label'>{t("Tutor Personality")}</InputLabel>
                        <Controller
                            name='tutor_personality'
                            control={control}
                            defaultValue={preferences?.tutor_personality || 'standard-tutor-personality'}
                            render={({field}) => (
                                <Select labelId='tutor-personality-label' id='tutor-personality' {...field}>
                                    {personalities.map((personality) => (
                                        <MenuItem key={personality.id} value={personality.id}>{personality.name}</MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button type={'submit'}>{t("Save")}</Button>
                    <Button id="cancel" onClick={props.onClose}>{t("Cancel")}</Button>
                </DialogActions>
            </form>
        </>
    )
}

export default Preferences;
