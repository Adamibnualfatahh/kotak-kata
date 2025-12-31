export interface CanvasRefHandle {
  downloadImage: () => void;
  copyImageToClipboard: () => Promise<void>;
}

export interface MemeCanvasProps {
  text: string;
  width?: number;
  fontSize?: number;
  padding?: number;
  // Styling options
  fontFamily?: string;
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
}

export interface AppSettings {
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  backgroundImage: string | null;
  sticker: string | null;
}