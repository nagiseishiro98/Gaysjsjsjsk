import React, { useState } from 'react';
import { Lock, ArrowRight, Cpu, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLogin();
      } else {
        setError('INVALID_CREDENTIALS');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden perspective-[1500px]">
      {/* Subtle Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rog-red/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* 3D Floating Monolith Card */}
      <div className="w-full max-w-sm relative z-10 group">
         
         {/* Main Card Body */}
         <div className="bg-[#0e0e10] border-l-4 border-rog-red p-10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2 hover:translate-z-4 relative overflow-hidden">
             
             {/* Top Accent Bar */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rog-red via-transparent to-transparent"></div>

             {/* Header */}
             <div className="mb-10 relative">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-rog-red p-1.5 rounded-sm shadow-[0_0_15px_#ff003c]">
                        <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-black italic text-white tracking-tighter leading-none">
                        ROG<span className="text-rog-red">ADMIN</span>
                    </h1>
                </div>
                <div className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold ml-1">
                    System Security Core
                </div>
             </div>

             <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-1 group/input">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] text-rog-red font-bold uppercase tracking-widest">Operator ID</label>
                    <span className="text-[10px] text-gray-700 font-mono opacity-0 group-focus-within/input:opacity-100 transition-opacity">USR_ID</span>
                 </div>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full bg-[#151518] text-white p-3 border-b-2 border-gray-800 focus:border-rog-red outline-none transition-all font-mono text-sm placeholder-gray-700"
                   placeholder="ENTER USERNAME"
                   autoComplete="off"
                 />
               </div>
               
               <div className="space-y-1 group/input">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] text-rog-red font-bold uppercase tracking-widest">Access Code</label>
                    <Lock className="w-3 h-3 text-gray-700 group-focus-within/input:text-white transition-colors" />
                 </div>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-[#151518] text-white p-3 border-b-2 border-gray-800 focus:border-rog-red outline-none transition-all font-mono text-sm placeholder-gray-700"
                   placeholder="ENTER PASSWORD"
                 />
               </div>

               {error && (
                   <div className="text-xs text-rog-red text-center font-mono animate-pulse py-2 bg-rog-red/5 border border-rog-red/10">
                       [ ! ] {error}
                   </div>
               )}

               <button
                   type="submit"
                   disabled={isLoading}
                   className="w-full mt-4 bg-white text-black hover:bg-rog-red hover:text-white font-black italic text-lg py-4 uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(255,0,60,0.4)] flex items-center justify-center gap-3 group/btn"
               >
                   <span className="relative z-10">
                       {isLoading ? 'Verifying...' : 'Authenticate'} 
                   </span>
                   {!isLoading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
               </button>
             </form>

             {/* Footer Status */}
             <div className="mt-8 pt-6 border-t border-gray-900 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-ping' : 'bg-rog-red'}`}></div>
                     <span className="text-[10px] text-gray-600 font-mono tracking-wider">
                         {isLoading ? 'UPLINK_ESTABLISHED' : 'SERVER_LOCKED'}
                     </span>
                 </div>
                 <ShieldCheck className="w-4 h-4 text-gray-800" />
             </div>
         </div>
      </div>
      
      <div className="absolute bottom-8 text-center w-full text-gray-700 text-[10px] font-mono tracking-[0.2em] opacity-40">
          SECURE PROTOCOL V.2.4 // UNAUTHORIZED ACCESS IS PROHIBITED
      </div>
    </div>
  );
};

export default Login;