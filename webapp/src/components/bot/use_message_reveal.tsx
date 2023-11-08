import {useState, useEffect} from 'react'

export default function useMessageReveal(finalMessage: string, reveal: boolean, scrollToBottom: () => void) {
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (reveal){
            revealBotMessage(finalMessage);
        } else{
            setMessage(finalMessage);
            const timer = setTimeout(() => {
                scrollToBottom();
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [finalMessage]);


    const revealBotMessage = (finalMessage: string) => {
        let index = 0;
        scrollToBottom();
        const interval = setInterval(() => {
            setMessage(finalMessage.slice(0, index + 1) + '⬤');
            index += 1;

            if (finalMessage[index] === '\n') {
                scrollToBottom();
            }

            if (index === finalMessage.length) {
                setMessage(finalMessage);
                clearInterval(interval);
                scrollToBottom();
            }
        }, 10); // Adjust the speed as needed
    };


    return {message};
}
