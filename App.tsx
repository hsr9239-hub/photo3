
import React, { useState, useRef } from 'react';
import { transformToResumePhoto } from './services/gemini';
import { AppState, ProcessingResult } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewUrl(base64);
      setResult(null);
      setState(AppState.IDLE);
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = async () => {
    if (!previewUrl) return;

    setState(AppState.PROCESSING);
    setErrorMessage(null);

    try {
      const mimeType = previewUrl.split(';')[0].split(':')[1];
      const transformed = await transformToResumePhoto(previewUrl, mimeType);
      
      setResult({
        originalUrl: previewUrl,
        transformedUrl: transformed,
        timestamp: Date.now()
      });
      setState(AppState.COMPLETED);
    } catch (error: any) {
      setErrorMessage("Transformation failed. Let's try once more.");
      setState(AppState.ERROR);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.transformedUrl;
    link.download = `startup_profile_${result.timestamp}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full h-14 border-b border-zinc-100 bg-white/80 backdrop-blur-md z-50 flex items-center justify-between px-4">
        <div className="text-xl font-bold tracking-tighter italic">Studio.ai</div>
        <div className="flex gap-4 items-center">
          <i className="fa-regular fa-heart text-xl"></i>
          <i className="fa-regular fa-paper-plane text-xl"></i>
        </div>
      </nav>

      <main className="pt-20 pb-24 max-w-md mx-auto">
        {/* Stories Suggestion (Tips) */}
        <div className="flex overflow-x-auto gap-4 px-4 mb-8 no-scrollbar">
          {[
            { icon: 'fa-lightbulb', label: 'Tips' },
            { icon: 'fa-user-tie', label: 'Office' },
            { icon: 'fa-camera', label: 'Lighting' },
            { icon: 'fa-star', label: 'Pro' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-zinc-100 p-0.5 mb-1 flex items-center justify-center bg-zinc-50">
                <div className="w-full h-full rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                  <i className={`fa-solid ${item.icon} text-zinc-400`}></i>
                </div>
              </div>
              <span className="text-[10px] font-medium text-zinc-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main Feed Card */}
        <div className="bg-white border border-zinc-100 mb-6">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5">
                  <div className="w-full h-full rounded-full bg-zinc-200 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="avatar" />
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold">your_startup_look</span>
            </div>
            <i className="fa-solid fa-ellipsis text-zinc-400"></i>
          </div>

          {/* Image Display Area */}
          <div className="aspect-square bg-zinc-50 relative flex items-center justify-center overflow-hidden">
            {!previewUrl && !result && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 group transition-all"
              >
                <div className="w-16 h-16 rounded-full border border-zinc-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-plus text-2xl text-zinc-300"></i>
                </div>
                <span className="text-sm font-medium text-zinc-400">Upload Photo</span>
              </button>
            )}

            {previewUrl && !result && state !== AppState.PROCESSING && (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            )}

            {state === AppState.PROCESSING && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Designing your vibe...</p>
              </div>
            )}

            {result && (
              <img src={result.transformedUrl} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Result" />
            )}
          </div>

          {/* Action Bar */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex gap-4">
              <i className="fa-regular fa-heart text-2xl"></i>
              <i className="fa-regular fa-comment text-2xl"></i>
              <i className="fa-regular fa-paper-plane text-2xl"></i>
            </div>
            {result && (
              <button onClick={downloadImage}>
                <i className="fa-solid fa-download text-2xl text-black"></i>
              </button>
            )}
          </div>

          <div className="px-3 pb-4">
            <p className="text-sm">
              <span className="font-bold mr-2">your_startup_look</span>
              {result ? "Just got the dream IT profile photo! 🚀 #startup #ai #career" : "Upload your photo to start transformation."}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-4 mt-6">
          {previewUrl && !result && state !== AppState.PROCESSING && (
            <button 
              onClick={handleTransform}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm tracking-tight active:scale-95 transition-transform"
            >
              Generate IT Startup Look
            </button>
          )}
          
          {result && (
            <button 
              onClick={() => {
                setResult(null);
                setPreviewUrl(null);
                setState(AppState.IDLE);
              }}
              className="w-full border border-zinc-200 text-black py-4 rounded-xl font-bold text-sm tracking-tight hover:bg-zinc-50 transition-colors"
            >
              Transform Another One
            </button>
          )}

          {state === AppState.ERROR && (
            <p className="text-red-500 text-center text-xs mt-2 font-medium">{errorMessage}</p>
          )}
        </div>
      </main>

      {/* Bottom Bar Icons */}
      <div className="fixed bottom-0 w-full h-16 bg-white border-t border-zinc-100 flex items-center justify-around px-4">
        <i className="fa-solid fa-house text-xl"></i>
        <i className="fa-solid fa-magnifying-glass text-xl opacity-30"></i>
        <button onClick={() => fileInputRef.current?.click()} className="text-2xl">
          <i className="fa-regular fa-square-plus"></i>
        </button>
        <i className="fa-solid fa-clapperboard text-xl opacity-30"></i>
        <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="profile" />
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default App;
