import React, {useState} from "react";
import { Box, Switch, Typography, useTheme, Button} from "@mui/material";
import {useNavigate} from "react-router-dom";

import {Analytics} from "../../analytics";

import PricingCard from "./pricing_card";

const PricingTable = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [checked, setChecked] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    const offersFree = ['10 AI prompts daily', 'GPT 3.5', 'Access to Free Topics']
    const offersPremium = ['Unlimited AI prompts', 'GPT 4.0', 'Access to Premium Topics', 'Priority support', 'Access to latest features']

    return (
        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
            <Typography variant={'h1'} color={'primary'}>Simple and transparent pricing</Typography>
            <Typography variant={'subtitle1'} color={theme.palette.grey[700]}>No credit card required, cancel anytime</Typography>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} m={4}>
                <Typography variant={'h5'} color={checked ? theme.palette.grey[700] : 'primary' } fontWeight={'600'}>Monthly</Typography>
                <Switch checked={checked} onChange={handleChange} sx={{m:1}}/>
                <Typography variant={'h5'} color={checked ? 'primary' : theme.palette.grey[700]} fontWeight={'600'}>Yearly</Typography>
                <Typography variant={'h6'} color={theme.palette.success.dark} sx={{bgcolor: theme.palette.success.light, m:1}}>Save 40%</Typography>
            </Box>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} m={4}>
                <PricingCard
                    name={'Free'}
                    price={0}
                    offers={offersFree}
                    raised={false}
                    width={'300px'}
                    height={'400px'}
                    onAction={() => {
                        Analytics.signUpStarted('pricing_free')
                        navigate('/register')
                    }}
                    actionName={'Start For Free'}
                />
                <PricingCard
                    name={'Premium'}
                    price={checked? 12: 20}
                    offers={offersPremium}
                    raised={true}
                    width={'300px'}
                    height={'400px'}
                    onAction={() => {
                        if (checked) {
                            Analytics.signUpStarted('pricing_premium_yearly')
                        } else {
                            Analytics.signUpStarted('pricing_premium_monthly')
                        }
                        navigate('/register')
                    }}
                    actionName={'Start For Free'}
                />
            </Box>
            <Typography variant={'h2'} color={theme.palette.grey[900]}>Try VitsiAI for free today</Typography>
            <Typography variant={'subtitle1'} color={theme.palette.grey[700]}>Learning should be fun and engaging!</Typography>
            <Button
                variant={'contained'}
                onClick={() => {
                    Analytics.signUpStarted('pricing_start_learning')
                    navigate('/register')
                }}
                sx={{m:2}}
            >
                Start Learning
            </Button>
        </Box>
    )
};


export default PricingTable;
