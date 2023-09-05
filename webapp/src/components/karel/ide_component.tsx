import React, {useEffect, useRef, useState} from 'react';
import {useTheme, Alert, Collapse, IconButton} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import AceEditor from "react-ace";
import "ace-builds";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-javascript";
import CloseIcon from '@mui/icons-material/Close';

import {World, deepCopyWorld} from './types';
import {draw} from './canvas_renderer';
import {Engine, compile, executeStep, getEngine} from './engine';
import IDEActions from './ide_actions';


const HEART_BEAT_MIN = 0;
const HEART_BEAT_MAX = 1000;

interface Props {
    initialWorld: World;
    initialCode: string;
}

const IDEComponent = (props: Props) => {
    const {
        mixins: {toolbar},
    } = useTheme();


    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [code, setCode] = useState(props.initialCode);
    const [world, setWorld] = useState(deepCopyWorld(props.initialWorld));
    const [compilationAlert, setCompilationAlert] = useState('');
    const [speed, setSpeed] = useState(370)

    // Function to update the canvas size
    const updateCanvasSize = () => {
        const canvas = canvasRef.current;
        const parent = canvas?.parentElement;

        if (parent && canvas) {
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            drawCanvas();
        }
    };

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
        drawCanvas()
    }, [world]);

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                draw(world, ctx, canvas.width, canvas.height);
            }
        }
    }

    const runKarel = () => {
        try{
            compile(world, code);
        } catch(e) {
            const err = e as Error;
            console.log(err.message);
        }
        const engine = getEngine();
        engine.actionIndex = 0;
        const interval = setInterval(() => {
            if (engine.actionIndex >= engine.actionBuffer.length) {
                clearInterval(interval);
            }
            heartbeat(engine);
        }, speed);
    }

    const speedChange = (value: number) => {
        setSpeed((HEART_BEAT_MIN - HEART_BEAT_MAX) * value / 100 + HEART_BEAT_MAX);
    }

    const heartbeat = (engine: Engine) => {
        try {
            executeStep(engine, world);
        } catch (e) {
            const err = e as Error;
            setCompilationAlert(err.message);
        }
        drawCanvas();
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
                <IDEActions
                    onRun={runKarel}
                    onSpeedChange={speedChange}
                    onResetWorld={() => setWorld(deepCopyWorld(props.initialWorld))}
                />
            </Grid2>
            <Grid2 xs={5} sx={{
                height: staticHeight,
                overflowY: 'hidden',
                border: 2,
                borderColor: 'primary.main',
            }}>
                <Collapse in={compilationAlert !== ''}>
                    <Alert
                        severity="error"
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setCompilationAlert('');
                                }}
                            >
                                <CloseIcon fontSize="inherit"/>
                            </IconButton>
                        }
                        sx={{mb: 2}}
                    >
                        <div>{compilationAlert}</div>
                    </Alert>
                </Collapse>
                <AceEditor
                    mode="javascript"
                    theme="textmate"
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
                    value={code}
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

export default IDEComponent;
