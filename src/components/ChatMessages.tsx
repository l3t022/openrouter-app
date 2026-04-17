import { ChatMessage } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessagesProps {
  messages: ChatMessage[];
  streamingContent: string;
}

export function ChatMessages({ messages, streamingContent }: ChatMessagesProps) {
  if (messages.length === 0 && !streamingContent) {
    return (
      <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>
        Select your models and start a conversation.
      </div>
    );
  }

  return (
    <>
      {messages.map((m, i) => (
        <div key={i} className={`message ${m.role}`}>
          <strong>{m.role === 'user' ? 'You' : 'Assistant'}</strong>
          {m.role === 'assistant' ? (
            <MarkdownRenderer content={m.content} />
          ) : (
            <p>{m.content}</p>
          )}
        </div>
      ))}
      {streamingContent && (
        <div className="message assistant">
          <strong>Assistant</strong>
          <MarkdownRenderer content={streamingContent} />
        </div>
      )}
    </>
  );
}