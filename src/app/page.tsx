'use client';

import { useState, useEffect, useRef } from 'react';
import { OpenRouterModel, OpenRouterService } from '@/lib/openrouter-service';

// ── Searchable Model Picker ──────────────────────────────────────────────────

interface ModelPickerProps {
  label: string;
  models: OpenRouterModel[];
  value: string;
  onChange: (id: string) => void;
}

function ModelPicker({ label, models, value, onChange }: ModelPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? models.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase())
      )
    : models;

  const selected = models.find((m) => m.id === value);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const pick = (id: string) => {
    onChange(id);
    setSearch('');
    setOpen(false);
  };

  return (
    <div className="model-group" ref={ref}>
      <label>{label}</label>
      <div className="picker-wrapper">
        {/* Search / trigger input */}
        <div className="picker-input-row" onClick={() => setOpen(true)}>
          <input
            className="picker-input"
            type="text"
            placeholder={selected ? selected.name : 'Search or select a model…'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          <span className="picker-arrow">{open ? '▲' : '▼'}</span>
        </div>

        {/* Selected badge */}
        {selected && !open && (
          <div className="picker-badge">
            <span>{selected.name}</span>
            <span className="picker-price">
              {OpenRouterService.formatPrice(selected.pricing.prompt)}
            </span>
            <button
              className="picker-clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Dropdown list */}
        {open && (
          <ul className="picker-list">
            {filtered.length === 0 && (
              <li className="picker-empty">No models found for "{search}"</li>
            )}
            {filtered.slice(0, 80).map((m) => (
              <li
                key={m.id}
                className={`picker-item ${m.id === value ? 'picker-item--selected' : ''}`}
                onMouseDown={() => pick(m.id)}
              >
                <span className="picker-item-name">{m.name}</span>
                <span className="picker-item-price">
                  {OpenRouterService.formatPrice(m.pricing.prompt)}
                </span>
              </li>
            ))}
            {filtered.length > 80 && (
              <li className="picker-empty">
                {filtered.length - 80} more — refine your search
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<{ [key: string]: OpenRouterModel[] }>({
    all: [],
    free: [],
    vision: [],
    coding: [],
  });
  const [selectedModels, setSelectedModels] = useState({
    text: '',
    code: '',
    vision: '',
    fallback: '',
  });
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [chatError, setChatError] = useState('');
  const [toasts, setToasts] = useState<{ id: number; title: string; msg: string; type: 'error' | 'success' | 'info' }[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  const addToast = (title: string, msg: string, type: 'error' | 'success' | 'info' = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    const savedModels = localStorage.getItem('selected_models');
    if (savedKey) setApiKey(savedKey);
    if (savedModels) setSelectedModels(JSON.parse(savedModels));

    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
        setLoading(false);
      });
  }, []);

  const saveSettings = () => {
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('selected_models', JSON.stringify(selectedModels));
    alert('Settings saved!');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Validate API key before sending
    if (!apiKey) {
      setChatError('⚠️ Ingresa tu OpenRouter API Key en Settings y guarda.');
      return;
    }

    setChatError('');
    const userMessage = { role: 'user' as const, content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setStreamingContent('...');

    try {
      // Logic for model selection
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

      const executeChat = async (targetModel: string, isFallbackAttempt = false) => {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, model: targetModel, apiKey }),
        });

        if (!response.ok) {
          const errText = await response.text();
          let errMsg = `Error ${response.status}`;
          try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
          throw { message: errMsg, status: response.status };
        }
        return response;
      };

      let response;
      try {
        response = await executeChat(modelToUse);
      } catch (err: any) {
        // FALLBACK LOGIC
        if (selectedModels.fallback && (err.status === 429 || err.status >= 500)) {
          setIsRetrying(true);
          addToast('Model Busy', `Retrying with fallback: ${selectedModels.fallback}...`, 'info');
          // Wait a tiny bit to avoid hitting potential rate limit immediately
          await new Promise(r => setTimeout(r, 1000));
          response = await executeChat(selectedModels.fallback, true);
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
    } catch (err: any) {
      console.error(err);
      setIsRetrying(false);
      setStreamingContent('');
      const errorMsg = err.message || 'Error al procesar la solicitud.';
      setChatError(`❌ ${errorMsg}`);
      addToast('Chat Error', errorMsg, 'error');
    }
  };

  if (loading)
    return <div style={{ color: 'white', padding: '2rem' }}>Loading OpenRouter Models…</div>;

  return (
    <main className="dashboard">
      {/* Sidebar: Settings */}
      <aside className="card">
        <h2>Settings</h2>
        <div className="model-group">
          <label>OpenRouter API Key</label>
          <input
            type="password"
            placeholder="sk-or-v1-…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <h3>Model Selection</h3>

        <ModelPicker
          label="General Text Model"
          models={models.all}
          value={selectedModels.text}
          onChange={(id) => setSelectedModels({ ...selectedModels, text: id })}
        />

        <ModelPicker
          label="Coding Model"
          models={models.coding.length ? models.coding : models.all}
          value={selectedModels.code}
          onChange={(id) => setSelectedModels({ ...selectedModels, code: id })}
        />

        <ModelPicker
          label="Vision / Image Model"
          models={models.vision.length ? models.vision : models.all}
          value={selectedModels.vision}
          onChange={(id) => setSelectedModels({ ...selectedModels, vision: id })}
        />

        <ModelPicker
          label="Fallback Model (Auto-retry)"
          models={models.all}
          value={selectedModels.fallback}
          onChange={(id) => setSelectedModels({ ...selectedModels, fallback: id })}
        />

        <button className="btn" onClick={saveSettings}>
          Save Settings
        </button>
      </aside>

      {/* Main Column: Chat */}
      <section className="card chat-container">
        <h2>Chat Preview</h2>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <strong>{m.role === 'user' ? 'You' : 'Assistant'}</strong>
              <p>{m.content}</p>
            </div>
          ))}
          {streamingContent && (
            <div className="message assistant">
              <strong>Assistant</strong>
              <p>{streamingContent}</p>
            </div>
          )}
          {messages.length === 0 && !streamingContent && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>
              Select your models and start a conversation.
            </div>
          )}
        </div>

        {/* Error banner */}
        {chatError && (
          <div className="chat-error-banner">{chatError}</div>
        )}

        {/* Input Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {isRetrying && (
            <div className="fallback-retry-pill">
              🔄 Fallback active: Trying secondary model...
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              placeholder="Type a message…"
              value={input}
              onChange={(e) => { setInput(e.target.value); setChatError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{ marginBottom: 0 }}
            />
            <button className="btn" style={{ width: '100px' }} onClick={sendMessage} disabled={isRetrying}>
              Send
            </button>
          </div>
        </div>
      </section>

      {/* Toast Overlay */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.msg}</div>
            </div>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
