import React from "react";
import {Box, Typography, Card, CardActionArea, Button, CardContent, CardActions} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface Props {
    name: string;
    price: number;
    offers: string[];
    onAction?: () => void;
    actionName?: string;
    raised: boolean;
    width: string;
    height: string;
}

const PricingCard = (props: Props) => {
    return (
        <Card
            sx={{
                m: 2,
                display: 'flex',
                flexDirection: 'column',
                bgcolor:'#f6f4ff',
                width: props.width,
                height: props.height,
                justifyContent: 'space-between'
            }}
            raised={props.raised}
            onClick={() => {
                if (props.onAction) {
                    props.onAction();
                }
            }}
        >
            <CardActionArea>
                <CardContent>
                    <Typography gutterBottom variant="h4" component="div">
                        {props.name}
                    </Typography>
                    <Box display={'flex'} flexDirection={'row'} alignItems={'baseline'}>
                        <Typography variant="h1" color="text.secondary">
                            {'$' + props.price}
                        </Typography>
                        <Typography variant="h5" color="text.secondary">
                            {'/month'}
                        </Typography>
                    </Box>
                    {props.offers.map((learning, index) => (
                        <Box key={index} display={'flex'} flexDirection={'row'} alignItems={'flex-end'} justifyContent={'flex start'}>
                            <CheckCircleOutlineIcon sx={{mr:1}} color="primary"/>
                            <Typography variant="body2" color="text.primary">
                                {learning}
                            </Typography>
                        </Box>
                    ))}
                </CardContent>
            </CardActionArea>

            {props.actionName &&
                <CardActions sx={{bottom:0, position:'relative'}}>
                    <Button
                        fullWidth
                        onClick={() => {
                            if (props.onAction) {
                                props.onAction();
                            }
                        }}
                        variant={props.raised ? 'contained' : 'outlined'}
                    >
                        {props.actionName}
                    </Button>
                </CardActions>
            }

        </Card>
    );
}
export default PricingCard;
