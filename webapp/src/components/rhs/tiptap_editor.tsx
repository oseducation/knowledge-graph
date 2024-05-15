import React from 'react';
import {Box} from '@mui/material';
import Highlight from '@tiptap/extension-highlight'
import Typography2 from '@tiptap/extension-typography'
import {
    BubbleMenu,
    EditorContent,
    FloatingMenu,
    useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {Client} from '../../client/client';
import {UserNote} from '../../types/users';
import useAuth from '../../hooks/useAuth';

import './styles.scss'


type NoteEditorRHSProps = {
    note: UserNote;
}

const TipTapEditor = (props: NoteEditorRHSProps) => {
    const {userNotes, setUserNotes} = useAuth();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            Typography2,
        ],
        content: props.note.note,
        onBlur: () => {
            saveNote();
        },
        onUpdate: () => {
            const currentNote = userNotes.find((n) => n.id === props.note.id);
            if (currentNote) {
                setUserNotes([currentNote, ...userNotes.filter((n) => n.id !== currentNote.id)])
            }
        }
    }, [props.note.id]);

    const saveNote = () => {
        if (!editor) {
            return;
        }
        const newText = editor.getHTML();
        if (newText === props.note.note) {
            return;
        }
        const newNote = {...props.note, note: newText};
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

    return (
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
    )
}

export default TipTapEditor;
