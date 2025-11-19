import React, { useState } from 'react';
import { Check, Copy, Play, Terminal } from 'lucide-react';
import { generatePythonCode } from '../services/geminiService';

const PythonIntegration: React.FC = () => {
  const [code, setCode] = useState<string>(`# WAITING FOR COMMAND...\n# SELECT SECURITY PROTOCOL TO BEGIN.`);
  const [isLoading, setIsLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState('Standard');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setCode("# INITIATING AI PROTOCOL...\n# GENERATING SECURE BOOTLOADER...");
    try {
      const generated = await generatePythonCode(securityLevel);
      setCode(generated);
    } catch (e) {
      setCode("# SYSTEM ERROR: CONNECTION REFUSED.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full md:p-8 p-4 animate-slide-in">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6 bg-rog-panel p-6 border border-gray-800 clip-rog-inv">
        <div>
           <h2 className="text-xl font-bold uppercase italic tracking-wider text-white flex items-center gap-2">
               <Terminal className="w-5 h-5 text-rog-red" />
               Loader Generation
           </h2>
           <p className="text-xs text-gray-500 mt-1 font-mono">GENERATE PYTHON 3.X COMPATIBLE CLIENT SCRIPTS</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex bg-black p-1 border border-gray-800">
              {['Standard', 'High'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSecurityLevel(level)}
                    className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        securityLevel === level 
                        ? 'bg-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.3)]' 
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
              ))}
           </div>
           
           <button
             onClick={handleGenerate}
             disabled={isLoading}
             className="bg-white text-black px-6 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 disabled:opacity-50 clip-rog transition-transform active:scale-95"
           >
             {isLoading ? 'PROCESSING...' : <><Play className="w-4 h-4 fill-current" /> EXECUTE</>}
           </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 bg-black border border-gray-800 relative flex flex-col shadow-2xl font-mono">
         {/* Terminal Header */}
         <div className="flex items-center justify-between px-4 py-2 bg-rog-dark border-b border-gray-800">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-500 tracking-widest uppercase">client_loader.py</span>
            <button 
                onClick={handleCopy}
                className="text-xs text-rog-accent hover:text-white flex items-center gap-2 uppercase font-bold"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'BUFFER COPIED' : 'COPY BUFFER'}
            </button>
         </div>
         
         {/* Code Area */}
         <div className="flex-1 overflow-auto p-6 relative">
            {/* Matrix Rain Effect Overlay (Subtle) */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>
            
            <pre className="relative z-10 text-sm text-gray-300 leading-relaxed selection:bg-rog-red selection:text-white">
                <code>{code}</code>
            </pre>
         </div>
      </div>
    </div>
  );
};

export default PythonIntegration;