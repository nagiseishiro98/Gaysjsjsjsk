import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import KeyManager from './components/KeyManager';
import PythonIntegration from './components/PythonIntegration';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('keymaster_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
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
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-rog-red/30">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-800 z-50 flex items-center justify-between px-6">
        <span className="font-bold text-white tracking-wider">ROG<span className="text-rog-red">ADMIN</span></span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-black border-b border-gray-800 z-40 p-4 space-y-2 shadow-2xl">
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 bg-gray-900 text-white font-bold uppercase text-sm">DASHBOARD</button>
          <button onClick={() => { setActiveTab('python'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 bg-gray-900 text-white font-bold uppercase text-sm">INTEGRATION</button>
          <button onClick={handleLogout} className="block w-full text-left px-4 py-3 bg-rog-red text-white font-bold uppercase text-sm">TERMINATE</button>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-72 pt-20 md:pt-0 min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="mb-10 border-b border-gray-900 pb-6">
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase mb-2">
              {activeTab === 'dashboard' ? 'Command_Center' : 'Dev_Integration'}
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-rog-red">
              <span>//</span>
              <span className="text-gray-500 uppercase">
                {activeTab === 'dashboard' ? 'Manage License Protocols' : 'Generate Validation Logic'}
              </span>
            </div>
          </div>

          {activeTab === 'dashboard' && <KeyManager />}
          {activeTab === 'python' && <PythonIntegration />}
        </div>
      </main>
    </div>
  );
};

export default App;