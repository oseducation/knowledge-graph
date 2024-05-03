import * as React from 'react';

import {LayoutProvider} from './context/layout_provider';
import GuestLayout from './GuestLayout';

export default function UserLayout() {
    return (
        <LayoutProvider>
            <GuestLayout/>
        </LayoutProvider>
    );
}
