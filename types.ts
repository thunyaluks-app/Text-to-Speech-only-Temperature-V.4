
export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
}

export interface SpeakerConfig {
  voice: string;
  volume: number;
  toneDescription: string;
  temperature: number;
}

export interface Voice {
  name: string;
  id: string;
  isCustom?: boolean;
  baseVoiceId?: string; 
  toneDescription?: string;
}

export interface TextModel {
  id: string;
  name: string;
  description: string;
}

export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Zephyr = 'Zephyr',
  Fenrir = 'Fenrir',
  Enceladus = 'Enceladus'
}
