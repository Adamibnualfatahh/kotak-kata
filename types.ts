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
}

export interface AppSettings {
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  backgroundImage: string | null;
}
