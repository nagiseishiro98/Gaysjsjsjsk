import React, { useState, useEffect } from 'react';
import { LayoutGrid, Code, LogOut, Cpu, Signal, Clock } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutGrid },
    { id: 'python', label: 'INTEGRATION', icon: Code },
  ];

  return (
    <div className="h-full flex flex-col bg-rog-black border-r border-rog-border relative z-20 transition-all duration-300">
      {/* Logo Area */}
      <div className="p-8 pb-12">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-rog-red p-2 rounded-sm shadow-[0_0_15px_#ff003c]">
                <Cpu className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
                <div className="font-black text-2xl tracking-tighter text-white leading-none">
                ROG<span className="text-rog-red">ADMIN</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest flex items-center gap-2">
                    <Signal className="w-3 h-3 text-green-500 animate-pulse" />
                    SYSTEM ONLINE
                </div>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-6 space-y-8">
         <div>
             <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4 pl-2">Main Modules</div>
             <div className="space-y-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`group w-full flex items-center gap-4 px-4 py-4 transition-all duration-300 relative overflow-hidden
                            ${isActive ? 'bg-gradient-to-r from-rog-red/20 to-transparent border-l-2 border-rog-red' : 'hover:bg-white/5 border-l-2 border-transparent'}
                        `}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-rog-red' : 'text-gray-500 group-hover:text-white'}`} />
                            <span className={`text-sm font-bold tracking-wider ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                {item.label}
                            </span>
                            
                            {/* Active Dot */}
                            {isActive && <div className="absolute right-4 w-1.5 h-1.5 bg-rog-red shadow-[0_0_5px_#ff003c]"></div>}
                        </button>
                    );
                })}
             </div>
         </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-900">
        {/* Live Clock */}
        <div className="mb-4 flex items-center gap-2 text-gray-600 font-mono text-xs">
            <Clock className="w-3 h-3" />
            <span>{time.toLocaleTimeString()}</span>
        </div>

        <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all group"
            title="Logout"
        >
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span>Terminate_Session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;