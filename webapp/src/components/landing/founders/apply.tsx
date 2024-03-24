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
                {t("Vitsi AI: Achieve")}
            </Typography>
            <Typography
                variant='h6'
                fontWeight={'bold'}
            >
                {t("Set The Goals and Fulfill Them")}
            </Typography>
        </TwoSidedLayout>
    )
}

export default Apply;
