import React, {useState} from 'react';
import Box from '@mui/material/Box';
import NotesIcon from '@mui/icons-material/Notes';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import {IconButton, useTheme} from '@mui/material';

// import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
// import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';

import useAuth from '../../hooks/useAuth';

import DashboardLHSGroup from './dashboard_lhs_group';
import DashboardLHSItem from './dashboard_lhs_item';



const LHSNotes = () =>{
    const {userNotes} = useAuth();
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    return (
        <Box>
            <DashboardLHSGroup
                id={'notes'}
                display_name={'Notes'}
                icon={<NotesIcon fontSize='large'/>}
                onClick={() => setOpen(!open)}
                areaLabel={'notes'}
                onHoverIcon = {open? <KeyboardArrowDownIcon fontSize='large'/> : <KeyboardArrowRightIcon fontSize='large'/>}
                secondaryOnHover = {
                    <IconButton
                        sx={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.primary.main
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            // navigate('/dashboard/notes/new')
                        }}
                    >
                        <AddIcon fontSize='small'/>
                    </IconButton>
                }
            />
            {open &&
                <Box>
                    {userNotes.map((note) => {
                        return (
                            <DashboardLHSItem
                                key={note.id}
                                display_name= {note.note_name}
                                onClick = {() => {
                                    // navigate(`/dashboard/notes/${note.id}`)
                                }}
                                areaLabel= {note.note_name}
                            />
                        );
                    })}
                </Box>
            }
        </Box>
    );
}

export default LHSNotes;
