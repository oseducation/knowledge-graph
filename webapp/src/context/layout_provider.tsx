import React, {createContext, useState} from 'react';

interface LayoutContextState {
    drawerOpen: boolean;
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
    rhsNoteID: string | null;
    setRHSNoteID: React.Dispatch<React.SetStateAction<string | null>>;
}

const LayoutContext = createContext<LayoutContextState>({
    drawerOpen: false,
    setDrawerOpen: null,
    rhsNoteID: null,
    setRHSNoteID: () => {}
});

interface Props {
    children: React.ReactNode
}

export const LayoutProvider = (props: Props) => {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [rhsNoteID, setRHSNoteID] = useState<string | null>(null);

    return (
        <LayoutContext.Provider value={{drawerOpen, setDrawerOpen, rhsNoteID, setRHSNoteID}}>
            {props.children}
        </LayoutContext.Provider>
    );
}

export default LayoutContext;


