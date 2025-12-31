import React, { useState, useRef } from 'react';
import MemeCanvas from './components/MemeCanvas';
import { Controls } from './components/Controls';
import { SettingsModal } from './components/SettingsModal';
import { CanvasRefHandle, AppSettings } from './types';

const App: React.FC = () => {
  const [text, setText] = useState<string>("ikan hiu ikan kakap, hei you can i get your pap?");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    fontFamily: 'Arial',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    backgroundImage: null,
  });

  const canvasRef = useRef<CanvasRefHandle>(null);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-gray-200">
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header */}
        <header className="text-center mb-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mb-4 shadow-xl transform -rotate-3">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="7" y1="8" x2="17" y2="8"></line>
                <line x1="7" y1="12" x2="17" y2="12"></line>
                <line x1="7" y1="16" x2="12" y2="16"></line>
             </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 font-mono">
            KotakKata
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Buat meme teks viral kotak persegi dengan format teks otomatis.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Input */}
          <section className="flex flex-col gap-6 order-2 lg:order-1 relative">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative z-10">
              <label htmlFor="text-input" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Tulis Teks Disini
              </label>
              <textarea
                id="text-input"
                className="w-full h-48 p-4 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-300"
                placeholder="Ketik sesuatu yang ikonik..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-2 text-right text-xs text-gray-400">
                Otomatis diperbarui saat mengetik
              </div>
            </div>

            <div className="hidden lg:block">
               <Controls 
                  onDownload={() => canvasRef.current?.downloadImage()}
                  onCopy={() => canvasRef.current?.copyImageToClipboard() || Promise.resolve()}
               />
            </div>
          </section>

          {/* Right Column: Preview */}
          <section className="flex flex-col items-center order-1 lg:order-2 bg-gray-200/50 rounded-3xl p-8 lg:sticky lg:top-8 border border-gray-200/50 relative">
             <div className="mb-6">
                 <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-400 border border-gray-200 shadow-sm">
                    PRATINJAU
                 </span>
             </div>
             
             {/* The Meme Canvas */}
             <div className="transform transition-transform hover:scale-[1.02] duration-300">
                <MemeCanvas 
                  ref={canvasRef}
                  text={text} 
                  width={240}
                  fontSize={42}
                  padding={24}
                  fontFamily={settings.fontFamily}
                  backgroundColor={settings.backgroundColor}
                  textColor={settings.textColor}
                  backgroundImage={settings.backgroundImage}
                />
             </div>

             {/* Mobile Controls */}
             <div className="block lg:hidden w-full mt-8">
                <Controls 
                  onDownload={() => canvasRef.current?.downloadImage()}
                  onCopy={() => canvasRef.current?.copyImageToClipboard() || Promise.resolve()}
               />
             </div>
          </section>

        </div>
      </main>
      
      {/* Floating Settings Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-black text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-transform hover:scale-110 active:scale-95 flex items-center gap-2 group"
          title="Pengaturan Tampilan"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
             Pengaturan
          </span>
        </button>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />

      <footer className="mt-16 py-8 text-center text-gray-400 text-sm border-t border-gray-200">
        <p>KotakKata &copy; {new Date().getFullYear()} - Render Lokal, Tanpa Server.</p>
      </footer>
    </div>
  );
};

export default App;
