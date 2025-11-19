import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import KeyManager from './components/KeyManager';
import PythonIntegration from './components/PythonIntegration';
import { Menu, X, Shield, Terminal, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mountAnim, setMountAnim] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('keymaster_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
    setMountAnim(true);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('keymaster_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('keymaster_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`h-screen w-screen flex flex-col bg-rog-black text-white overflow-hidden transition-opacity duration-1000 ${mountAnim ? 'opacity-100' : 'opacity-0'} scanlines`}>
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-grid-pattern bg-grid"></div>
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-rog-border bg-rog-black z-50 relative">
         <div className="font-bold text-xl tracking-widest text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-rog-red" />
            ROG<span className="text-rog-red">ADMIN</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(true)} className="text-rog-red">
            <Menu className="w-6 h-6" />
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-8 animate-slide-in">
            <div className="flex justify-between items-center mb-12">
               <div className="font-bold text-xl text-rog-red tracking-widest">SYSTEM MENU</div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-rog-red transition-colors">
                  <X className="w-8 h-8" />
               </button>
            </div>
            
            <nav className="flex flex-col gap-4">
               <button 
                 onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} 
                 className={`text-left text-xl uppercase tracking-wider p-4 border-l-4 transition-all ${activeTab === 'dashboard' ? 'border-rog-red text-white bg-white/5' : 'border-transparent text-gray-500'}`}
               >
                 Dashboard
               </button>
               <button 
                 onClick={() => {setActiveTab('python'); setIsMobileMenuOpen(false);}} 
                 className={`text-left text-xl uppercase tracking-wider p-4 border-l-4 transition-all ${activeTab === 'python' ? 'border-rog-red text-white bg-white/5' : 'border-transparent text-gray-500'}`}
               >
                 Integration
               </button>
            </nav>

            <button onClick={handleLogout} className="mt-auto py-6 border-t border-gray-800 text-center text-gray-500 hover:text-rog-red tracking-widest uppercase">
               Disconnect Protocol
            </button>
         </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 z-20">
            <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                onLogout={handleLogout} 
            />
        </div>

        {/* Main Content */}
        <main className="flex-1 relative flex flex-col min-w-0 perspective-container">
           {/* Seamless Transition Container */}
           <div className="flex-1 overflow-hidden relative bg-black/20 p-4 md:p-10 scene-3d">
              {/* We use a key here to force re-mounting and triggering CSS animations */}
              <div key={activeTab} className="h-full w-full">
                  {activeTab === 'dashboard' && <KeyManager />}
                  {activeTab === 'python' && <PythonIntegration />}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default App;