import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Check,
  RefreshCw, X, Shield, Activity, Server, Zap, AlertTriangle,
  Terminal, FileText, Globe, Monitor,
  Key, Copy, Loader2, RotateCcw, Fingerprint, Clock
} from 'lucide-react';
import { createKey, toggleKeyStatus, deleteKey, subscribeToKeys, resetHwid } from '../services/mockDb';
import { LicenseKey, KeyStatus, DurationType } from '../types';

const KeyManager: React.FC = () => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [filter, setFilter] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Loading states for actions
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [resettingIds, setResettingIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Error State
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form State
  const [prefix, setPrefix] = useState('ROG');
  const [durationValue, setDurationValue] = useState(30);
  const [durationType, setDurationType] = useState<DurationType>(DurationType.DAYS);
  const [note, setNote] = useState('');
  const [manualHwid, setManualHwid] = useState(''); // New Manual Binding State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fake Stats
  const [serverLoad, setServerLoad] = useState(34);

  const handleDbError = (error: any) => {
    console.error("DB Error:", error);
    if (error.code === 'permission-denied') {
      setGlobalError("ACCESS DENIED: Check Firestore Rules.");
    } else {
      setGlobalError(error.message || "Database Operation Failed");
    }
  };

  // Real-time listener implementation
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToKeys(
      (data) => {
        setKeys(data);
        setIsLoading(false);
        setGlobalError(null);
        setIsSyncing(false);
      },
      (error) => {
        handleDbError(error);
        setIsLoading(false);
        setIsSyncing(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setServerLoad(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.min(Math.max(prev + change, 20), 95);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setGlobalError(null);
    try {
      await createKey({ 
        prefix, 
        durationValue, 
        durationType, 
        note, 
        hwid: manualHwid.trim() || undefined 
      });
      setNote('');
      setManualHwid('');
      setCreateModalOpen(false);
    } catch (error) {
      handleDbError(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: KeyStatus) => {
      setGlobalError(null);
      try {
        await toggleKeyStatus(id, currentStatus);
      } catch (error) {
        handleDbError(error);
      }
  };

  const handleResetSession = async (id: string) => {
    setGlobalError(null);
    setResettingIds(prev => new Set(prev).add(id));
    try {
      await resetHwid(id); // This now clears IP and Last Used
      setTimeout(() => {
        setResettingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 500);
    } catch (error) {
      handleDbError(error);
      setResettingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
      if(window.confirm("Permanently delete this key from Database?")) {
          setGlobalError(null);
          setDeletingIds(prev => new Set(prev).add(id));
          try {
            await deleteKey(id);
          } catch (error) {
            handleDbError(error);
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
          }
      }
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
    <div className="flex flex-col h-full w-full gap-6 text-rog-text animate-fade-in pb-20 md:pb-0">
      
      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-red-500/10 border border-rog-red text-rog-red p-4 rounded-sm flex items-start md:items-center gap-3 animate-pulse-glow shrink-0 relative">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-mono font-bold text-sm">{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="ml-auto hover:text-white transition-colors"><X className="w-4 h-4"/></button>
        </div>
      )}

      <div className="flex flex-col gap-6 h-full">
        
        {/* Left Column: Stats & Quick Actions */}
        <div className="w-full flex flex-col gap-6 shrink-0">
          
          {/* Server Load Widget */}
          <div className="bg-rog-panel border border-rog-border p-6 clip-angle tilt-panel relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-30 transition-opacity">
               <Activity className="w-16 h-16 text-rog-red" />
             </div>
             <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Live_Sync
                </h3>
                <div className="font-mono text-xs text-rog-red animate-pulse flex items-center gap-2">
                   <div className="w-2 h-2 bg-rog-red rounded-full"></div>
                   REALTIME
                </div>
             </div>
             
             <div className="flex items-end gap-2 mb-2">
               <span className="text-4xl font-black text-white">{serverLoad}ms</span>
               <span className="text-xs text-rog-red font-mono mb-1">LATENCY</span>
             </div>
             
             <div className="w-full h-1 bg-gray-800 overflow-hidden">
               <div 
                  className="h-full bg-rog-red shadow-[0_0_10px_#ff003c] transition-all duration-1000 ease-out"
                  style={{ width: `${serverLoad}%` }}
               ></div>
             </div>
          </div>

          {/* Initiate Action */}
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="group relative bg-rog-red hover:bg-red-600 transition-all duration-300 h-32 w-full clip-angle flex items-center justify-center overflow-hidden tilt-panel active:scale-[0.98]"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             
             <div className="relative z-10 flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
               <Plus className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
               <span className="text-2xl font-black italic tracking-widest text-white group-hover:text-glow transition-all">INITIATE</span>
               <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-white/70 font-mono tracking-[0.2em]">NEW_KEY_GEN</span>
             </div>
          </button>

        </div>

        {/* Active Keys List */}
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
                 <button 
                    onClick={handleForceSync}
                    title="Force Sync"
                    className="p-2 bg-black/50 border border-gray-800 hover:border-rog-red hover:text-rog-red transition-all rounded-sm active:scale-95"
                 >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-rog-red' : 'text-gray-500'}`} />
                 </button>
                 <div className="relative group flex-1 md:flex-none w-full md:w-48">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 group-focus-within:text-rog-red transition-colors" />
                   <input 
                     value={filter}
                     onChange={(e) => setFilter(e.target.value)}
                     placeholder="SEARCH ID..."
                     className="w-full bg-rog-black border border-gray-800 py-2 pl-8 pr-3 text-xs text-white focus:border-rog-red outline-none transition-all duration-300 font-mono"
                   />
                 </div>
              </div>
           </div>

           {/* Scrollable List */}
           <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar relative">
              {filteredKeys.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 transition-opacity duration-500">
                     {isLoading ? (
                         <div className="flex flex-col items-center gap-2">
                             <RefreshCw className="w-8 h-8 animate-spin text-rog-red" />
                             <span className="uppercase tracking-widest text-xs">Syncing Database...</span>
                         </div>
                     ) : globalError ? (
                        <div className="flex flex-col items-center gap-2 text-rog-red">
                             <AlertTriangle className="w-12 h-12 mb-2" />
                             <span className="uppercase tracking-widest text-xs">Connection Failed</span>
                        </div>
                     ) : (
                        <>
                            <Shield className="w-12 h-12 mb-2" />
                            <span className="uppercase tracking-widest text-xs">No Data In Cloud</span>
                        </>
                     )}
                  </div>
              ) : (
                  filteredKeys.map((k, i) => {
                      const isExpired = k.expiresAt && Date.now() > k.expiresAt;
                      const statusColor = isExpired ? 'text-orange-500' : k.status === KeyStatus.ACTIVE ? 'text-white' : k.status === KeyStatus.PAUSED ? 'text-yellow-500' : 'text-gray-500';
                      const timeLeft = getFormattedTimeLeft(k.expiresAt);
                      const isDeleting = deletingIds.has(k.id);
                      const isResetting = resettingIds.has(k.id);

                      return (
                        <div 
                          key={k.id} 
                          className={`group bg-white/5 hover:bg-white/10 border border-transparent hover:border-rog-red transition-all duration-300 ease-out text-xs p-4 rounded-sm flex flex-col gap-3 relative animate-slide-in-right hover:translate-x-1 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
                        >
                           {/* Top Row: Key, Copy & Delete */}
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-1 max-w-[80%]">
                                <div 
                                  onClick={() => handleCopy(k.key, k.id)}
                                  className={`font-mono font-bold text-sm cursor-pointer flex items-center gap-2 truncate ${statusColor} hover:brightness-125 transition-all group/copy`}
                                >
                                  <Key className="w-3 h-3 opacity-50" />
                                  {k.key}
                                  <div className="opacity-50 group-hover/copy:opacity-100 group-active/copy:scale-95 transition-all">
                                    {copiedId === k.id ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider truncate block">{k.note || 'NO_REF'}</span>
                              </div>
                              
                              <button 
                                onClick={() => handleDelete(k.id)}
                                disabled={isDeleting}
                                className="text-gray-600 hover:text-rog-red p-2 rounded hover:bg-rog-red/10 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                title="Delete Key"
                              >
                                 {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-rog-red" />
                                 ) : (
                                    <Trash2 className="w-4 h-4" />
                                 )}
                              </button>
                           </div>

                           {/* Middle Row: Status & Time */}
                           <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                               <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleToggleStatus(k.id, k.status)}
                                    className={`px-2 py-0.5 border ${isExpired ? 'border-orange-900 bg-orange-900/20 text-orange-500' : k.status === KeyStatus.ACTIVE ? 'border-green-900 bg-green-900/20 text-green-500' : 'border-yellow-900 bg-yellow-900/20 text-yellow-500'} text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 hover:scale-105 transition-transform`}
                                  >
                                    <div className={`w-1 h-1 rounded-full ${isExpired ? 'bg-orange-500' : k.status === KeyStatus.ACTIVE ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                                    {isExpired ? 'EXP' : k.status}
                                  </button>
                                  
                                  <div className="w-px h-3 bg-white/10 mx-1"></div>

                                  <div className="font-mono flex items-center gap-2">
                                    {k.expiresAt ? (
                                        <span className={`${isExpired ? 'text-rog-red font-bold' : 'text-gray-400'} tracking-wider text-[10px]`}>
                                            {timeLeft}
                                        </span>
                                    ) : (
                                        <span className="text-rog-accent tracking-widest text-[10px] font-bold opacity-60">LIFETIME</span>
                                    )}
                                  </div>
                               </div>
                           </div>

                           {/* Bottom Row: Session Info & Reset */}
                           <div className="flex items-center justify-between bg-black/30 p-2 rounded-sm group-hover:bg-black/50 transition-colors gap-2">
                              
                              {/* IP / Last Used Info */}
                              <div className="flex flex-col flex-1 min-w-0">
                                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                                      <Globe className="w-3 h-3 text-gray-600" />
                                      <span className="truncate">{k.ip || 'NO_IP_LOGGED'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-1">
                                      <Monitor className="w-3 h-3 text-gray-600" />
                                      <span className="truncate opacity-70" title={k.boundDeviceId || 'Not Bound'}>
                                          {k.boundDeviceId ? `HWID: ${k.boundDeviceId.substring(0, 8)}...` : 'NO_BINDING'}
                                      </span>
                                  </div>
                              </div>

                              {/* Reset Button */}
                              <button 
                                onClick={() => handleResetSession(k.id)}
                                disabled={isResetting || (!k.boundDeviceId && !k.ip && !k.lastUsed)}
                                className={`p-2 rounded border transition-all flex items-center justify-center
                                    ${(!k.boundDeviceId && !k.ip && !k.lastUsed) 
                                        ? 'border-gray-800 text-gray-700 cursor-not-allowed' 
                                        : 'border-rog-border text-gray-400 hover:text-white hover:border-rog-red hover:bg-rog-red/10 active:scale-95 cursor-pointer'
                                    }`}
                                title="Reset HWID Binding & Session"
                              >
                                  {isResetting ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                      <RotateCcw className="w-4 h-4" />
                                  )}
                              </button>
                           </div>
                        </div>
                      );
                  })
              )}
           </div>
        </div>
      </div>

      {/* Create Modal - ROG ADMIN Terminal Style */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0a0c] border border-[#2a2a2e] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden animate-scale-in">
             
             {/* Terminal Header */}
             <div className="h-8 bg-[#121214] border-b border-[#2a2a2e] flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
                   </div>
                </div>
                <div className="text-[10px] font-mono text-[#444] uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
                    ADMIN_TERMINAL // GENERATE_KEY
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="text-[#444] hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                </button>
             </div>
             
             <form onSubmit={handleGenerate} className="p-8 space-y-8 font-mono">
                
                {/* Protocol Title */}
                <div className="relative">
                   <div className="absolute -left-8 top-0 bottom-0 w-1 bg-rog-red"></div>
                   <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest leading-none mb-1">
                      <span className="text-rog-red text-2xl">&gt;_</span> PROTOCOL: GENERATE
                   </div>
                   <div className="text-[9px] text-rog-red font-bold tracking-[0.3em] opacity-70 ml-8">
                      SYNC_TO_FIRESTORE_DB
                   </div>
                </div>

                <div className="space-y-6">
                   
                   {/* Identifier Prefix */}
                   <div className="space-y-2">
                      <label className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold"># IDENTIFIER PREFIX</label>
                      <div className="flex items-center text-lg text-white group">
                         <span className="text-[#333] mr-3 font-bold">&gt;</span>
                         <span className="text-rog-red font-bold text-xl mr-2 group-focus-within:text-white transition-colors">[</span>
                         <input 
                           value={prefix} 
                           onChange={e => setPrefix(e.target.value.toUpperCase())}
                           className="bg-transparent border-none outline-none w-full font-bold tracking-widest uppercase placeholder-[#333] text-white"
                           placeholder="PREFIX"
                         />
                         <span className="text-rog-red font-bold text-xl ml-2 group-focus-within:text-white transition-colors">]</span>
                      </div>
                   </div>

                   {/* Validity Period */}
                   <div className="space-y-2">
                      <label className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                         <Clock className="w-3 h-3" /> VALIDITY PERIOD
                      </label>
                      <div className="flex items-center gap-4">
                         <span className="text-[#333] font-bold">&gt;</span>
                         <div className="flex-1 flex items-center gap-3">
                             <input 
                               type="number"
                               value={durationValue}
                               onChange={e => setDurationValue(parseInt(e.target.value))}
                               className="bg-[#121214] border border-[#2a2a2e] w-20 py-2 px-2 text-center text-white outline-none focus:border-rog-red font-bold text-lg rounded-sm"
                             />
                             <div className="flex-1 flex bg-[#121214] border border-[#2a2a2e] rounded-sm p-1">
                                {Object.values(DurationType).filter(t => t !== 'MINUTES').map(t => (
                                   <button
                                     key={t}
                                     type="button"
                                     onClick={() => setDurationType(t)}
                                     className={`flex-1 py-1 text-[10px] font-bold tracking-wider transition-all uppercase ${durationType === t ? 'bg-rog-red text-white shadow-[0_0_15px_rgba(255,0,60,0.4)]' : 'text-[#666] hover:text-[#aaa]'}`}
                                   >
                                     {t}
                                   </button>
                                ))}
                             </div>
                         </div>
                      </div>
                   </div>

                   {/* HWID Binding */}
                   <div className="space-y-2">
                      <label className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold flex items-center justify-between">
                         <span className="flex items-center gap-2"><Fingerprint className="w-3 h-3"/> HWID BINDING</span>
                         <span className="text-rog-red text-[9px] bg-rog-red/10 px-1 rounded">OPTIONAL</span>
                      </label>
                      <div className="flex items-center text-sm text-white border-b border-[#2a2a2e] focus-within:border-rog-red transition-colors pb-2">
                         <span className="text-[#333] mr-3 font-bold">&gt;</span>
                         <input 
                            value={manualHwid}
                            onChange={e => setManualHwid(e.target.value)}
                            className="bg-transparent border-none outline-none w-full tracking-wider placeholder-[#333] font-mono text-xs"
                            placeholder="ENTER_MANUAL_HWID_OR_LEAVE_EMPTY"
                         />
                      </div>
                   </div>

                   {/* Client Ref */}
                   <div className="space-y-2">
                      <label className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                         <FileText className="w-3 h-3" /> CLIENT REF
                      </label>
                      <div className="flex items-center text-sm text-white border-b border-[#2a2a2e] focus-within:border-rog-red transition-colors pb-2">
                         <span className="text-[#333] mr-3 font-bold">&gt;</span>
                         <input 
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="bg-transparent border-none outline-none w-full tracking-wider placeholder-[#333] font-mono text-xs"
                            placeholder="Enter note..."
                         />
                      </div>
                   </div>

                </div>

                {/* Execute Button */}
                <button 
                   type="submit"
                   className="w-full bg-white hover:bg-[#e0e0e0] text-black font-black py-4 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group active:scale-[0.98] clip-angle-top mt-8 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                >
                   <Zap className="w-5 h-5 text-black fill-black" />
                   EXECUTE
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyManager;