export interface CanvasRefHandle {
  downloadImage: () => void;
  copyImageToClipboard: () => Promise<void>;
  shareImage: (platform: 'twitter' | 'whatsapp' | 'native') => Promise<void>;
}

export type AspectRatio = 'square' | 'story';

export interface MemeCanvasProps {
  text: string;
  width?: number;
  fontSize?: number;
  padding?: number;
  // Styling options
  fontFamily?: string;
  fontWeight?: string; // New: Font weight (normal, bold, etc)
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string | null; // Data URL or Object URL
  
  // V2 Features
  isWeirdMode?: boolean;
  weirdnessLevel?: number; // 1-5
  randomSeed?: number; // To trigger re-randomization
  isSeriousMode?: boolean;
  sticker?: string | null;
  blurLevel?: number; // New blur feature
  
  // V3 Features
  aspectRatio?: AspectRatio;
  onQualityAlert?: (message: string | null) => void;
}

export interface AppSettings {
  fontFamily: string;
  fontWeight: string;
  backgroundColor: string;
  textColor: string;
  backgroundImage: string | null;
  sticker: string | null;
}