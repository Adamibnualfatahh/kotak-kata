import React, { useRef } from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdate({ backgroundImage: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onUpdate({ backgroundImage: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const stickers = ["🐸", "😐", "😭", "🗿", "🫵", "🔥", "🤡", "💅"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Pengaturan Tampilan</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Sticker Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Stiker Mini</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onUpdate({ sticker: null })}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border text-sm transition-all ${
                  settings.sticker === null
                    ? 'border-red-500 bg-red-50 text-red-500 font-bold' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                🚫
              </button>
              {stickers.map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate({ sticker: s })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border text-xl transition-all ${
                    settings.sticker === s 
                      ? 'border-black bg-black text-white ring-2 ring-black ring-offset-2' 
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Font Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Jenis Font</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Klasik', value: 'Arial' },
                { name: 'Inter', value: 'Inter' },
                { name: 'Serif', value: 'Merriweather' },
                { name: 'Mono', value: 'Space Mono' },
                { name: 'Comic', value: 'Comic Sans MS' },
                { name: 'Impact', value: 'Impact' },
                { name: 'Poppins', value: 'Poppins' },
                { name: 'C. Neue', value: 'Comic Neue' },
              ].map((font) => (
                <button
                  key={font.value}
                  onClick={() => onUpdate({ fontFamily: font.value })}
                  className={`py-3 px-4 rounded-xl border text-sm transition-all ${
                    settings.fontFamily === font.value 
                      ? 'border-black bg-black text-white ring-2 ring-black ring-offset-2' 
                      : 'border-gray-200 hover:border-gray-400 text-gray-700 bg-white'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Color Selection */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Warna Latar</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={settings.backgroundColor}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value, backgroundImage: null })}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent p-0 overflow-hidden shadow-sm ring-1 ring-gray-200"
                />
                <span className="text-xs font-mono text-gray-500 uppercase">{settings.backgroundColor}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Warna Teks</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={settings.textColor}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent p-0 overflow-hidden shadow-sm ring-1 ring-gray-200"
                />
                <span className="text-xs font-mono text-gray-500 uppercase">{settings.textColor}</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Background Image */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Gambar Latar (Opsional)</label>
            
            {!settings.backgroundImage ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="block text-gray-500 text-sm">Klik untuk upload gambar</span>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video group">
                 <img src={settings.backgroundImage} alt="Background Preview" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold"
                    >
                      Ganti
                    </button>
                    <button 
                      onClick={removeImage}
                      className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                    >
                      Hapus
                    </button>
                 </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={onClose}
            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
