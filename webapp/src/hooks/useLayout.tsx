import {useContext} from 'react';

import LayoutContext from '../context/layout_provider';

const useLayout = () => {
    return useContext(LayoutContext);
}

export default useLayout;
