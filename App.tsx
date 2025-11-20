import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import KeyManager from './components/KeyManager';
import PythonIntegration from './components/PythonIntegration';
import ApiSection from './components/ApiSection';
import { Menu, X, Cpu, LayoutGrid, Code, LogOut, Clock, Loader2, Server } from 'lucide-react';
import { subscribeToAuth, logoutUser } from './services/mockDb';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state for Auth check
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Subscribe to Firebase Auth state
    const unsubscribe = subscribeToAuth((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    // State update is handled by the subscribeToAuth listener
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-white">
         <div className="flex flex-col items-center gap-4 animate-pulse">
            <Cpu className="w-12 h-12 text-rog-red" />
            <div className="font-mono text-sm tracking-widest text-gray-500">ESTABLISHING SECURE CONNECTION...</div>
         </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => {}} />; // onLogin is now optional as the listener handles state
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050505] text-white overflow-hidden animate-fade-in">
      
      {/* Clean Background: No lines, just deep darkness */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#050505] z-0"></div>
      
      {/* Very subtle ambient lighting */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-rog-red/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Mobile Header (Portrait Only) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-900 bg-[#050505] z-50 relative shrink-0">
         <div className="font-bold text-xl tracking-widest text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-rog-red" />
            ROG<span className="text-rog-red">ADMIN</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-gray-500">
                <Clock className="w-3 h-3" />
                {currentTime.toLocaleTimeString()}
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-rog-red active:scale-90 transition-transform">
                <Menu className="w-6 h-6" />
            </button>
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-8 animate-slide-in">
            <div className="flex justify-between items-center mb-12">
               <div className="font-bold text-xl text-rog-red tracking-widest">SYSTEM MENU</div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-rog-red transition-colors">
                  <X className="w-8 h-8" />
               </button>
            </div>
            
            <nav className="flex flex-col gap-4">
               <button 
                 onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} 
                 className={`text-left text-xl uppercase tracking-wider p-4 border-l-4 transition-all flex items-center gap-3 ${activeTab === 'dashboard' ? 'border-rog-red text-white bg-white/5' : 'border-transparent text-gray-500'}`}
               >
                 <LayoutGrid className="w-5 h-5" />
                 Dashboard
               </button>
               <button 
                 onClick={() => {setActiveTab('python'); setIsMobileMenuOpen(false);}} 
                 className={`text-left text-xl uppercase tracking-wider p-4 border-l-4 transition-all flex items-center gap-3 ${activeTab === 'python' ? 'border-rog-red text-white bg-white/5' : 'border-transparent text-gray-500'}`}
               >
                 <Code className="w-5 h-5" />
                 Integration
               </button>
               <button 
                 onClick={() => {setActiveTab('api'); setIsMobileMenuOpen(false);}} 
                 className={`text-left text-xl uppercase tracking-wider p-4 border-l-4 transition-all flex items-center gap-3 ${activeTab === 'api' ? 'border-rog-red text-white bg-white/5' : 'border-transparent text-gray-500'}`}
               >
                 <Server className="w-5 h-5" />
                 API Access
               </button>
            </nav>

            <div className="mt-auto flex flex-col gap-4">
                <div className="text-center font-mono text-rog-red text-lg tracking-widest">
                    {currentTime.toLocaleTimeString()}
                </div>
                <button onClick={handleLogout} className="py-6 border-t border-gray-800 text-center text-gray-500 hover:text-rog-red tracking-widest uppercase flex items-center justify-center gap-2">
                   <LogOut className="w-5 h-5" />
                   Disconnect Protocol
                </button>
            </div>
         </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 z-20 shrink-0">
            <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                onLogout={handleLogout} 
            />
        </div>

        {/* Main Content */}
        <main className="flex-1 relative flex flex-col min-w-0 h-full">
           <div className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent p-4 md:p-10 custom-scrollbar">
              <div key={activeTab} className="w-full animate-slide-up pb-10">
                  {activeTab === 'dashboard' && <KeyManager />}
                  {activeTab === 'python' && <PythonIntegration />}
                  {activeTab === 'api' && <ApiSection />}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default App;