import React, {useEffect, useRef, useState} from 'react';
import {useTheme} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import AceEditor from "react-ace";
import "ace-builds";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-javascript";

import {CanvasModel, World, createWorld, loadImages, setImages, setKarelDimensions} from './types';
import {draw} from './canvas_renderer';
import {Engine, compile, executeStep} from './engine';
import IDEActions from './ide_actions';


const HEART_BEAT = 1000;

interface Props {
    nodeName: string;
}

const IDE = (props: Props) => {
    const {
        mixins: {toolbar},
    } = useTheme();
    const [code, setCode] = useState<string | null>(null);
    const [world, setWorld] = useState<World | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvas, setCanvas] = useState({} as CanvasModel);
    const [context, setContext] = useState({} as CanvasRenderingContext2D)

    // Function to update the canvas size
    const updateCanvasSize = () => {
        const canvas = canvasRef.current;
        const parent = canvas?.parentElement;

        if (parent && canvas) {
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
    };

    useEffect(() => {
        const codeURL = `../karel/code/${props.nodeName}.js`;
        const worldURL = `../karel/code/${props.nodeName}.w`;
        loadImages().then(returnedImages => {
            fetchFile(worldURL).then(returnedWorld => {
                const w = createWorld(returnedWorld);
                setImages(w, returnedImages);
                setWorld(w);
            });
        });
        fetchFile(codeURL).then(returnedCode => setCode(returnedCode));
    }, []);

    useEffect(() => {
        // Initial canvas size update
        updateCanvasSize();

        // Attach resize event listener
        window.addEventListener('resize', updateCanvasSize);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx && world) {
                const c = {canvasWidth: canvas.width, canvasHeight: canvas.height} as CanvasModel;
                setKarelDimensions(c, world.rows, world.columns);
                draw(c, world, ctx);
                setCanvas(c);
                setContext(ctx);
            }
        }
    }, [world]);

    const runKarel = () => {
        if (world && code) {
            const engine = compile(world, code);
            engine.actionIndex = 0;
            const interval = setInterval(() => {
                if (engine.actionIndex >= engine.actionBuffer.length) {
                    clearInterval(interval);
                }
                heartbeat(engine);
            }, HEART_BEAT);
        }
    }

    const stopKarel = () => {
        console.log('stopKarel')
    }

    const heartbeat = (engine: Engine) => {
        executeStep(engine, world!);
        draw(canvas, world!, context);
    }

    const fetchFile = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const fileContent = await response.text();
            return fileContent;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error;
        }
    }

    const staticHeight = `calc(100vh - (${toolbar?.minHeight}px + ${8}px))`;
    return (
        <Grid2 container disableEqualOverflow>
            <Grid2 xs={1} sx={{
                height: staticHeight,
                overflowY: 'auto',
                maxWidth: '64px',
                display: {xs: 'none', sm: 'none', md: 'block', lg: 'block'}
            }}>
                <IDEActions onRun={runKarel} onStop={stopKarel}/>
            </Grid2>
            <Grid2 xs={5} sx={{
                height: staticHeight,
                overflowY: 'hidden',
                border: 2,
                borderColor: 'primary.main',
            }}>
                <AceEditor
                    mode="javascript"
                    theme="github"
                    // onChange={onChange}
                    name="javascript_editor"
                    setOptions={{
                        enableBasicAutocompletion: false,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: true,
                        tabSize: 4,
                        useWorker: false,
                    }}
                    onChange={(value) => {
                        setCode(value);
                    }}
                    fontSize={20}
                    height={staticHeight}
                    width={'100%'}
                    value={code || 'loading code ...'}
                />
            </Grid2>

            <Grid2 xs={6} sx={{
                height: staticHeight,
                overflow: 'hidden',
                borderColor: 'primary.main',
            }}>
                <canvas id = 'mainIdeCanvas' ref={canvasRef}></canvas>
            </Grid2>
        </Grid2>
    )

}

export default IDE;
