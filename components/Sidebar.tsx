import React from 'react';
import { LayoutDashboard, Code2, LogOut, Shield, Server, Cpu } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  return (
    <div className="w-72 h-screen bg-black border-r border-gray-900 flex flex-col fixed left-0 top-0 hidden md:flex font-sans z-50">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 bg-rog-red flex items-center justify-center shadow-[0_0_10px_#ff003c]">
             <Cpu className="w-6 h-6 text-black" />
           </div>
           <h1 className="font-bold text-2xl tracking-wider text-white">ROG<span className="text-rog-red">ADMIN</span></h1>
        </div>
        <div className="flex items-center gap-2 pl-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
          <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">System Online</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-2">
        <div className="px-4 mb-4">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Main Modules</span>
        </div>
        
        <button
          onClick={() => onTabChange('dashboard')}
          className={`w-full flex items-center justify-between px-4 py-4 border-l-2 transition-all duration-200 group ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-rog-red/10 to-transparent border-rog-red'
              : 'border-transparent hover:bg-gray-900 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-rog-red' : 'text-gray-500 group-hover:text-gray-300'}`} />
            <span className={`font-bold tracking-wider ${activeTab === 'dashboard' ? 'text-rog-red' : 'text-gray-500 group-hover:text-gray-300'}`}>DASHBOARD</span>
          </div>
          {activeTab === 'dashboard' && <div className="w-1.5 h-1.5 bg-rog-red shadow-[0_0_5px_#ff003c]"></div>}
        </button>

        <button
          onClick={() => onTabChange('python')}
          className={`w-full flex items-center justify-between px-4 py-4 border-l-2 transition-all duration-200 group ${
            activeTab === 'python'
              ? 'bg-gradient-to-r from-rog-red/10 to-transparent border-rog-red'
              : 'border-transparent hover:bg-gray-900 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <Code2 className={`w-5 h-5 ${activeTab === 'python' ? 'text-rog-red' : 'text-gray-500 group-hover:text-gray-300'}`} />
            <span className={`font-bold tracking-wider ${activeTab === 'python' ? 'text-rog-red' : 'text-gray-500 group-hover:text-gray-300'}`}>INTEGRATION</span>
          </div>
          {activeTab === 'python' && <div className="w-1.5 h-1.5 bg-rog-red shadow-[0_0_5px_#ff003c]"></div>}
        </button>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-6 border-t border-gray-900 bg-black/50">
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-[10px] font-bold tracking-widest mb-1">
              <span className="text-gray-500 flex items-center gap-1"><Server className="w-3 h-3" /> SERVER_LOAD</span>
              <span className="text-emerald-500">34%</span>
            </div>
            <div className="h-1 w-full bg-gray-900">
              <div className="h-full w-[34%] bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
            </div>
          </div>
          
          <div>
             <div className="flex justify-between text-[10px] font-bold tracking-widest mb-1">
              <span className="text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" /> FIREWALL</span>
              <span className="text-rog-red">ACTIVE</span>
            </div>
            <div className="h-1 w-full bg-gray-900">
              <div className="h-full w-full bg-rog-red shadow-[0_0_5px_#ff003c]"></div>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 hover:bg-gray-900 transition-all font-bold tracking-widest text-xs uppercase"
        >
          <LogOut className="w-4 h-4" />
          Terminate_Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;