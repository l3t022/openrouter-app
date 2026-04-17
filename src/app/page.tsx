'use client';

import { useState, useEffect } from 'react';
import { SelectedModels, Toast, ChatMessage } from '@/types';
import { useModels } from '@/hooks/useModels';
import { SettingsPanel, ChatMessages, ChatInput, ToastContainer } from '@/components';
import { generateId } from '@/lib/utils';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModels>({
    text: '',
    code: '',
    vision: '',
    fallback: '',
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [chatError, setChatError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  const { models, loading } = useModels();

  const addToast = (title: string, msg: string, type: Toast['type'] = 'error') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    const savedModels = localStorage.getItem('selected_models');
    if (savedKey) setApiKey(savedKey);
    if (savedModels) setSelectedModels(JSON.parse(savedModels));
  }, []);

  const saveSettings = () => {
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('selected_models', JSON.stringify(selectedModels));
    addToast('Settings Saved', 'Your configuration has been saved.', 'success');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!apiKey) {
      setChatError('⚠️ Ingresa tu OpenRouter API Key en Settings y guarda.');
      return;
    }

    setChatError('');
    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
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
        if (selectedModels.fallback && (error.status === 429 || error.status >= 500)) {
          setIsRetrying(true);
          addToast('Model Busy', `Retrying with fallback: ${selectedModels.fallback}...`, 'info');
          await new Promise((r) => setTimeout(r, 1000));
          response = await executeChat(selectedModels.fallback);
          setIsRetrying(false);
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
      setStreamingContent('');
      const errorMsg = err instanceof Error ? err.message : 'Error al procesar la solicitud.';
      setChatError(`❌ ${errorMsg}`);
      addToast('Chat Error', errorMsg, 'error');
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading OpenRouter Models…</div>;
  }

  return (
    <main className="dashboard">
      <SettingsPanel
        apiKey={apiKey}
        models={models}
        selectedModels={selectedModels}
        onApiKeyChange={setApiKey}
        onModelChange={setSelectedModels}
        onSave={saveSettings}
      />

      <section className="card chat-container">
        <h2>Chat Preview</h2>
        <div className="chat-messages">
          <ChatMessages messages={messages} streamingContent={streamingContent} />
        </div>

        {chatError && <div className="chat-error-banner">{chatError}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {isRetrying && (
            <div className="fallback-retry-pill">
              🔄 Fallback active: Trying secondary model...
            </div>
          )}
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            disabled={isRetrying}
          />
        </div>
      </section>

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </main>
  );
}