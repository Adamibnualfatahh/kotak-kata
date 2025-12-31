import React, { useState } from 'react';

interface ControlsProps {
  onDownload: () => void;
  onCopy: () => Promise<void>;
}

export const Controls: React.FC<ControlsProps> = ({ onDownload, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Gagal menyalin", e);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
      <button
        onClick={onDownload}
        className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg active:transform active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Unduh PNG
      </button>

      <button
        onClick={handleCopy}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium border-2 transition-all active:transform active:scale-95
          ${copied 
            ? 'bg-green-100 border-green-500 text-green-700' 
            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Tersalin!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Salin Gambar
          </>
        )}
      </button>
    </div>
  );
};
