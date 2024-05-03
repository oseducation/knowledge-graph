import React, {useEffect, useState} from 'react';
import {
    Box,
    IconButton,
    Typography,
    useTheme
} from '@mui/material';
import Highlight from '@tiptap/extension-highlight'
import Typography2 from '@tiptap/extension-typography'
import {
    BubbleMenu,
    EditorContent,
    FloatingMenu,
    useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CloseIcon from '@mui/icons-material/Close';

import {Client} from '../../client/client';
import {UserNote} from '../../types/users';
import useLayout from '../../hooks/useLayout';

import './styles.scss'


type NoteEditorRHSProps = {
    noteID: string;
}

const NoteEditorRHS = (props: NoteEditorRHSProps) => {
    const theme = useTheme();
    const [note, setNote] = useState<UserNote | null>(null);
    const {setRHSNoteID} = useLayout()


    useEffect(() => {
        if (props.noteID) {
            Client.User().getNote(props.noteID).then((data) => {
                setNote(data);
            });
        }
    }, [props.noteID]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            Typography2,
        ],
        content: note?.note,
    });
    const staticHeight = `calc(100vh - (64px))`
    return (
        <Box
            height={staticHeight}
            bgcolor={theme.palette.background.paper}
        >
            <Box bgcolor={theme.palette.grey[300]} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                <Typography variant={'h4'}>Title bla</Typography>
                <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => {
                        setRHSNoteID(null);
                        if (!note || !editor) {
                            return;
                        }
                        const newNote = {...note, note: editor.getText()}
                        if (note?.id) {
                            Client.User().UpdateNote(newNote);
                        } else {
                            Client.User().CreateNote(newNote);
                        }
                    }}
                >
                    <CloseIcon fontSize="inherit"/>
                </IconButton>
            </Box>
            <Box p={'2px'}>
                {editor && <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'is-active' : ''}
                    >
                        Bold
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'is-active' : ''}
                    >
                        Italic
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'is-active' : ''}
                    >
                        Strike
                    </button>
                </BubbleMenu>}

                {editor && <FloatingMenu className="floating-menu" tippyOptions={{ duration: 100 }} editor={editor}>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                    >
                        H1
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                    >
                        H2
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'is-active' : ''}
                    >
                        Bullet List
                    </button>
                </FloatingMenu>}
                <EditorContent editor={editor}/>
            </Box>
        </Box>
    )
}

export default NoteEditorRHS;
