import React, {useEffect, useState} from 'react';

import {Client} from '../../client/client';

import { World, createEmptyWorld, createWorld, loadImages, setImages} from './types';
import IDEComponent from './ide_component';
import {compile, compileJava} from './engine';

interface Props {
    nodeName: string;
    nodeID: string;
    lang: string;
}

const IDE = (props: Props) => {
    const [world, setWorld] = useState<World | null>(null);
    const [initialCode, setInitialCode] = useState<string>('code is loading...');
    const [userCode, setUserCode] = useState<string>('');

    useEffect(() => {
        let codeURL = `../karel/code/${props.nodeName}.js`;
        if (props.lang === 'java') {
            codeURL = `../karel/code/${props.nodeName}.java`
        }
        const worldURL = `../karel/code/${props.nodeName}.w`;
        loadImages().then(returnedImages => {
            fetchFile(worldURL).then(returnedWorld => {
                let w: World;
                if (returnedWorld === '') {
                    w = createEmptyWorld(10, 10);
                } else {
                    w = createWorld(returnedWorld);
                }
                setImages(w, returnedImages);
                setWorld(w);
            });
        });
        fetchFile(codeURL).then(returnedCode => setInitialCode(returnedCode));
        Client.User().getMyCodes(props.nodeID).then(codes => setUserCode(codes[0].code))
    }, []);

    const fetchFile = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return '';
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
        <IDEComponent
            initialWorld={world}
            initialCode={initialCode}
            userCode={userCode}
            nodeID={props.nodeID}
            compileFunc={compileFunc}
        />
    )

}

export default IDE;
