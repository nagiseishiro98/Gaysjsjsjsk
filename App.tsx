import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import KeyManager from './components/KeyManager';
import PythonIntegration from './components/PythonIntegration';
import { Menu, X, Cpu, LayoutGrid, Code, LogOut, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mountAnim, setMountAnim] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const session = localStorage.getItem('keymaster_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
    setMountAnim(true);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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
    <div className={`h-screen w-screen flex flex-col bg-[#050505] text-white overflow-hidden transition-opacity duration-1000 ${mountAnim ? 'opacity-100' : 'opacity-0'}`}>
      
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
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default App;