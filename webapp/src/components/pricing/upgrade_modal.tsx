import React, {useState} from "react";
import {Box, Button, Modal, Theme, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import {offersPremium} from "./pricing_table";

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
}

const UpgradeModal = (props: UpgradeModalProps) => {
    const [pricing, setPricing] = useState('annual');
    const theme = useTheme();

    const handleChange = (event: React.MouseEvent<HTMLElement>, price: string) => {
        setPricing(price);
    };

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
        >
            <Box sx={style} display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <Box>
                    <img src="/images/joy.webp" alt="logo" width={'300px'} height={'100%'}/>
                </Box>
                <Box display={'flex'} flexDirection={'column'}>
                    <Typography variant="h3" color={'primary'} fontWeight={'600'} m={2}>
                        Upgrade to Premium
                    </Typography>
                    <Box m={2}>
                        {offersPremium.map((learning, index) => (
                            <Box key={index} display={'flex'} flexDirection={'row'} alignItems={'flex-end'} justifyContent={'flex start'}>
                                <CheckCircleOutlineIcon sx={{mr:1}} color="primary"/>
                                <Typography variant="body2" color="text.primary">
                                    {learning}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    <ToggleButtonGroup
                        orientation="vertical"
                        value={pricing}
                        exclusive
                        onChange={handleChange}
                    >
                        <ToggleButton
                            value="annual"
                            fullWidth
                            sx={toggleButtonStyle(theme)}>
                            <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                                <Typography variant="h5" color="text.primary" mr={1}>
                                    Annual
                                </Typography>
                                <Typography variant="subtitle1" color={theme.palette.success.dark} sx={{bgcolor:theme.palette.success.light}}>
                                    {'Save 40%'}
                                </Typography>
                                <Typography variant="h5" color="text.primary" sx={{position: 'absolute', right:0, m: 1}}>
                                    {'$12/mo'}
                                </Typography>
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="monthly" fullWidth sx={toggleButtonStyle(theme)}>
                            <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                                <Typography variant="h5" color="text.primary" mr={1}>
                                    Monthly
                                </Typography>
                                <Typography variant="h5" color="text.primary" sx={{position: 'absolute', right:0, m: 1}}>
                                    {'$20/mo'}
                                </Typography>
                            </Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                        fullWidth
                        sx={{mt:2}}
                        variant={'contained'}
                        onClick={() => {console.log(pricing)}}
                    >
                        Upgrade Now
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    p: 4,
    borderRadius: '10px',
};

const toggleButtonStyle = (theme: Theme) => {
    return {
        justifyContent: 'flex-start',
        textTransform: 'none',
        m: 1,
        '&.MuiToggleButtonGroup-grouped:not(:first-of-type)' : {
            borderTopRightRadius: '10px',
            borderTopLeftRadius: '10px',
            borderTop: '0.625px solid rgba(0, 0, 0, 0.12)',
            marginTop: 0,
        },
        '&.MuiToggleButtonGroup-grouped:not(:first-of-type):hover' : {
            borderTop: '1px solid #6b57ea',
        },
        '&.MuiToggleButtonGroup-grouped:not(:first-of-type).Mui-selected' : {
            borderTop: '2px solid #6b57ea',
        },
        '&.MuiToggleButtonGroup-grouped:not(:first-of-type).Mui-selected:hover' : {
            borderTop: '2px solid #6b57ea',
        },
        '&:hover': {
            border: '1px solid #6b57ea',
        },
        '&.Mui-selected': {
            border: '2px solid #6b57ea',
            bgcolor: theme.palette.background.paper,
        },
        '&.Mui-selected:hover': {
            border: '2px solid ' + theme.palette.primary.dark,
        },
        '&.MuiToggleButtonGroup-grouped' : {
            borderRadius: '10px',
        },
        '&.MuiToggleButtonGroup-grouped:not(:last-of-type)' : {
            borderBottomRightRadius: '10px',
            borderBottomLeftRadius: '10px',
        },
    }
};

export default UpgradeModal;
