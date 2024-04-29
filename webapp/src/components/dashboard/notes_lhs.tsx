import React, {useState} from 'react';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router-dom';
import NotesIcon from '@mui/icons-material/Notes';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import {IconButton, useTheme} from '@mui/material';


// import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
// import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';

import {GroupItem} from '../../types/sidebar';
import useAuth from '../../hooks/useAuth';
import Item from '../lhs/item';

import DashboardLHSGroup from './dashboard_lhs_group';


const LHSNotes = () =>{
    const navigate = useNavigate();
    const {userNotes} = useAuth();
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    return (
        <Box>
            <DashboardLHSGroup
                id={'notes'}
                display_name={'Notes'}
                icon={<NotesIcon fontSize='large'/>}
                onClick={() => {setOpen(!open)}}
                areaLabel={'notes'}
                onHoverIcon = {open? <KeyboardArrowDownIcon fontSize='large'/> : <KeyboardArrowRightIcon fontSize='large'/>}
                secondaryOnHover = {
                    <IconButton sx={{
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.primary.main
                    }}>
                        <AddIcon fontSize='small' onClick={() => navigate('/dashboard/notes/new')}/>
                    </IconButton>
                }
            />
            {open &&
                <Box>
                    {userNotes.map((note) => {
                        return (
                            <Item key={note.id} item = {
                                {
                                    id: note.id,
                                    display_name : note.note_name,
                                    onClick: () => navigate(`/dashboard/notes/${note.id}`),
                                    areaLabel: note.note_name,
                                } as GroupItem
                            }/>
                        );
                    })}
                </Box>
            }
        </Box>
    );
}

export default LHSNotes;
