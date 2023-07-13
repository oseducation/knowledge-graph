import React, {createContext, useState} from 'react';

interface DrawerContextState {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
}

const DrawerContext = createContext<DrawerContextState>({
    open: false,
    setOpen: null
});

interface Props {
    children: React.ReactNode
}

export const DrawerProvider = (props: Props) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <DrawerContext.Provider value={{open, setOpen}}>
            {props.children}
        </DrawerContext.Provider>
    );
}

export default DrawerContext;


