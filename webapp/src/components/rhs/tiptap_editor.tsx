import React from 'react';
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
import useAuth from '../../hooks/useAuth';


type NoteEditorRHSProps = {
    note: UserNote;
}

const TipTapEditor = (props: NoteEditorRHSProps) => {
    const theme = useTheme();
    const {setRHSNoteID} = useLayout()
    const {userNotes, setUserNotes} = useAuth();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            Typography2,
        ],
        content: props.note.note,
        onDestroy: () => saveNote(),
        onBlur: () => saveNote(),
    }, [props.note.id]);

    const saveNote = () => {
        if (!props.note || !editor) {
            return;
        }
        const newText = editor.getHTML();
        if (newText === props.note.note) {
            return;
        }
        const newNote = {...props.note, note: newText}
        if (props.note.id) {
            Client.User().UpdateNote(newNote).then(() => {
                setUserNotes([newNote, ...userNotes.filter((n) => n.id !== newNote.id)])
            });
        } else {
            Client.User().CreateNote(newNote).then(note => {
                setUserNotes([note, ...userNotes]);
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
                <Typography variant={'h4'}>{props.note.note_name}</Typography>
                <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => {
                        setRHSNoteID(null);
                        saveNote();
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

export default TipTapEditor;
