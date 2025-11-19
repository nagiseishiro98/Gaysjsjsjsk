import React, { useState } from 'react';
import { Code, Terminal, Shield, Cpu, Copy, Check, Loader2 } from 'lucide-react';
import { generatePythonCode } from '../services/geminiService';

const PythonIntegration: React.FC = () => {
  const [code, setCode] = useState<string>(`# SYSTEM READY.\n# INITIALIZE GENERATION SEQUENCE FOR CUSTOM CLIENT SCRIPT...`);
  const [isLoading, setIsLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState('Standard');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generated = await generatePythonCode(securityLevel);
      setCode(generated);
    } catch (e) {
      setCode("# ERROR: API LINK FAILURE. CHECK CONFIGURATION.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
       const textArea = document.createElement("textarea");
       textArea.value = code;
       document.body.appendChild(textArea);
       textArea.select();
       document.execCommand('copy');
       document.body.removeChild(textArea);
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-black border border-gray-900 p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rog-red to-transparent"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 tracking-widest uppercase">
              <Terminal className="w-6 h-6 text-rog-red" />
              CLIENT_INTEGRATION
            </h2>
            <p className="text-gray-500 text-sm font-mono mt-1">
              // GENERATE SECURE PYTHON CLIENT_SIDE VALIDATION LOGIC
            </p>
          </div>
          <div className="flex items-center gap-1 bg-gray-900 p-1 border border-gray-800">
            {['Standard', 'High'].map((level) => (
               <button
                 key={level}
                 onClick={() => setSecurityLevel(level)}
                 className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${securityLevel === level ? 'bg-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' : 'text-gray-500 hover:text-white'}`}
               >
                 {level}
               </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
             <div className="bg-gray-900/30 border border-gray-800 p-4 relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-gray-700"></div>
               <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                 <Cpu className="w-4 h-4 text-rog-red" /> Protocol Specs
               </h3>
               <ul className="space-y-4 text-xs font-mono text-gray-400">
                 <li className="flex gap-3">
                   <span className="text-rog-red">[01]</span>
                   HWID EXTRACTION (UUID+MAC)
                 </li>
                 <li className="flex gap-3">
                   <span className="text-rog-red">[02]</span>
                   SERVER HANDSHAKE (POST/JSON)
                 </li>
                 <li className="flex gap-3">
                   <span className="text-rog-red">[03]</span>
                   STRICT BINDING ENFORCEMENT
                 </li>
               </ul>
             </div>

             <button
               onClick={handleGenerate}
               disabled={isLoading}
               className="w-full py-4 bg-white text-black hover:bg-gray-200 font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 text-sm"
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
               {isLoading ? 'COMPUTING...' : 'GENERATE_SOURCE'}
             </button>
          </div>

          {/* Code Editor Panel */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute right-4 top-4 z-10">
              <button 
                onClick={handleCopy}
                className="bg-rog-red hover:bg-red-600 text-white p-2 shadow-lg transition-all"
                title="COPY_BUFFER"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="h-full min-h-[500px] bg-gray-950 border border-gray-800 p-1 overflow-hidden">
               <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-800">
                 <span className="text-xs text-rog-red font-mono uppercase">client_loader.py</span>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-700"></div>
                    <div className="w-2 h-2 bg-gray-700"></div>
                    <div className="w-2 h-2 bg-gray-700"></div>
                 </div>
               </div>
               <div className="p-4 h-[450px] overflow-auto custom-scrollbar">
                 <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                   {code}
                 </pre>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonIntegration;