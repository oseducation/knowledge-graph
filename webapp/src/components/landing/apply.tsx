import React from 'react';
import {Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

import {Graph} from '../../types/graph';

import TwoSidedLayout from './two_sided_layout';

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
                fontSize={30}
                fontWeight={'bold'}
            >
                {t("Vitsi AI: Apply To Jobs")}
            </Typography>
            <Typography
                fontSize={26}
                fontWeight={'bold'}
                ml={10}
            >
                {t("You've Already Learned Topics Needed For A Job? We Will Apply For You")}
            </Typography>
        </TwoSidedLayout>
    )
}

export default Apply;
