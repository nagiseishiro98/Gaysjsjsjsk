import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import KeyManager from './components/KeyManager';
import PythonIntegration from './components/PythonIntegration';
import ApiSection from './components/ApiSection';
import { Menu, X, Cpu, LayoutGrid, Code, LogOut, Clock, Server, Activity } from 'lucide-react';
import { subscribeToAuth, logoutUser } from './services/mockDb';
import { AnimatePresence, motion } from 'framer-motion';

// Optimization: Isolated Clock Component prevents main App re-renders
const HeaderClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
     <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500 border-r border-gray-800 pr-4 mr-2">
        <Clock className="w-3 h-3" />
        {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#050505] text-white">
         <div className="flex flex-col items-center gap-4 animate-pulse">
            <Cpu className="w-12 h-12 text-rog-red" />
            <div className="font-mono text-sm tracking-widest text-gray-500">LOADING SYSTEM...</div>
         </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return <Login onLogin={() => {}} />;
  }

  // MAIN APP
  return (
    <div className="min-h-screen w-full bg-[#111] flex items-center justify-center font-sans p-0 md:p-6 overflow-hidden">
      
      {/* RESPONSIVE CONTAINER */}
      <div className="w-full h-[100dvh] md:h-[90vh] md:w-[95vw] md:max-w-7xl bg-[#050505] relative flex flex-col shadow-2xl md:border border-[#333] md:rounded-xl overflow-hidden transition-all duration-300">
      
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-8 border-b border-gray-900 bg-[#0a0a0c] z-50 shrink-0 h-16 md:h-20 relative shadow-md">
           <div className="font-bold text-xl md:text-2xl tracking-widest text-white flex items-center gap-3">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="bg-rog-red/10 p-2 rounded border border-rog-red/30"
              >
                <Cpu className="w-4 h-4 md:w-5 md:h-5 text-rog-red" />
              </motion.div>
              <span className="italic">ROG<span className="text-rog-red">ADMIN</span></span>
           </div>

           {/* Desktop Nav Tabs - Only visible on Large Screens (lg) to prevent overlap on Tablets */}
           <div className="hidden lg:flex items-center gap-1 bg-black/50 p-1 rounded border border-gray-800 absolute left-1/2 -translate-x-1/2 backdrop-blur-sm">
              {[
                { id: 'dashboard', label: 'KEYS', icon: LayoutGrid },
                { id: 'python', label: 'INTEGRATION', icon: Code },
                { id: 'api', label: 'SERVER', icon: Server }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-bold tracking-wider transition-all relative overflow-hidden
                    ${activeTab === item.id ? 'text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="nav-highlight"
                      className="absolute inset-0 bg-rog-red"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex items-center gap-2 z-10">
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </div>
                </button>
              ))}
           </div>

           <div className="flex items-center gap-4">
              <HeaderClock />
              
              <button 
                onClick={handleLogout}
                className="hidden lg:flex text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest items-center gap-2 hover:bg-white/5 p-2 rounded"
              >
                 <LogOut className="w-4 h-4" />
              </button>

              {/* Hamburger - Visible on Mobile AND Tablet (md) now */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="lg:hidden text-white hover:text-rog-red active:scale-90 transition-transform p-2"
              >
                  <Menu className="w-6 h-6" />
              </button>
           </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
        {isMobileMenuOpen && (
           <motion.div 
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-[100] bg-[#050505]/95 backdrop-blur-xl flex flex-col p-6 lg:hidden"
           >
              <div className="flex justify-between items-center mb-8">
                 <div className="font-bold text-lg text-rog-red tracking-widest flex items-center gap-2">
                    <Activity className="w-5 h-5" /> SYSTEM MENU
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-rog-red transition-colors p-2 border border-gray-800 rounded bg-black">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              <nav className="flex flex-col gap-3">
                 {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
                    { id: 'python', label: 'Integration', icon: Code },
                    { id: 'api', label: 'API Access', icon: Server }
                 ].map(item => (
                     <button 
                       key={item.id}
                       onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}} 
                       className={`text-left text-lg uppercase tracking-wider p-4 border-l-4 transition-all flex items-center gap-4 bg-[#0a0a0c] ${activeTab === item.id ? 'border-rog-red text-white shadow-[10px_0_20px_-10px_rgba(255,0,60,0.2)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                     >
                       <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-rog-red' : ''}`} />
                       {item.label}
                     </button>
                 ))}
              </nav>

              <div className="mt-auto w-full">
                  <button onClick={handleLogout} className="w-full py-4 bg-rog-red hover:bg-red-600 text-white font-bold tracking-widest uppercase flex items-center justify-center gap-2 clip-angle-top transition-colors">
                     <LogOut className="w-4 h-4" />
                     Disconnect
                  </button>
                  <div className="text-center mt-4 text-[10px] text-gray-600 font-mono">
                      SECURE CONNECTION ESTABLISHED
                  </div>
              </div>
           </motion.div>
        )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111] via-[#050505] to-[#050505]">
           <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24 md:pb-8">
              <div className="w-full max-w-6xl mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-full"
                    >
                      {activeTab === 'dashboard' && <KeyManager />}
                      {activeTab === 'python' && <PythonIntegration />}
                      {activeTab === 'api' && <ApiSection />}
                    </motion.div>
                  </AnimatePresence>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default App;