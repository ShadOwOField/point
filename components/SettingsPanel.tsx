
import React from 'react';
import { ParticleConfig } from '../types';

interface SettingsPanelProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, setConfig, onClose }) => {
  const handleChange = (key: keyof ParticleConfig, value: number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute top-20 right-6 w-72 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-medium text-sm tracking-widest uppercase">Configuration</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <ControlItem
          label="Particle Count"
          value={config.count}
          min={10}
          max={200}
          step={1}
          onChange={(v) => handleChange('count', v)}
        />
        <ControlItem
          label="Movement Speed"
          value={config.speed}
          min={0.1}
          max={3}
          step={0.1}
          onChange={(v) => handleChange('speed', v)}
        />
        <ControlItem
          label="Connection Link"
          value={config.connectionDistance}
          min={50}
          max={400}
          step={10}
          onChange={(v) => handleChange('connectionDistance', v)}
        />
        <ControlItem
          label="Opacity"
          value={config.baseOpacity}
          min={0.1}
          max={1}
          step={0.05}
          onChange={(v) => handleChange('baseOpacity', v)}
        />
        
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-white/50 text-[11px] uppercase tracking-tighter">Interactive Mode</span>
          <button
            onClick={() => handleChange('interactive', !config.interactive)}
            className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${config.interactive ? 'bg-indigo-500' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${config.interactive ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ControlItem: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] uppercase tracking-wider">
      <span className="text-white/50">{label}</span>
      <span className="text-white/90">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
    />
  </div>
);

export default SettingsPanel;
