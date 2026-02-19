
import React, { useState, useMemo } from 'react';
import type { SpeakerConfig, Voice } from '../types';
import { AVAILABLE_VOICES } from '../constants';
import { PlayIcon, LoadingSpinner, VoiceCloneIcon, StopIcon } from './icons';

interface SpeakerControlProps {
  speakerName: string;
  config: SpeakerConfig;
  onConfigChange: (newConfig: SpeakerConfig) => void;
  onPreview: () => Promise<void>;
  onStop: () => void;
  onCloneVoice: () => void;
  allVoices: Voice[];
  isCurrentlyPlaying: boolean;
}

const SpeakerControl: React.FC<SpeakerControlProps> = ({ 
  speakerName, 
  config, 
  onConfigChange, 
  onPreview, 
  onStop,
  onCloneVoice, 
  allVoices,
  isCurrentlyPlaying
}) => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const customVoices = allVoices.filter(v => v.isCustom);

  // Consistency score depends on low temperature
  const stabilityScore = useMemo(() => {
    const tempImpact = (2 - config.temperature) / 1.5; 
    return Math.min(100, Math.round(tempImpact * 100));
  }, [config.temperature]);

  const getStabilityLabel = () => {
    if (stabilityScore > 80) return { label: 'Maximum Consistency', color: 'text-emerald-400', bar: 'bg-emerald-500' };
    if (stabilityScore > 50) return { label: 'Stable acting', color: 'text-cyan-400', bar: 'bg-cyan-500' };
    return { label: 'Creative / Varied', color: 'text-amber-400', bar: 'bg-amber-500' };
  };

  const stability = getStabilityLabel();

  const handlePreviewClick = async () => {
    setIsPreviewing(true);
    try {
      await onPreview();
    } catch (error) {
      console.error(`Preview failed for ${speakerName}:`, error);
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 transition-all hover:border-cyan-500">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-cyan-400">{speakerName}</h3>
        <div className="flex items-center gap-2 flex-wrap">
           <button
            onClick={onCloneVoice}
            title="Clone a new voice"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-md transition-colors duration-300 text-xs shadow-lg shadow-indigo-900/20"
          >
            <VoiceCloneIcon className="w-4 h-4" />
            <span>Clone Voice</span>
          </button>
          
          <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg">
            <button
              onClick={handlePreviewClick}
              disabled={isPreviewing}
              className={`flex items-center gap-2 ${
                isCurrentlyPlaying ? 'bg-cyan-700' : 'bg-cyan-600 hover:bg-cyan-700'
              } text-white font-bold py-1.5 px-3 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-xs`}
            >
              {isPreviewing ? (
                <>
                  <LoadingSpinner className="w-4 h-4" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Preview Full</span>
                </>
              )}
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1.5 px-3 rounded-md transition-colors duration-300 text-xs"
              title="Stop Preview"
            >
              <StopIcon className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div>
            <label htmlFor={`voice-${speakerName}`} className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Voice Model
            </label>
            <select
            id={`voice-${speakerName}`}
            value={config.voice}
            onChange={(e) => onConfigChange({ ...config, voice: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <optgroup label="Pre-built Voices">
                {AVAILABLE_VOICES.map((voice: Voice) => (
                <option key={voice.id} value={voice.id}>
                    {voice.name}
                </option>
                ))}
            </optgroup>
            {customVoices.length > 0 && (
                <optgroup label="Custom Voices">
                    {customVoices.map((voice: Voice) => (
                    <option key={voice.id} value={voice.id}>
                        {voice.name} (Custom)
                    </option>
                    ))}
                </optgroup>
            )}
            </select>
        </div>

        <div className="bg-black/30 p-3 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Consistency Gauge</span>
                <span className={`text-[10px] font-bold uppercase ${stability.color}`}>{stability.label}</span>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${stability.bar}`} 
                    style={{ width: `${stabilityScore}%` }}
                ></div>
            </div>
            <p className="text-[9px] text-gray-500 mt-2 leading-tight">
                * To fix voice across batches: Use <b>Temperature &lt; 0.8</b>
            </p>
        </div>
      </div>

      <div className="mb-4">
          <label htmlFor={`tone-${speakerName}`} className="block text-xs font-medium text-gray-300 mb-1">
            Voice Tone Description (Strict Persona)
          </label>
          <textarea
            id={`tone-${speakerName}`}
            rows={2}
            value={config.toneDescription || ''}
            onChange={(e) => onConfigChange({ ...config, toneDescription: e.target.value })}
            placeholder="Describe the aesthetic (e.g., 'Speak calmly and slowly...')"
            className="w-full bg-gray-900/40 border border-gray-700 rounded-md p-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
          />
      </div>

      <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor={`volume-${speakerName}`} className="block text-xs font-medium text-gray-400 mb-1">
                    Volume: <span className="font-mono text-cyan-300">{Number(config.volume).toFixed(1)}x</span>
                </label>
                <input
                    type="range"
                    id={`volume-${speakerName}`}
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={config.volume}
                    onChange={(e) => onConfigChange({ ...config, volume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>
            <div>
                <label htmlFor={`temp-${speakerName}`} className="block text-xs font-medium text-gray-400 mb-1">
                    Temperature: <span className="font-mono text-amber-400">{Number(config.temperature).toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    id={`temp-${speakerName}`}
                    min="0.5"
                    max="2"
                    step="0.05"
                    value={config.temperature}
                    onChange={(e) => onConfigChange({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
      </div>
    </div>
  );
};

export default SpeakerControl;
