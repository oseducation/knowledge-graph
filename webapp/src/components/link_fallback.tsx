import React from 'react';
import {Link} from '@mui/material';


interface Props {
    fallback: boolean
    link: string;
    text: string;
    children: React.ReactNode;
}

const LinkFallback = ({fallback, link, text = 'Link to Resource', children}: Props) => {
    if(fallback){   
        return <Link target="_blank" rel="noopener" href={link}>{text}</Link>
    }else{
        return <>{children}</>
    }
};


export default LinkFallback;
