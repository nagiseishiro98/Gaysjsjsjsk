import React, { useState } from 'react';
import { Lock, ArrowRight, Cpu, ShieldCheck, User, AlertTriangle } from 'lucide-react';
import { loginUser } from '../services/mockDb';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await loginUser(email, password);
      if (onLogin) onLogin();
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email') {
        setError('INVALID CREDENTIALS');
      } else if (err.message && err.message.includes("Firebase not initialized")) {
        setError('DATABASE ERROR: CONFIG MISSING');
      } else if (err.code === 'auth/network-request-failed') {
        setError('NETWORK ERROR: OFFLINE');
      } else {
        setError(`CONN_ERR: ${err.code || 'UNKNOWN'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden p-4 perspective-1000">
      {/* Simple Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-rog-red opacity-50"></div>
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-rog-red/5 blur-[100px] rounded-full pointer-events-none"
      ></motion.div>
      
      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        whileHover={{ rotateX: 2, rotateY: 2, scale: 1.01 }}
        className="relative z-10 w-full max-w-md p-1"
      >
         <div className="bg-[#0e0e10] border border-gray-800 relative p-6 md:p-10 shadow-2xl clip-angle hover:shadow-[0_0_30px_rgba(255,0,60,0.15)] transition-shadow duration-500">
             
             {/* Header */}
             <div className="flex flex-col items-center mb-8 md:mb-12">
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                  className="bg-rog-red/10 p-3 md:p-4 rounded-full border border-rog-red/20 mb-4 relative group"
                >
                    <div className="absolute inset-0 rounded-full bg-rog-red opacity-20 group-hover:animate-ping"></div>
                    <Cpu className="w-8 h-8 md:w-10 md:h-10 text-rog-red relative z-10" />
                </motion.div>
                <motion.h1 
                   initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                   className="text-3xl md:text-4xl font-black italic text-white tracking-tighter leading-none mb-1"
                >
                    ROG<span className="text-rog-red">ADMIN</span>
                </motion.h1>
                <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                   className="text-gray-500 text-[10px] md:text-xs font-mono tracking-[0.4em] uppercase"
                >
                    Secure Database Access
                </motion.div>
             </div>

             <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
               <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <User className="w-4 h-4 text-gray-600 group-focus-within:text-rog-red transition-colors" />
                   </div>
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-[#151518] text-white py-3 pl-10 pr-4 border border-gray-800 focus:border-rog-red outline-none transition-all font-mono text-sm placeholder-gray-600 hover:border-gray-700 focus:shadow-[0_0_15px_rgba(255,0,60,0.1)]"
                     placeholder="ADMIN EMAIL"
                     autoComplete="email"
                     required
                   />
                 </div>
               </motion.div>
               
               <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="space-y-2">
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Lock className="w-4 h-4 text-gray-600 group-focus-within:text-rog-red transition-colors" />
                   </div>
                   <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-[#151518] text-white py-3 pl-10 pr-4 border border-gray-800 focus:border-rog-red outline-none transition-all font-mono text-sm placeholder-gray-600 hover:border-gray-700 focus:shadow-[0_0_15px_rgba(255,0,60,0.1)]"
                     placeholder="DATABASE PASSWORD"
                     required
                   />
                 </div>
               </motion.div>

               {error && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-rog-red text-center font-mono py-2 border-t border-b border-rog-red/20 bg-rog-red/5 flex items-center justify-center gap-2">
                       <AlertTriangle className="w-3 h-3" /> {error}
                   </motion.div>
               )}

               <motion.button
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                   type="submit"
                   disabled={isLoading}
                   className="w-full mt-6 bg-rog-red hover:bg-red-600 text-white font-bold py-3 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group clip-angle-top active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(255,0,60,0.3)] hover:shadow-[0_0_20px_rgba(255,0,60,0.6)]"
               >
                   <span>{isLoading ? 'Authenticating...' : 'Connect DB'}</span>
                   {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
               </motion.button>
             </form>

             {/* Footer */}
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 md:mt-10 flex justify-center items-center gap-2 opacity-30 hover:opacity-60 transition-opacity">
                 <ShieldCheck className="w-3 h-3 text-gray-400" />
                 <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                     FIREBASE ENCRYPTED // V.3.0
                 </span>
             </motion.div>
         </div>
      </motion.div>
    </div>
  );
};

export default Login;