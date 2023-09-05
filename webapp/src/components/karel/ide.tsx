import React, {useEffect, useState} from 'react';

import { World, createWorld, loadImages, setImages} from './types';
import IDEComponent from './ide_component';
import {compile, compileJava} from './engine';

interface Props {
    nodeName: string;
    lang: string;
}

const IDE = (props: Props) => {
    const [world, setWorld] = useState<World | null>(null);
    const [code, setCode] = useState<string>('code is loading...');

    useEffect(() => {
        let codeURL = `../karel/code/${props.nodeName}.js`;
        if (props.lang === 'java') {
            codeURL = `../karel/code/${props.nodeName}.java`
        }
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

    if (!world) {
        return <div>loading...</div>
    }

    let compileFunc = compile;
    if (props.lang === 'java') {
        compileFunc = compileJava;
    }

    return (
        <IDEComponent initialWorld={world} initialCode={code} compileFunc={compileFunc}/>
    )

}

export default IDE;
