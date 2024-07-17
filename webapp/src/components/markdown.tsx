import React from 'react';
import ReactMarkdown from 'react-markdown'

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {coy} from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm'

interface Props {
    text: string;
}

const Markdown = (props: Props) => {
    return (
        <ReactMarkdown
            components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                code({ref, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return match ?
                        (
                            <SyntaxHighlighter
                                {...props}
                                style={coy}
                                language={match[1]}
                                PreTag="div"
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code {...props} className={className}>
                                {children}
                            </code>
                        )
                }
            }}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
        >
            {props.text}
        </ReactMarkdown>
    );
}

export default Markdown;
