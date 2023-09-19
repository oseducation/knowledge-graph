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

const Learn = (props: Props) => {
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
                {t("Vitsi AI: Learn")}
            </Typography>
            <Typography
                fontSize={26}
                fontWeight={'bold'}
                ml={10}
            >
                {t("Know the prerequisites? Learn new topics!")}
            </Typography>
            <Typography
                fontSize={26}
                fontWeight={'bold'}
                ml={10}
            >
                {t("Like Playing A Game")}
            </Typography>
        </TwoSidedLayout>
    )
}

export default Learn;
