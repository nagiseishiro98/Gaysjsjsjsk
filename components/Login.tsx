import React, { useState } from 'react';
import { Lock, ArrowRight, Cpu, ShieldCheck, User } from 'lucide-react';

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
        setError('ACCESS DENIED');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden p-4">
      {/* Simple Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-rog-red opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-rog-red/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md p-1">
         <div className="bg-[#0e0e10] border border-gray-800 relative p-6 md:p-10 shadow-2xl clip-angle">
             
             {/* Header */}
             <div className="flex flex-col items-center mb-8 md:mb-12">
                <div className="bg-rog-red/10 p-3 md:p-4 rounded-full border border-rog-red/20 mb-4">
                    <Cpu className="w-8 h-8 md:w-10 md:h-10 text-rog-red" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter leading-none mb-1">
                    ROG<span className="text-rog-red">ADMIN</span>
                </h1>
                <div className="text-gray-500 text-[10px] md:text-xs font-mono tracking-[0.4em] uppercase">
                    Secure Access Portal
                </div>
             </div>

             <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
               <div className="space-y-2">
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <User className="w-4 h-4 text-gray-600 group-focus-within:text-rog-red transition-colors" />
                   </div>
                   <input 
                     type="text" 
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full bg-[#151518] text-white py-3 pl-10 pr-4 border border-gray-800 focus:border-rog-red outline-none transition-all font-mono text-sm placeholder-gray-600 hover:border-gray-700"
                     placeholder="OPERATOR ID"
                     autoComplete="off"
                   />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Lock className="w-4 h-4 text-gray-600 group-focus-within:text-rog-red transition-colors" />
                   </div>
                   <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-[#151518] text-white py-3 pl-10 pr-4 border border-gray-800 focus:border-rog-red outline-none transition-all font-mono text-sm placeholder-gray-600 hover:border-gray-700"
                     placeholder="ACCESS CODE"
                   />
                 </div>
               </div>

               {error && (
                   <div className="text-xs text-rog-red text-center font-mono py-2 border-t border-b border-rog-red/20 bg-rog-red/5">
                       [ ! ] {error}
                   </div>
               )}

               <button
                   type="submit"
                   disabled={isLoading}
                   className="w-full mt-6 bg-rog-red hover:bg-red-600 text-white font-bold py-3 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group clip-angle-top active:scale-[0.98]"
               >
                   <span>{isLoading ? 'Verifying...' : 'Initialize System'}</span>
                   {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
               </button>
             </form>

             {/* Footer */}
             <div className="mt-8 md:mt-10 flex justify-center items-center gap-2 opacity-30 hover:opacity-60 transition-opacity">
                 <ShieldCheck className="w-3 h-3 text-gray-400" />
                 <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                     ENCRYPTED CONNECTION // V.2.5
                 </span>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Login;