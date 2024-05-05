import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    IconButton,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import {Client} from '../../client/client';
import {UserNote} from '../../types/users';
import useAuth from '../../hooks/useAuth';
import useLayout from '../../hooks/useLayout';

import TipTapEditor from './tiptap_editor';


type NoteEditorRHSProps = {
    noteID: string;
}

const NoteEditorRHS = (props: NoteEditorRHSProps) => {
    const [note, setNote] = useState<UserNote | null>(null);
    const {user, userNotes, setUserNotes} = useAuth();
    const theme = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const {setRHSNoteID} = useLayout();

    useEffect(() => {
        let name = '';
        for (let i=0; i<1000; i++) {
            name = "Untitled" + ((i>0) ? ("-" + i.toString()) : '');
            if (!userNotes.find((n) => n.note_name === name)) {
                break;
            }
        }
        if (props.noteID === 'new') {
            setNote({
                id: '',
                note: '',
                note_name: name,
                user_id: user?.id || '',
            });
            setTitle(name);
            setIsEditing(true);
        } else  {
            Client.User().getNote(props.noteID).then((data) => {
                setNote(data);
                setTitle(data.note_name);
            });
        }
    }, [props.noteID]);

    if (!note) {
        return null;
    }

    const saveTitle = () => {
        if (title === note.note_name) {
            return;
        }
        const newNote = {...note, note_name: title};
        if (note.id) {
            Client.User().UpdateNote(newNote).then(() => {
                setUserNotes([newNote, ...userNotes.filter((n) => n.id !== newNote.id)])
            });
        } else {
            Client.User().CreateNote(newNote).then(note => {
                setUserNotes([note, ...userNotes]);
                setRHSNoteID(note.id);
            });
        }
    }

    const staticHeight = `calc(100vh - (64px))`
    return (
        <Box
            height={staticHeight}
            bgcolor={theme.palette.background.paper}
        >
            <Box bgcolor={theme.palette.grey[300]} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                {isEditing?
                    <Box
                        height={'32px'}
                        display={'flex'}
                        alignItems={'center'}
                    >
                        <TextField
                            id="outlined-basic"
                            variant="standard"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setTitle(event.target.value);
                            }}
                            autoFocus
                            value={title}
                            sx={{pl:'4px'}}
                        />
                        <Button
                            variant="contained"
                            onClick={() => {
                                setIsEditing(false);
                                saveTitle();
                            }}
                            sx={{p: 0, m: 0}}
                        >
                            {"Save"}
                        </Button>
                    </Box>
                    :
                    <Typography
                        variant={'h4'}
                        onClick={() => {setIsEditing(true)}}
                        sx={{pl:'4px'}}
                    >
                        {title}
                    </Typography>
                }
                <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => {
                        setRHSNoteID(null);
                    }}
                >
                    <CloseIcon fontSize="inherit"/>
                </IconButton>
            </Box>
            <TipTapEditor note={note}/>
        </Box>
    )
}

export default NoteEditorRHS;
