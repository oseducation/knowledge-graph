import React from 'react';
import styled from 'styled-components';

import Sidebar from './sidebar';

const LHSContainer = styled.div`
    width: 240px;

    display: flex;
    flex-direction: column;
`;

const LHSNavigation = () => {
    const it1 = {
        id: 'it1',
        icon: 'it1',
        display_name: 'Karel',
        className: '',
        areaLabel: 'Karel',
        link: '',
        isCollapsed: false,
    }

    const it2 = {
        id: 'it2',
        icon: 'it2',
        display_name: 'Java for',
        className: '',
        areaLabel: 'Java for',
        link: '',
        isCollapsed: false,
    }

    const g1 = {
        id: 'inProgressCategory',
        display_name: 'In Progress',
        collapsed: false,
        items: [it1, it2],
    }

    const g2 = {
        id: 'nextCategory',
        display_name: 'Next',
        collapsed: false,
        items: [it2, it1],
    }
    const groups = [g1, g2];


    return (
        <LHSContainer>
            <Sidebar
                groups={groups}
            />
        </LHSContainer>
    );
};

export default LHSNavigation;
