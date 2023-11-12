import * as React from 'react';

import {DrawerProvider} from './context/drawer_provider';
import {GraphProvider} from './context/graph_provider';
import GuestLayout from './GuestLayout';

export default function UserLayout() {
    return (
        <DrawerProvider>
            <GraphProvider>
                <GuestLayout/>
            </GraphProvider>
        </DrawerProvider>
    );
}
