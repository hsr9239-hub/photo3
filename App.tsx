
import React, { useState, useRef } from 'react';
import { transformToResumePhoto } from './gemini';
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
      setErrorMessage(null);
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
      console.error(error);
      setErrorMessage("Something went wrong. Let's try once more.");
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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-20">
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full h-14 border-b border-zinc-100 bg-white/90 backdrop-blur-md z-50 flex items-center justify-between px-4">
        <div className="text-xl font-black tracking-tighter italic">STUDIO.AI</div>
        <div className="flex gap-5 items-center">
          <i className="fa-regular fa-heart text-2xl"></i>
          <i className="fa-regular fa-paper-plane text-2xl"></i>
        </div>
      </nav>

      <main className="pt-20 max-w-lg mx-auto">
        {/* Story Highlights (Tips) */}
        <div className="flex overflow-x-auto gap-4 px-4 mb-8 no-scrollbar">
          {[
            { icon: 'fa-user-tie', label: 'Casual', color: 'from-amber-200 to-orange-400' },
            { icon: 'fa-building', label: 'Office', color: 'from-blue-200 to-indigo-400' },
            { icon: 'fa-bolt', label: 'Fast', color: 'from-yellow-200 to-yellow-500' },
            { icon: 'fa-circle-check', label: 'Verified', color: 'from-green-200 to-emerald-400' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center flex-shrink-0">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${item.color} p-[2px] mb-1`}>
                <div className="w-full h-full rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                      <i className={`fa-solid ${item.icon} text-zinc-400 text-lg`}></i>
                   </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-zinc-500 tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Post Card */}
        <div className="bg-white border border-zinc-100 sm:rounded-md overflow-hidden shadow-sm">
          {/* Post Header */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-white p-[1px]">
                  <img src="https://api.dicebear.com/7.x/micah/svg?seed=Startup" alt="Avatar" className="w-full h-full rounded-full bg-zinc-100" />
                </div>
              </div>
              <span className="text-sm font-bold tracking-tight">your_startup_profile</span>
            </div>
            <i className="fa-solid fa-ellipsis text-zinc-400"></i>
          </div>

          {/* Media Area */}
          <div className="aspect-square bg-zinc-50 relative flex items-center justify-center overflow-hidden border-y border-zinc-50">
            {!previewUrl && !result && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full border border-zinc-200 flex items-center justify-center bg-white shadow-sm">
                  <i className="fa-solid fa-plus text-xl text-zinc-400"></i>
                </div>
                <span className="text-sm font-semibold text-zinc-400 tracking-tight">Tap to Upload</span>
              </button>
            )}

            {previewUrl && !result && state !== AppState.PROCESSING && (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            )}

            {state === AppState.PROCESSING && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-10 px-10 text-center">
                <div className="w-10 h-10 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black tracking-widest uppercase text-black">Designing your startup vibe...</p>
              </div>
            )}

            {result && (
              <img src={result.transformedUrl} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Generated" />
            )}
          </div>

          {/* Post Footer / Actions */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex gap-4">
              <i className="fa-regular fa-heart text-2xl hover:text-red-500 cursor-pointer transition-colors"></i>
              <i className="fa-regular fa-comment text-2xl"></i>
              <i className="fa-regular fa-paper-plane text-2xl"></i>
            </div>
            {result && (
              <button onClick={downloadImage} className="hover:scale-110 transition-transform active:scale-90">
                <i className="fa-solid fa-arrow-down-to-bracket text-2xl"></i>
              </button>
            )}
          </div>

          {/* Captions */}
          <div className="px-3 pb-4 space-y-1">
            <p className="text-sm">
              <span className="font-bold mr-2">your_startup_profile</span>
              {result ? "Finally got that IT startup look! Face kept perfectly. 🚀✨" : "Ready to upgrade your profile? Just upload and tap generate."}
            </p>
            <p className="text-[11px] text-zinc-400 uppercase font-medium">Just now</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="px-4 mt-6">
          {previewUrl && !result && state !== AppState.PROCESSING && (
            <button 
              onClick={handleTransform}
              className="w-full bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg shadow-zinc-200"
            >
              Generate IT Look
            </button>
          )}
          
          {result && (
            <button 
              onClick={() => {
                setResult(null);
                setPreviewUrl(null);
                setState(AppState.IDLE);
              }}
              className="w-full border border-zinc-200 text-black py-4 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors"
            >
              New Transformation
            </button>
          )}

          {state === AppState.ERROR && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 text-center">
              <p className="text-red-600 text-xs font-bold">{errorMessage}</p>
              <button onClick={handleTransform} className="text-[10px] mt-2 underline font-bold uppercase tracking-tighter">Retry</button>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Bottom Bar */}
      <div className="fixed bottom-0 w-full h-16 bg-white border-t border-zinc-100 flex items-center justify-around px-4 z-50">
        <i className="fa-solid fa-house text-xl"></i>
        <i className="fa-solid fa-magnifying-glass text-xl opacity-30"></i>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="text-2xl hover:scale-110 transition-transform active:scale-90"
        >
          <i className="fa-regular fa-square-plus"></i>
        </button>
        <i className="fa-solid fa-clapperboard text-xl opacity-30"></i>
        <div className="w-7 h-7 rounded-full bg-zinc-200 border border-zinc-100 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/micah/svg?seed=Startup" alt="user" />
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
