import React, { useState } from 'react';
import { Lock, User, Cpu } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('ACCESS DENIED (Try admin/admin)');
    }
  };

  return (
    <div className="min-h-screen bg-rog-dark flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rog-red/5 via-transparent to-transparent opacity-20"></div>
      
      <div className="max-w-md w-full bg-rog-panel border border-rog-border p-8 relative z-10 shadow-2xl">
        {/* Decorative corner markers */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-rog-red"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-rog-red"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-rog-red"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-rog-red"></div>

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-rog-red/10 border border-rog-red/50 flex items-center justify-center">
               <Cpu className="w-8 h-8 text-rog-red" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-widest">ROG<span className="text-rog-red">ADMIN</span></h2>
          <div className="flex items-center justify-center gap-2 mt-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <p className="text-xs text-rog-red tracking-widest uppercase">System Offline</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operator ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-rog-red" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-black border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-rog-red focus:ring-1 focus:ring-rog-red transition-all font-mono text-sm"
                placeholder="ENTER USERNAME"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Access Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-rog-red" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-black border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-rog-red focus:ring-1 focus:ring-rog-red transition-all font-mono text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-mono uppercase text-center tracking-wide">
              [!] {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-rog-red hover:bg-red-700 text-white font-bold tracking-widest uppercase transition-all duration-200 shadow-[0_0_15px_rgba(255,0,60,0.3)] hover:shadow-[0_0_25px_rgba(255,0,60,0.5)]"
          >
            Initialize Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;