import React from 'react';
import {Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

import {Graph} from '../../types/graph';

import TwoSidedLayout from './two_sided_layout';

interface Props {
    graph: Graph;
    height: string;
    color: string
}

const DropOut = (props: Props) => {
    const {t} = useTranslation();

    return (
        <TwoSidedLayout
            graph={props.graph}
            color={props.color}
            height={props.height}
            graphTextColor='white'
        >
            <Typography
                variant='h4'
                fontWeight={'bold'}
                color={'white'}
            >
                {t("Problems With Online Courses:")}
            </Typography>
            <Typography
                variant='h6'
                fontWeight={'bold'}
                color={'white'}
            >
                {t("90% Of Learners Drop Out!")}
            </Typography>
        </TwoSidedLayout>
    )
}

export default DropOut;
