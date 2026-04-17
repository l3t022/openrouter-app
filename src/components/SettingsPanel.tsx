'use client';

import { OpenRouterModel, SelectedModels } from '@/types';
import { ModelPicker } from './ModelPicker';

interface SettingsPanelProps {
  apiKey: string;
  models: { all: OpenRouterModel[]; coding: OpenRouterModel[]; vision: OpenRouterModel[] };
  selectedModels: SelectedModels;
  onApiKeyChange: (key: string) => void;
  onModelChange: (models: SelectedModels) => void;
  onSave: () => void;
}

export function SettingsPanel({
  apiKey,
  models,
  selectedModels,
  onApiKeyChange,
  onModelChange,
  onSave,
}: SettingsPanelProps) {
  return (
    <aside className="card">
      <h2>Settings</h2>
      <div className="model-group">
        <label>OpenRouter API Key</label>
        <input
          type="password"
          placeholder="sk-or-v1-…"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
      </div>

      <h3>Model Selection</h3>

      <ModelPicker
        label="General Text Model"
        models={models.all}
        value={selectedModels.text}
        onChange={(id) => onModelChange({ ...selectedModels, text: id })}
      />

      <ModelPicker
        label="Coding Model"
        models={models.coding.length ? models.coding : models.all}
        value={selectedModels.code}
        onChange={(id) => onModelChange({ ...selectedModels, code: id })}
      />

      <ModelPicker
        label="Vision / Image Model"
        models={models.vision.length ? models.vision : models.all}
        value={selectedModels.vision}
        onChange={(id) => onModelChange({ ...selectedModels, vision: id })}
      />

      <ModelPicker
        label="Fallback Model (Auto-retry)"
        models={models.all}
        value={selectedModels.fallback}
        onChange={(id) => onModelChange({ ...selectedModels, fallback: id })}
      />

      <button className="btn" onClick={onSave}>
        Save Settings
      </button>
    </aside>
  );
}