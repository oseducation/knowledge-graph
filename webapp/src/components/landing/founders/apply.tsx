import React from 'react';
import {Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

import {Graph} from '../../../types/graph';

import TwoSidedLayout from '../two_sided_layout';

interface Props {
    graph: Graph;
    height: string;
    color: string;
}

const Apply = (props: Props) => {
    const {t} = useTranslation();

    return (
        <TwoSidedLayout
            graph={props.graph}
            color={props.color}
            height={props.height}
            graphTextColor='black'
        >
            <Typography
                variant='h4'
                fontWeight={'bold'}
            >
                {t("Vitsi AI: Apply Acquired Knowledge to Your Startup")}
            </Typography>
            <Typography
                variant='h6'
                fontWeight={'bold'}
            >
                {t("Come up with the startup idea, Build your team, Build an MVP, Launch, Create a company, Fundraise, Grow")}
            </Typography>
        </TwoSidedLayout>
    )
}

export default Apply;
