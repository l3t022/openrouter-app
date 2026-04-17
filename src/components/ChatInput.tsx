interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <input
        placeholder="Type a message…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && onSend()}
        style={{ marginBottom: 0 }}
      />
      <button className="btn" style={{ width: '100px' }} onClick={onSend} disabled={disabled}>
        Send
      </button>
    </div>
  );
}