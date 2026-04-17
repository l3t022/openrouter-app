import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types';

interface UseChatOptions {
  apiKey: string;
  selectedModels: {
    text: string;
    code: string;
    vision: string;
    fallback: string;
  };
  onError?: (error: string) => void;
  onRetry?: (isRetrying: boolean) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  streamingContent: string;
  isRetrying: boolean;
  sendMessage: (input: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat({ apiKey, selectedModels, onError, onRetry }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const messagesRef = useRef(messages);

  messagesRef.current = messages;

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;

    if (!apiKey) {
      onError?.('⚠️ Ingresa tu OpenRouter API Key en Settings y guarda.');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messagesRef.current, userMessage];
    setMessages(newMessages);
    setStreamingContent('...');

    try {
      let modelToUse =
        selectedModels.text ||
        selectedModels.code ||
        selectedModels.vision ||
        'openrouter/free';

      if (
        (input.toLowerCase().includes('code') || input.toLowerCase().includes('function')) &&
        selectedModels.code
      ) {
        modelToUse = selectedModels.code;
      }

      const executeChat = async (targetModel: string) => {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, model: targetModel, apiKey }),
        });

        if (!response.ok) {
          const errText = await response.text();
          let errMsg = `Error ${response.status}`;
          try {
            errMsg = JSON.parse(errText).error || errMsg;
          } catch {}
          throw { message: errMsg, status: response.status };
        }
        return response;
      };

      let response;
      try {
        response = await executeChat(modelToUse);
      } catch (err: unknown) {
        const error = err as { status?: number; message?: string };
        if (selectedModels.fallback && error.status && (error.status === 429 || error.status >= 500)) {
          setIsRetrying(true);
          onRetry?.(true);
          await new Promise((r) => setTimeout(r, 1000));
          response = await executeChat(selectedModels.fallback);
          setIsRetrying(false);
          onRetry?.(false);
        } else {
          throw err;
        }
      }

      const reader = response.body?.getReader();
      let accumulated = '';
      setStreamingContent('');

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += new TextDecoder().decode(value);
          setStreamingContent(accumulated);
        }
      }

      setMessages([...newMessages, { role: 'assistant', content: accumulated }]);
      setStreamingContent('');
    } catch (err: unknown) {
      console.error(err);
      setIsRetrying(false);
      onRetry?.(false);
      setStreamingContent('');
      const errorMsg = err instanceof Error ? err.message : 'Error al procesar la solicitud.';
      onError?.(errorMsg);
    }
  }, [apiKey, selectedModels, onError, onRetry]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
  }, []);

  return { messages, streamingContent, isRetrying, sendMessage, clearMessages };
}