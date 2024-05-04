import React, {useEffect, useState} from 'react';

import {Client} from '../../client/client';
import {UserNote} from '../../types/users';
import useAuth from '../../hooks/useAuth';

import './styles.scss'
import TipTapEditor from './tiptap_editor';


type NoteEditorRHSProps = {
    noteID: string;
}

const NoteEditorRHS = (props: NoteEditorRHSProps) => {
    const [note, setNote] = useState<UserNote | null>(null);
    const {user, userNotes} = useAuth();

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
        } else  {
            Client.User().getNote(props.noteID).then((data) => {
                setNote(data);
            });
        }
    }, [props.noteID]);

    if (!note) {
        return null;
    }

    return (
        <TipTapEditor note={note}/>
    )
}

export default NoteEditorRHS;
