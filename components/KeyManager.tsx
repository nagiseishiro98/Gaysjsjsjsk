import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Trash2, Smartphone, Check,
  RefreshCw, X, Shield, Activity, Server, Zap, AlertTriangle,
  Terminal, Hash, FileText,
  Key, Monitor, Copy, Settings, Timer
} from 'lucide-react';
import { getKeys, createKey, toggleKeyStatus, deleteKey } from '../services/mockDb';
import { LicenseKey, KeyStatus, DurationType } from '../types';

const KeyManager: React.FC = () => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [filter, setFilter] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  // Form State
  const [prefix, setPrefix] = useState('ROG');
  const [durationValue, setDurationValue] = useState(30);
  const [durationType, setDurationType] = useState<DurationType>(DurationType.DAYS);
  const [note, setNote] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fake Stats
  const [serverLoad, setServerLoad] = useState(34);

  const refreshKeys = useCallback(() => {
    setKeys(getKeys());
  }, []);

  useEffect(() => {
    refreshKeys();
    const interval = setInterval(() => {
      setServerLoad(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.min(Math.max(prev + change, 20), 95);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [refreshKeys]);

  const handleGenerate = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    createKey({ prefix, durationValue, durationType, note });
    refreshKeys();
    setNote('');
    setCreateModalOpen(false);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getFormattedTimeLeft = (expiresAt: number | null) => {
    if (!expiresAt) return 'LIFETIME';
    const now = Date.now();
    const diff = expiresAt - now;
    
    if (diff <= 0) return 'EXPIRED';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} DAYS`;
    
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (hours > 0) return `${hours} HOURS`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} MINS`;
  };

  const filteredKeys = keys.filter(k => 
    k.key.toLowerCase().includes(filter.toLowerCase()) || k.note.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full gap-6 text-rog-text animate-slide-up pb-20 md:pb-0">
      
      {/* Removed lg:flex-row to disable landscape side-by-side layout */}
      <div className="flex flex-col gap-6 h-full">
        
        {/* Left Column: Stats & Quick Actions */}
        {/* Removed lg:w-1/3 to allow full width in vertical stack */}
        <div className="w-full flex flex-col gap-6 shrink-0">
          
          {/* Server Load Widget */}
          <div className="bg-rog-panel border border-rog-border p-6 clip-angle tilt-panel relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20">
               <Activity className="w-16 h-16 text-rog-red" />
             </div>
             <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Server_Load
                </h3>
                <div className="font-mono text-xs text-rog-red animate-pulse">
                   LIVE
                </div>
             </div>
             
             <div className="flex items-end gap-2 mb-2">
               <span className="text-4xl font-black text-white">{serverLoad}%</span>
               <span className="text-xs text-rog-red font-mono mb-1">OPTIMAL</span>
             </div>
             
             <div className="w-full h-1 bg-gray-800 overflow-hidden">
               <div 
                  className="h-full bg-rog-red shadow-[0_0_10px_#ff003c] transition-all duration-1000"
                  style={{ width: `${serverLoad}%` }}
               ></div>
             </div>
          </div>

          {/* System Tip */}
          <div className="bg-rog-panel border border-rog-border p-4 clip-angle-top tilt-panel hidden sm:block">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-rog-red" /> SYSTEM_TIP
            </h3>
            <div className="border-l-2 border-rog-red pl-3 py-1">
              <p className="text-xs text-gray-400 leading-relaxed">
                HARDWARE ID LOCKING ACTIVE. DEVICE BINDING IS PERMANENT UNLESS RESET BY ADMIN.
              </p>
            </div>
          </div>

          {/* Initiate Action */}
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="group relative bg-rog-red hover:bg-red-600 transition-all h-32 w-full clip-angle flex items-center justify-center overflow-hidden tilt-panel active:scale-95"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             
             <div className="relative z-10 flex flex-col items-center gap-2">
               <Plus className="w-8 h-8 text-white group-hover:scale-125 transition-transform duration-300" />
               <span className="text-2xl font-black italic tracking-widest text-white group-hover:text-glow transition-all">INITIATE</span>
               <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-white/70 font-mono tracking-[0.2em]">NEW_KEY_GEN</span>
             </div>
          </button>

        </div>

        {/* Right Column: Active Keys List */}
        <div className="flex-1 flex flex-col bg-rog-panel border border-rog-border relative clip-angle tilt-panel min-h-[400px]">
           {/* Header Actions */}
           <div className="p-4 border-b border-rog-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-black/20">
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                 <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-rog-red"></div>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white">Active_Keys</h2>
                    <span className="bg-rog-red/20 text-rog-red text-xs px-2 py-1 rounded border border-rog-red/30 font-mono">
                        {filteredKeys.length}
                    </span>
                 </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                 <div className="relative group flex-1 md:flex-none w-full md:w-48">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 group-focus-within:text-rog-red" />
                   <input 
                     value={filter}
                     onChange={(e) => setFilter(e.target.value)}
                     placeholder="SEARCH ID..."
                     className="w-full bg-rog-black border border-gray-800 py-2 pl-8 pr-3 text-xs text-white focus:border-rog-red outline-none transition-colors font-mono"
                   />
                 </div>
                 <button onClick={refreshKeys} className="p-2 border border-gray-800 hover:bg-white/10 hover:text-white text-gray-500 transition-colors">
                   <RefreshCw className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Desktop List Header */}
           <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-3 border-b border-rog-border bg-black/40 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
             <div className="col-span-4 flex items-center gap-2"><Key className="w-3 h-3 text-rog-red" /> Key_ID</div>
             {/* Removed Timer Icon here */}
             <div className="col-span-2 flex items-center gap-2">Time_Remaining</div>
             <div className="col-span-2 text-center flex items-center justify-center gap-2"><Activity className="w-3 h-3 text-rog-red" /> State</div>
             <div className="col-span-3 flex items-center gap-2"><Monitor className="w-3 h-3 text-rog-red" /> Hardware_ID</div>
             <div className="col-span-1 text-right flex items-center justify-end gap-2"><Settings className="w-3 h-3 text-rog-red" /> Action</div>
           </div>

           {/* Scrollable List */}
           <div className="flex-1 overflow-y-auto p-2 md:p-0 space-y-2 md:space-y-1 custom-scrollbar relative">
              {filteredKeys.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                     <Shield className="w-12 h-12 mb-2" />
                     <span className="uppercase tracking-widest text-xs">No Data Found</span>
                  </div>
              ) : (
                  filteredKeys.map((k, i) => {
                      const isExpired = k.expiresAt && Date.now() > k.expiresAt;
                      const statusColor = isExpired ? 'text-orange-500' : k.status === KeyStatus.ACTIVE ? 'text-white' : k.status === KeyStatus.PAUSED ? 'text-yellow-500' : 'text-gray-500';
                      const timeLeft = getFormattedTimeLeft(k.expiresAt);

                      return (
                        <div 
                          key={k.id} 
                          className="group bg-white/5 md:bg-transparent hover:bg-white/10 border border-transparent hover:border-rog-red md:border-none md:border-b md:border-gray-800/50 md:hover:border-transparent transition-all duration-300 text-xs p-4 md:px-6 md:py-3 rounded-sm md:rounded-none grid grid-cols-1 md:grid-cols-12 gap-2 items-center md:items-start relative"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                           {/* Mobile: Top Row (Key + Delete) */}
                           <div className="col-span-4 flex flex-col md:block">
                              <div className="flex justify-between items-start md:block">
                                <div 
                                  onClick={() => handleCopy(k.key, k.id)}
                                  className={`font-mono font-bold text-sm md:text-sm cursor-pointer flex items-center gap-2 truncate ${statusColor} hover:brightness-125 transition-all mb-1 md:mb-0 group/copy`}
                                >
                                  <Key className="w-3 h-3 md:hidden opacity-50" />
                                  {k.key}
                                  {copiedId === k.id ? (
                                      <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                      <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity text-gray-500" />
                                  )}
                                </div>
                                <button 
                                  onClick={() => deleteKey(k.id) && refreshKeys()}
                                  className="md:hidden text-gray-600 hover:text-rog-red p-1"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider truncate block">{k.note || 'NO_REF'}</span>
                           </div>

                           {/* Time - Removed Icon, Fixed Alignment */}
                           <div className="col-span-2 font-mono flex items-center gap-2 md:mt-[2px]">
                             {k.expiresAt ? (
                                 <span className={`${isExpired ? 'text-rog-red font-bold' : 'text-gray-400'} tracking-wider text-xs`}>
                                     {timeLeft}
                                 </span>
                             ) : (
                                 <span className="text-rog-accent tracking-widest text-[10px] font-bold opacity-60">LIFETIME</span>
                             )}
                           </div>

                           {/* State */}
                           <div className="col-span-2 flex md:justify-center justify-start md:mt-[1px]">
                              <button 
                                onClick={() => toggleKeyStatus(k.id) && refreshKeys()}
                                className={`px-2 py-0.5 border ${isExpired ? 'border-orange-900 bg-orange-900/20 text-orange-500' : k.status === KeyStatus.ACTIVE ? 'border-green-900 bg-green-900/20 text-green-500' : 'border-yellow-900 bg-yellow-900/20 text-yellow-500'} text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 hover:scale-105 transition-transform`}
                              >
                                <div className={`w-1 h-1 rounded-full ${isExpired ? 'bg-orange-500' : k.status === KeyStatus.ACTIVE ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                                {isExpired ? 'EXP' : k.status}
                              </button>
                           </div>

                           {/* HWID */}
                           <div className="col-span-3 font-mono text-[10px] text-gray-500 truncate flex items-center gap-2 bg-black/20 md:bg-transparent p-1 md:p-0 rounded md:rounded-none mt-1 md:mt-[3px]">
                              {k.boundDeviceId ? (
                                  <>
                                    <Smartphone className="w-3 h-3 shrink-0 text-gray-400" />
                                    <span className="truncate opacity-50 hover:opacity-100 transition-opacity">{k.boundDeviceId}</span>
                                  </>
                              ) : (
                                  <span className="italic opacity-30 pl-1">UNBOUND</span>
                              )}
                           </div>

                           {/* Desktop Actions */}
                           <div className="hidden md:flex col-span-1 justify-end md:mt-[1px]">
                              <button 
                                onClick={() => deleteKey(k.id) && refreshKeys()}
                                className="text-gray-600 hover:text-rog-red transition-colors"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      );
                  })
              )}
           </div>
        </div>
      </div>

      {/* New Create Modal - Terminal Style */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-lg bg-[#08080a] border border-rog-border relative overflow-hidden shadow-2xl">
             {/* Top Bar */}
             <div className="h-8 bg-[#151518] border-b border-rog-border flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                   <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span className="ml-2 text-[10px] font-mono text-gray-500 uppercase">ADMIN_TERMINAL // GENERATE_KEY</span>
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
             </div>

             <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8 opacity-80">
                   <Terminal className="w-8 h-8 text-rog-red" />
                   <div>
                      <h3 className="text-xl font-bold text-white tracking-wider">PROTOCOL: GENERATE</h3>
                      <p className="text-[10px] text-rog-red font-mono">SECURE_HASH_ALGORITHM_V2</p>
                   </div>
                </div>

                <div className="space-y-6 font-mono text-sm">
                    {/* Prefix Input */}
                    <div className="flex flex-col gap-1">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Hash className="w-3 h-3" /> Identifier Prefix
                       </label>
                       <div className="flex items-center gap-2 text-white">
                          <span className="text-gray-600">{'>'}</span>
                          <span className="text-rog-red text-lg">[</span>
                          <input 
                            value={prefix} 
                            onChange={e => setPrefix(e.target.value.toUpperCase())} 
                            className="bg-transparent border-none outline-none text-white w-full uppercase placeholder-gray-700 focus:ring-0 p-0 text-lg font-bold"
                            placeholder="PREFIX"
                            maxLength={6}
                          />
                          <span className="text-rog-red text-lg">]</span>
                       </div>
                    </div>

                    {/* Duration Input */}
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Timer className="w-3 h-3" /> Validity Period
                       </label>
                       <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1 flex items-center gap-2">
                             <span className="text-gray-600">{'>'}</span>
                             <input 
                               type="number" 
                               value={durationValue} 
                               onChange={e => setDurationValue(parseInt(e.target.value))} 
                               className="bg-black/50 border-b border-gray-700 focus:border-rog-red text-white w-full p-2 text-center outline-none" 
                             />
                          </div>
                          <div className="col-span-2 flex bg-black/50 border border-gray-800 p-1 rounded-sm">
                             {[DurationType.DAYS, DurationType.HOURS, DurationType.YEARS].map((type) => (
                                <button
                                  key={type}
                                  onClick={() => setDurationType(type)}
                                  className={`flex-1 text-[10px] font-bold uppercase py-1.5 transition-all ${durationType === type ? 'bg-rog-red text-white shadow-[0_0_10px_#ff003c]' : 'text-gray-600 hover:text-white'}`}
                                >
                                   {type}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Note Input */}
                    <div className="flex flex-col gap-1">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Client Ref
                       </label>
                       <div className="flex items-center gap-2 text-white">
                          <span className="text-gray-600">{'>'}</span>
                          <input 
                            value={note} 
                            onChange={e => setNote(e.target.value)} 
                            className="bg-transparent border-b border-gray-700 focus:border-rog-red outline-none text-gray-300 w-full p-1 text-sm"
                            placeholder="Enter note..."
                          />
                       </div>
                    </div>
                </div>

                <button 
                   onClick={handleGenerate}
                   className="w-full mt-8 bg-white text-black hover:bg-rog-red hover:text-white font-bold py-4 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                   <Zap className="w-4 h-4" />
                   <span>Execute</span>
                </button>
             </div>
             
             {/* Decorative footer line */}
             <div className="h-1 w-full bg-gradient-to-r from-rog-red/50 via-transparent to-rog-red/50"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyManager;