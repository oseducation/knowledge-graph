
import React, {useEffect, useState} from 'react';
import {Box, Typography, Card} from '@mui/material';
import Calendar from 'react-github-contribution-calendar';

import {Client} from '../../client/client';
import {Progress} from '../../types/dashboard';

const ProgressComp = () => {
    const [progress, setProgress] = useState<Progress>({});

    useEffect(() => {
        Client.Dashboard().getProgress().then((res) => {
            if (res) {
                setProgress(res);
            }
        });
    }, []);

    const panelColors = [
        '#EEEEEE',
        '#F78A23',
        '#F87D09',
        '#AC5808',
        '#7B3F06'
    ];

    return (
        <Card sx={{
            m: 1,
            mt: 2,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        }}>

            <Typography variant="h5" sx={{fontWeight: 'bold', m:2}}>
                Topics finished in the last year
            </Typography>
            <Box sx={{p:3, pt:0}}>
                <Calendar values={progress} until={getCurrentDateFormatted()} weekLabelAttributes={undefined} monthLabelAttributes={undefined} panelAttributes={undefined} panelColors={panelColors}/>
            </Box>
        </Card>
    );
};

const getCurrentDateFormatted = (): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default ProgressComp;


