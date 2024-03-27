import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {IconButton, useTheme} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LegendToggleIcon from '@mui/icons-material/LegendToggle';

interface LegendItemProps {
    color: string;
    label: string;
}

interface GraphLegendProps {
    items?: LegendItemProps[];
    userPreference: boolean;
    updateUserPreference: (value: boolean) => void;
}


const LegendItem = (props: LegendItemProps) => {
    const theme = useTheme();

    return (
        <Box display="flex" alignItems="center" mb={1}>
            <Box width={20} height={20} bgcolor={props.color} mr={1} sx={{ border: 1, borderColor: theme.palette.grey[500], borderRadius: '3px' }}/>
            <Typography variant="body2">{props.label}</Typography>
        </Box>
    );
}

const Legend = (props: GraphLegendProps) => {
    const theme = useTheme();
    const [open, setOpen] = useState(props.userPreference);


    const defaultLegendItems: LegendItemProps[] = [
        {color: theme.palette.info.main, label: 'Goal'},
        {color: theme.palette.warning.light, label: 'In Progress'},
        {color: theme.palette.primary.main, label: 'Next'},
        {color: theme.palette.success.main, label: 'Finished'},
        {color: theme.palette.grey[500], label: 'Other Topics'},
    ];
    const items = props.items || defaultLegendItems;

    if (open) {
        return (
            <Box
                border={1}
                borderColor={theme.palette.grey[300]}
                borderRadius={2}
                p={2}
                display="inline-block"
                onClick={() => {
                    setOpen(false);
                    props.updateUserPreference(false);
                }}
            >
                <IconButton
                    onClick={() => {
                        setOpen(false);
                        props.updateUserPreference(false);
                    }}
                    size="small"
                    sx={{position: 'absolute', top: 0, right: 0}}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
                {items.map((item, index) => (
                    <LegendItem key={index} color={item.color} label={item.label}/>
                ))}
            </Box>
        )
    }

    return (
        <IconButton
            size="small"
            onClick={() => {
                setOpen(true);
                props.updateUserPreference(true);
            }}
        >
            <LegendToggleIcon fontSize="small" />
        </IconButton>
    )
}




export default Legend;

