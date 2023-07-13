import {useContext} from 'react';

import DrawerContext from '../context/drawer_provider';

const useDrawer = () => {
    return useContext(DrawerContext);
}

export default useDrawer;
