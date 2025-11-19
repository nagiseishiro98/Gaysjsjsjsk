import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Trash2, Lock, Unlock, Smartphone, Check,
  RefreshCw, X, RotateCcw, Archive, Shield, Activity, Server, Zap, AlertTriangle
} from 'lucide-react';
import { getKeys, createKey, toggleKeyStatus, deleteKey, resetHwid, archiveKey, restoreKey } from '../services/mockDb';
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

  const filteredKeys = keys.filter(k => 
    k.key.toLowerCase().includes(filter.toLowerCase()) || k.note.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full gap-6 text-rog-text scene-3d animate-slide-up pb-20 md:pb-0">
      
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* Left Column: Stats & Quick Actions */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          
          {/* Server Load Widget */}
          <div className="bg-rog-panel border border-rog-border p-6 clip-angle tilt-panel relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20">
               <Activity className="w-16 h-16 text-rog-red" />
             </div>
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Server className="w-4 h-4" /> Server_Load
             </h3>
             
             <div className="flex items-end gap-2 mb-2">
               <span className="text-4xl font-black text-white">{serverLoad}%</span>
               <span className="text-xs text-rog-red font-mono mb-1 animate-pulse">OPTIMAL</span>
             </div>
             
             <div className="w-full h-1 bg-gray-800 overflow-hidden">
               <div 
                  className="h-full bg-rog-red shadow-[0_0_10px_#ff003c] transition-all duration-1000"
                  style={{ width: `${serverLoad}%` }}
               ></div>
             </div>
             
             <div className="mt-6 pt-4 border-t border-dashed border-gray-800">
               <div className="flex justify-between items-center text-xs font-mono">
                 <span className="text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" /> FIREWALL</span>
                 <span className="text-rog-red">ACTIVE</span>
               </div>
             </div>
          </div>

          {/* System Tip */}
          <div className="bg-rog-panel border border-rog-border p-6 clip-angle-top tilt-panel">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rog-red" /> SYSTEM_TIP
            </h3>
            <div className="border-l-2 border-rog-red pl-4 py-1">
              <p className="text-xs text-gray-400 leading-relaxed">
                HARDWARE ID LOCKING IS ACTIVE. REGENERATION REQUIRED FOR DEVICE RESET. ENSURE CLIENT CONNECTIVITY.
              </p>
            </div>
          </div>

          {/* Initiate Action */}
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="group relative bg-rog-red hover:bg-red-600 transition-all h-32 w-full clip-angle flex items-center justify-center overflow-hidden tilt-panel"
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
        <div className="lg:w-2/3 flex flex-col bg-rog-panel border border-rog-border relative clip-angle tilt-panel">
           {/* Header Actions */}
           <div className="p-4 border-b border-rog-border flex flex-wrap gap-4 justify-between items-center bg-black/20">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-6 bg-rog-red"></div>
                 <h2 className="text-xl font-bold uppercase tracking-wider text-white">Active_Keys</h2>
                 <span className="bg-rog-red/20 text-rog-red text-xs px-2 py-1 rounded border border-rog-red/30 font-mono">
                    COUNT: {filteredKeys.length}
                 </span>
              </div>

              <div className="flex items-center gap-2 flex-1 md:flex-none">
                 <div className="relative group flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 group-focus-within:text-rog-red" />
                   <input 
                     value={filter}
                     onChange={(e) => setFilter(e.target.value)}
                     placeholder="SEARCH ID..."
                     className="w-full md:w-48 bg-rog-black border border-gray-800 py-1.5 pl-8 pr-3 text-xs text-white focus:border-rog-red outline-none transition-colors font-mono"
                   />
                 </div>
                 <button onClick={refreshKeys} className="p-1.5 border border-gray-800 hover:bg-white/10 hover:text-white text-gray-500 transition-colors">
                   <RefreshCw className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* List Header */}
           <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-rog-border bg-black/40 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
             <div className="col-span-4">Key_ID</div>
             <div className="col-span-2">Time</div>
             <div className="col-span-2 text-center">State</div>
             <div className="col-span-3">Hardware_ID</div>
             <div className="col-span-1 text-right">Action</div>
           </div>

           {/* Scrollable List */}
           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar relative">
              {filteredKeys.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                     <Shield className="w-12 h-12 mb-2" />
                     <span className="uppercase tracking-widest text-xs">No Data Found</span>
                  </div>
              ) : (
                  filteredKeys.map((k, i) => {
                      const isExpired = k.expiresAt && Date.now() > k.expiresAt;
                      const statusColor = isExpired ? 'text-orange-500' : k.status === KeyStatus.ACTIVE ? 'text-rog-accent' : k.status === KeyStatus.PAUSED ? 'text-yellow-500' : 'text-gray-500';
                      
                      return (
                        <div 
                          key={k.id} 
                          className="group grid grid-cols-12 gap-2 items-center px-4 py-3 bg-white/5 hover:bg-white/10 border-l-2 border-transparent hover:border-rog-red transition-all duration-300 text-xs"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                           {/* ID Column */}
                           <div className="col-span-4 flex flex-col">
                              <div 
                                onClick={() => handleCopy(k.key, k.id)}
                                className={`font-mono font-bold text-sm cursor-pointer flex items-center gap-2 truncate ${statusColor} hover:brightness-125 transition-all`}
                              >
                                {k.key}
                                {copiedId === k.id && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-[10px] text-gray-600 uppercase tracking-wider truncate">{k.note || 'NO_CLIENT_REF'}</span>
                           </div>

                           {/* Time */}
                           <div className="col-span-2 font-mono text-gray-400">
                             {k.expiresAt ? (
                                 <span className={isExpired ? 'text-red-500' : ''}>
                                     {Math.ceil((k.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))} DAYS
                                 </span>
                             ) : 'LIFE'}
                           </div>

                           {/* State */}
                           <div className="col-span-2 flex justify-center">
                              <button 
                                onClick={() => toggleKeyStatus(k.id) && refreshKeys()}
                                className={`px-2 py-0.5 border ${isExpired ? 'border-orange-900 bg-orange-900/20 text-orange-500' : k.status === KeyStatus.ACTIVE ? 'border-green-900 bg-green-900/20 text-green-500' : 'border-yellow-900 bg-yellow-900/20 text-yellow-500'} text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 hover:scale-105 transition-transform`}
                              >
                                <div className={`w-1 h-1 rounded-full ${isExpired ? 'bg-orange-500' : k.status === KeyStatus.ACTIVE ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                                {isExpired ? 'EXP' : k.status}
                              </button>
                           </div>

                           {/* HWID */}
                           <div className="col-span-3 font-mono text-[10px] text-gray-500 truncate flex items-center gap-2">
                              {k.boundDeviceId ? (
                                  <>
                                    <Smartphone className="w-3 h-3" />
                                    <span className="truncate opacity-50 hover:opacity-100 transition-opacity">{k.boundDeviceId}</span>
                                  </>
                              ) : (
                                  <span className="italic opacity-30">AWAITING_BINDING</span>
                              )}
                           </div>

                           {/* Actions */}
                           <div className="col-span-1 flex justify-end">
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-lg bg-rog-panel border border-rog-red p-0 shadow-[0_0_50px_rgba(255,0,60,0.3)] clip-angle relative overflow-hidden">
            {/* Decorative Top Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-rog-red via-white to-rog-red animate-pulse-glow"></div>
            
            <div className="p-8">
                <button onClick={() => setCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-rog-red p-2 rounded-sm rotate-3">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-wider leading-none">Generate</h3>
                        <span className="text-xs text-rog-red font-mono tracking-[0.3em]">NEW ACCESS KEY</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="group">
                        <label className="text-[10px] text-rog-red font-bold uppercase tracking-widest mb-1 block ml-1">Prefix Identifier</label>
                        <div className="relative">
                            <input value={prefix} onChange={e => setPrefix(e.target.value)} className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-rog-red outline-none font-mono clip-angle-top transition-all focus:shadow-[0_0_15px_rgba(255,0,60,0.2)]" />
                            <div className="absolute right-0 bottom-0 h-2 w-2 border-b border-r border-rog-red"></div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-[10px] text-rog-red font-bold uppercase tracking-widest mb-1 block ml-1">Duration</label>
                             <input type="number" value={durationValue} onChange={e => setDurationValue(parseInt(e.target.value))} className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-rog-red outline-none font-mono text-center" />
                        </div>
                        <div>
                             <label className="text-[10px] text-rog-red font-bold uppercase tracking-widest mb-1 block ml-1">Unit</label>
                             <select value={durationType} onChange={e => setDurationType(e.target.value as DurationType)} className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-rog-red outline-none appearance-none uppercase">
                                <option value={DurationType.DAYS}>Days</option>
                                <option value={DurationType.HOURS}>Hours</option>
                                <option value={DurationType.MINUTES}>Minutes</option>
                                <option value={DurationType.YEARS}>Years</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-rog-red font-bold uppercase tracking-widest mb-1 block ml-1">Client Reference</label>
                        <input value={note} onChange={e => setNote(e.target.value)} className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-rog-red outline-none font-mono text-sm" placeholder="OPTIONAL_NOTE" />
                    </div>
                </div>

                <button 
                    onClick={handleGenerate} 
                    className="w-full mt-8 bg-white text-black hover:bg-rog-red hover:text-white font-black italic text-xl py-4 uppercase tracking-widest transition-all clip-angle hover:shadow-[0_0_30px_rgba(255,0,60,0.5)] flex items-center justify-center gap-2 group"
                >
                    <span>Confirm Generation</span>
                    <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyManager;