'use client';

import { useState, useEffect } from 'react';
import { SelectedModels, Toast } from '@/types';
import { useModels } from '@/hooks/useModels';
import { useChat } from '@/hooks/useChat';
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
  const [input, setInput] = useState('');
  const [chatError, setChatError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { models, loading } = useModels();

  const { messages, streamingContent, isRetrying, sendMessage } = useChat({
    apiKey,
    selectedModels,
    onError: (error) => {
      setChatError(`❌ ${error}`);
      addToast('Chat Error', error, 'error');
    },
    onRetry: () => {},
  });

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

  const handleSend = async () => {
    setChatError('');
    await sendMessage(input);
    setInput('');
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
            onChange={(val) => {
              setInput(val);
              if (chatError) setChatError('');
            }}
            onSend={handleSend}
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