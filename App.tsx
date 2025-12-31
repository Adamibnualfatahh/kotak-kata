import React, { useState, useRef } from 'react';
import MemeCanvas from './components/MemeCanvas';
import { Controls } from './components/Controls';
import { SettingsModal } from './components/SettingsModal';
import { CanvasRefHandle, AppSettings } from './types';

const TEMPLATES = [
  { label: "Pilih Template Viral...", value: "" },
  { label: "Ikan Hiu (Classic)", value: "ikan hiu ikan kakap, hei you can i get your pap?" },
  { label: "Pinjam Seratus", value: "agar silaturahmi tidak terputus, bolehkah saya pinjam seratus?" },
  { label: "Info Loker", value: "info loker yang kerjanya cuman nafas doang tapi gaji 2 digit?" },
  { label: "Sekadar Mengingatkan", value: "sekadar mengingatkan 🙏, jangan lupa untuk tidak lupa." },
  { label: "Maaf Lancang", value: "maaf lancang 🙏, apakah boleh saya menyukaimu secara ugal-ugalan?" },
  { label: "Mental Aman", value: "mental aman? dompet aman? hati aman? tidak ada yang aman." },
  { label: "Aura Maghrib", value: "aura maghrib, tapi maghrib di mekkah. menyala abangkuh 🔥" },
  { label: "Menyala Abangkuh", value: "ilmu padi abangkuh 🌾, tetap menyala walau redup." },
  { label: "Gwenchana", value: "gwenchana... gwenchana... teng neng neng neng neng (sakit banget anj*r)." },
  { label: "Minimal Mandi", value: "minimal mandi dulu lah, baru ngomongin orang." },
  { label: "Agak Laen", value: "agak laen emang kau ini, disuruh ke kanan malah ke masa lalu." },
  { label: "Info Mazzeh", value: "info mazzeh, acara hari ini dibatalkan karena admin mau tidur." },
  { label: "Mending Rakit PC", value: "daripada beli motor mending rakit pc, bisa buat render masa depan." },
  { label: "Tobrut", value: "tobrut: tokoh buruh rakyat tertindas ✊" },
];

const FONTS = ['Inter', 'Poppins', 'Times New Roman', 'Comic Neue', 'Arial', 'Oswald', 'Playfair Display', 'Permanent Marker'];

const App: React.FC = () => {
  const [text, setText] = useState<string>("ikan hiu ikan kakap, hei you can i get your pap?");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    fontFamily: 'Arial',
    fontWeight: 'normal',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    backgroundImage: null,
    sticker: null
  });

  // V2 States
  const [isWeirdMode, setIsWeirdMode] = useState(false);
  const [weirdnessLevel, setWeirdnessLevel] = useState(3);
  const [randomSeed, setRandomSeed] = useState(0);
  const [isSeriousMode, setIsSeriousMode] = useState(false);
  const [blurLevel, setBlurLevel] = useState(0);

  const canvasRef = useRef<CanvasRefHandle>(null);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleBikinAneh = () => {
    setIsWeirdMode(true);
    setIsSeriousMode(false); // Disable serious mode
    setRandomSeed(Date.now()); // Re-roll random
  };

  const handleReset = () => {
    setIsWeirdMode(false);
    setWeirdnessLevel(3);
  };

  const handleRandomFont = () => {
    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
    updateSettings({ fontFamily: randomFont });
  };

  const handleSeriousModeToggle = () => {
    const newVal = !isSeriousMode;
    setIsSeriousMode(newVal);
    if (newVal) {
      setIsWeirdMode(false); // Disable weird mode if serious
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-gray-200 transition-colors duration-500 ${isSeriousMode ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-900'}`}>
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header */}
        <header className="text-center mb-12 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-xl transform transition-all duration-500 ${isSeriousMode ? 'bg-gray-800 rotate-0' : 'bg-black -rotate-3'}`}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
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
            {isSeriousMode ? "Generator tipografi yang menjunjung tinggi etika visual." : "Buat meme teks viral kotak persegi dengan format teks otomatis."}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Input & Controls */}
          <section className="flex flex-col gap-6 order-2 lg:order-1 relative">
            
            {/* V2 Top Controls */}
            <div className="flex gap-2">
              <select 
                onChange={(e) => setText(e.target.value)} 
                className="flex-1 p-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-black outline-none"
              >
                {TEMPLATES.map(t => (
                   <option key={t.label} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button 
                onClick={handleRandomFont}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all active:scale-95"
                title="Ganti font acak"
              >
                🎲 Font
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative z-10">
              <label htmlFor="text-input" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider flex justify-between">
                <span>Tulis Teks Disini</span>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-400">Mode Serius</span>
                   <button 
                     onClick={handleSeriousModeToggle}
                     className={`w-10 h-6 rounded-full p-1 transition-colors ${isSeriousMode ? 'bg-black' : 'bg-gray-200'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isSeriousMode ? 'translate-x-4' : 'translate-x-0'}`} />
                   </button>
                </div>
              </label>
              <textarea
                id="text-input"
                className={`w-full h-48 p-4 text-lg border rounded-xl focus:ring-2 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-300 ${isSeriousMode ? 'bg-gray-50 font-serif border-gray-300 focus:ring-gray-600' : 'bg-gray-50 font-sans border-gray-200 focus:ring-black'}`}
                placeholder={isSeriousMode ? "Silakan sampaikan pemikiran Anda..." : "Ketik sesuatu yang ikonik..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* Features Row */}
            <div className="bg-gray-100 p-4 rounded-2xl flex flex-col gap-4">
               {/* Weird Mode & Blur Controls */}
               <div className="flex gap-3 items-center">
                  {isWeirdMode ? (
                    <div className="flex flex-1 gap-2">
                        <button
                            onClick={handleBikinAneh}
                            className="flex-1 py-3 px-2 rounded-xl font-bold bg-purple-600 text-white shadow-purple-200 shadow-lg transition-all active:scale-95 whitespace-nowrap text-sm flex items-center justify-center gap-1"
                        >
                             🤪 <span className="hidden sm:inline">Acak Lagi</span><span className="sm:hidden">Acak</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-3 rounded-xl font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 whitespace-nowrap text-sm flex items-center justify-center"
                            title="Reset ke Normal"
                        >
                            🔄
                        </button>
                    </div>
                  ) : (
                      <button
                        onClick={handleBikinAneh}
                        disabled={isSeriousMode}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap ${
                          isSeriousMode 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                        }`}
                      >
                        ✨ Bikin Aneh
                      </button>
                  )}

                  <div className={`flex items-center gap-2 bg-white px-3 py-3 rounded-xl border border-gray-200 flex-1 ${isSeriousMode ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="text-xs font-bold text-gray-500">Blur</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="6" 
                      step="0.5"
                      value={blurLevel}
                      onChange={(e) => setBlurLevel(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
               </div>
               
               {/* Weirdness Slider - Only visible if Weird Mode is Active */}
               <div className={`overflow-hidden transition-all duration-300 ${isWeirdMode ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                 <div className="flex items-center gap-4 bg-purple-50 p-3 rounded-xl border border-purple-100">
                   <span className="text-xs font-bold text-purple-700 whitespace-nowrap">Level Aneh: {weirdnessLevel}</span>
                   <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={weirdnessLevel}
                      onChange={(e) => {
                        setWeirdnessLevel(Number(e.target.value));
                        setRandomSeed(Date.now()); // Re-randomize on slide
                      }}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                   />
                 </div>
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
                 <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border shadow-sm transition-colors ${
                    isSeriousMode 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : isWeirdMode 
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-white text-gray-400 border-gray-200'
                 }`}>
                    {isSeriousMode ? "PRATINJAU RESMI" : isWeirdMode ? "MODE ANEH AKTIF" : "PRATINJAU"}
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
                  fontWeight={settings.fontWeight}
                  backgroundColor={settings.backgroundColor}
                  textColor={settings.textColor}
                  backgroundImage={settings.backgroundImage}
                  isWeirdMode={isWeirdMode}
                  weirdnessLevel={weirdnessLevel}
                  randomSeed={randomSeed}
                  isSeriousMode={isSeriousMode}
                  sticker={settings.sticker}
                  blurLevel={blurLevel}
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
        <p>KotakKata &copy; {new Date().getFullYear()} By Adam Ibnu - {isSeriousMode ? "Diproses secara etis." : "Render Lokal, Tanpa Server."}</p>
      </footer>
    </div>
  );
};

export default App;