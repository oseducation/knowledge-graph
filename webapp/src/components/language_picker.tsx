import React, {useState} from 'react';
import {Select, MenuItem, FormControl, SelectChangeEvent} from '@mui/material';
import {useTranslation} from 'react-i18next';

const LanguagePicker = () => {
    const {i18n} = useTranslation();
    const [language, setLanguage] = useState<string>(i18n.language || 'en');

    const handleChange = (event: SelectChangeEvent<string>) => {
        const lang = event.target.value as string
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    return (
        <FormControl variant="outlined" sx={{m: 1, minWidth: 80, border: 'none'}}>
            <Select
                labelId="language-picker-label"
                id="language-picker"
                value={language}
                onChange={handleChange}
                sx={{
                    color:'white',
                    fontSize: '1.5rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                    }
                }}
            >
                <MenuItem sx={{ fontSize: '1.5rem' }} value={'en'}>
                    🇬🇧
                </MenuItem>
                <MenuItem sx={{ fontSize: '1.5rem' }} value={'ge'}>
                    🇬🇪
                </MenuItem>
            </Select>
        </FormControl>
    );
};

export default LanguagePicker;
