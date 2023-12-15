import * as React from 'react';

import {DrawerProvider} from './context/drawer_provider';
import GuestLayout from './GuestLayout';

export default function UserLayout() {
    return (
        <DrawerProvider>
            <GuestLayout/>
        </DrawerProvider>
    );
}
