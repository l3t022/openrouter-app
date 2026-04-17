'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;

          return isInline ? (
            <code className={className} {...props}>
              {children}
            </code>
          ) : (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        },
        p({ children }) {
          return <p style={{ margin: '0.5rem 0' }}>{children}</p>;
        },
        ul({ children }) {
          return <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>{children}</ul>;
        },
        ol({ children }) {
          return <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>{children}</ol>;
        },
        li({ children }) {
          return <li style={{ margin: '0.25rem 0' }}>{children}</li>;
        },
        h1({ children }) {
          return <h3 style={{ margin: '1rem 0 0.5rem', fontSize: '1.5rem' }}>{children}</h3>;
        },
        h2({ children }) {
          return <h4 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.25rem' }}>{children}</h4>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}