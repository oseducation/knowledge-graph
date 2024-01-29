import React, { useEffect, useState } from 'react';
import {Link} from '@mui/material';


interface Props {
    fallback: boolean
    link?: string;
    children: React.ReactNode;
}

const MessageLinkFallback = ({fallback, link, children}: Props) => {
    const [showLink, setShowLink] = useState(false)

    useEffect(()=>{
        if(fallback){
            setShowLink(true);
        }
    }, [])

    if(showLink){   
        return <Link target="_blank" rel="noopener" href={link}>Link to Resource</Link>
    }else{
        return <>{children}</>
    }
};


export default MessageLinkFallback;
