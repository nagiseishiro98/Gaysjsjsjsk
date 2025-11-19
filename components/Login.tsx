import React, { useState } from 'react';
import { Disc, Lock, ArrowRight } from 'lucide-react';

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
        setError('ACCESS DENIED // INVALID CREDENTIALS');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-rog-black bg-hex-pattern relative overflow-hidden">
      {/* Ambient Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rog-red/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 p-1">
         {/* Decorative Cyber Borders */}
         <div className="absolute -top-2 -left-2 w-16 h-16 border-l-4 border-t-4 border-rog-red rounded-tl-none"></div>
         <div className="absolute -bottom-2 -right-2 w-16 h-16 border-r-4 border-b-4 border-rog-red rounded-br-none"></div>

         <div className="bg-rog-dark/90 backdrop-blur-xl border border-rog-red/30 p-10 clip-rog relative shadow-[0_0_50px_-10px_rgba(255,0,60,0.2)]">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rog-red to-transparent animate-scan"></div>
             
             <div className="text-center mb-12">
                <h1 className="text-5xl font-black italic text-white tracking-tighter mb-2 flex justify-center items-center gap-3">
                    <Disc className="w-8 h-8 text-rog-red animate-spin-slow" />
                    ROG
                </h1>
                <div className="text-rog-red uppercase tracking-[0.4em] text-xs font-bold">Security Access Protocol</div>
             </div>

             <form onSubmit={handleLogin} className="space-y-6 relative">
               <div className="space-y-2">
                 <label className="text-xs text-rog-red font-bold uppercase tracking-wider ml-1">Identity</label>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full bg-black/50 border border-gray-800 text-white p-4 focus:border-rog-red focus:shadow-[0_0_15px_rgba(255,0,60,0.3)] outline-none transition-all font-mono clip-rog-inv"
                   placeholder="USERNAME"
                   autoComplete="off"
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs text-rog-red font-bold uppercase tracking-wider ml-1">Passcode</label>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-black/50 border border-gray-800 text-white p-4 focus:border-rog-red focus:shadow-[0_0_15px_rgba(255,0,60,0.3)] outline-none transition-all font-mono clip-rog-inv"
                   placeholder="••••••••"
                 />
               </div>

               {error && (
                   <div className="text-xs text-rog-red text-center border border-rog-red/50 p-3 bg-rog-red/10 font-mono animate-pulse">
                       [!] {error}
                   </div>
               )}

               <button
                   type="submit"
                   disabled={isLoading}
                   className="w-full mt-6 bg-rog-red text-white font-black italic text-xl py-5 uppercase tracking-widest hover:bg-red-600 hover:shadow-[0_0_20px_rgba(255,0,60,0.6)] transition-all active:scale-95 clip-rog relative overflow-hidden group disabled:grayscale"
               >
                   <span className="relative z-10 flex items-center justify-center gap-3">
                       {isLoading ? 'Authenticating...' : 'Initialize'} 
                       {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                   </span>
                   {/* Button Glint */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_0.5s_ease-in-out]"></div>
               </button>
             </form>
         </div>
      </div>
      
      <div className="absolute bottom-8 text-center w-full text-gray-600 text-xs font-mono">
          SECURE CONNECTION // ENCRYPTED 256-BIT
      </div>
    </div>
  );
};

export default Login;