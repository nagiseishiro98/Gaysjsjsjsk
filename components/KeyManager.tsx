import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Plus, Search, Trash2, Check,
  RefreshCw, X, Shield, Activity, Server, Zap, AlertTriangle,
  FileText, Monitor,
  Key, Copy, Loader2, RotateCcw, Fingerprint, Clock, Laptop,
  Download, SortAsc, ChevronDown
} from 'lucide-react';
import { createKey, toggleKeyStatus, deleteKey, subscribeToKeys, resetHwid } from '../services/mockDb';
import { LicenseKey, KeyStatus, DurationType } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

// --- ISOLATED COMPONENTS FOR PERFORMANCE ---

const ServerLatencyWidget = React.memo(() => {
  const [serverLoad, setServerLoad] = useState(34);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setServerLoad(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.min(Math.max(prev + change, 20), 95);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, rotateX: 15 }} 
      animate={{ opacity: 1, y: 0, rotateX: 0 }} 
      transition={{ delay: 0.2 }}
      className="bg-[#0e0e10] border border-[#222] p-2.5 md:p-3 rounded flex flex-col justify-between relative overflow-hidden group"
    >
       <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Latency</div>
       <div className="text-xl md:text-3xl font-black text-white">{serverLoad}<span className="text-[10px] md:text-xs text-gray-600 ml-1 font-mono">ms</span></div>
       <Server className="absolute -bottom-1 -right-1 w-6 h-6 md:w-10 md:h-10 text-green-500 opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110" />
    </motion.div>
  );
});

const KeyRow = React.memo(({ k, isDeleting, isResetting, isCopied, onToggle, onReset, onCopy, onDelete }: any) => {
    const isExpired = k.expiresAt && Date.now() > k.expiresAt;
    
    const timeLeft = useMemo(() => {
        if (!k.expiresAt) return 'LIFETIME';
        const now = Date.now();
        const diff = k.expiresAt - now;
        if (diff <= 0) return 'EXPIRED';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days}D LEFT`;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${hours}H LEFT`;
    }, [k.expiresAt]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }} 
            className={`bg-[#0e0e10] border border-[#222] p-2 md:p-2.5 rounded-sm relative group hover:border-rog-red/30 transition-all duration-300 hover:shadow-[0_5px_20px_-10px_rgba(0,0,0,0.5)] ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
        >
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
           
           <div className="flex flex-col lg:flex-row lg:items-center gap-2 md:gap-3 relative z-10">
               {/* Main Info */}
               <div className="flex items-center gap-3 flex-1 min-w-0">
                   <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 bg-[#151518] border border-[#222] group-hover:border-rog-red/50 transition-colors ${k.status === 'ACTIVE' ? 'text-white' : 'text-gray-600'}`}>
                      <Key className="w-3.5 h-3.5" />
                   </div>
                   <div className="flex flex-col min-w-0">
                       <div className="font-mono font-bold text-sm text-white truncate tracking-wider select-all group-hover:text-rog-red transition-colors">{k.key}</div>
                       <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                          {k.note ? <FileText className="w-3 h-3" /> : null}
                          {k.note || 'NO REF'}
                       </div>
                   </div>
               </div>

               {/* Status & Controls */}
               <div className="flex flex-wrap lg:flex-nowrap items-center justify-between lg:justify-end gap-3 lg:gap-4 w-full lg:w-auto border-t lg:border-t-0 border-[#222] pt-2 lg:pt-0">
                   
                   <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onToggle(k.id, k.status)}
                         className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase flex items-center justify-center gap-2 transition-all w-16
                           ${isExpired ? 'border-orange-900/50 bg-orange-900/10 text-orange-500' : 
                             k.status === KeyStatus.ACTIVE ? 'border-green-900/50 bg-green-900/10 text-green-500' : 
                             'border-yellow-900/50 bg-yellow-900/10 text-yellow-500'}`}
                       >
                         <div className={`w-1 h-1 rounded-full ${isExpired ? 'bg-orange-500' : k.status === KeyStatus.ACTIVE ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                         {isExpired ? 'EXP' : k.status}
                       </button>

                       <div className="hidden sm:flex px-2 py-0.5 rounded border border-gray-800 bg-black/30 text-[9px] font-mono text-gray-400 items-center justify-center gap-2 min-w-[60px]">
                          <Clock className="w-2.5 h-2.5" />
                          {timeLeft.replace(' LEFT', '')}
                       </div>
                   </div>

                   <div className="flex-1 lg:flex-none flex items-center justify-end gap-4">
                       {k.boundDeviceId ? (
                          <div className="flex flex-col items-end min-w-[100px]">
                             <div className="flex items-center gap-1.5 text-rog-red bg-rog-red/10 px-1.5 py-0.5 rounded border border-rog-red/20">
                                 <Laptop className="w-2.5 h-2.5" />
                                 <span className="text-[9px] font-bold uppercase max-w-[80px] truncate" title={k.deviceName || 'Unknown Device'}>
                                    {k.deviceName || 'PC'}
                                 </span>
                             </div>
                             <div className="text-[8px] font-mono text-gray-600 mt-0.5 flex items-center gap-1" title={k.boundDeviceId}>
                                 <Fingerprint className="w-2 h-2"/>
                                 <span className="truncate max-w-[70px]">{k.boundDeviceId}</span>
                             </div>
                          </div>
                       ) : (
                          <div className="px-2 py-0.5 rounded border border-dashed border-gray-800 text-gray-600 text-[9px] font-mono uppercase tracking-wider flex items-center gap-1.5 opacity-50">
                              <Monitor className="w-2.5 h-2.5" />
                              Unbound
                          </div>
                       )}
                   </div>

                   <div className="h-5 w-px bg-gray-800 hidden lg:block"></div>

                   <div className="flex items-center gap-1">
                       <button onClick={() => onReset(k.id)} disabled={!k.boundDeviceId || isResetting} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-30" title="Reset Session (Unbind)">
                           {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <RotateCcw className="w-3.5 h-3.5"/>}
                       </button>
                       <button onClick={() => onCopy(k.key, k.id)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Copy Key">
                           {isCopied ? <Check className="w-3.5 h-3.5 text-green-500"/> : <Copy className="w-3.5 h-3.5"/>}
                       </button>
                       <button onClick={() => onDelete(k.id)} className="p-1.5 hover:bg-rog-red/20 rounded text-gray-400 hover:text-rog-red transition-colors" title="Delete">
                           {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
                       </button>
                   </div>
               </div>
           </div>
        </motion.div>
    );
});


const KeyManager: React.FC = () => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<KeyStatus | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'EXPIRES_SOON'>('NEWEST');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [resettingIds, setResettingIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [prefix, setPrefix] = useState('ROG');
  const [durationValue, setDurationValue] = useState(30);
  const [durationType, setDurationType] = useState<DurationType>(DurationType.DAYS);
  const [note, setNote] = useState('');
  const [manualHwid, setManualHwid] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Dropdown State
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const handleDbError = useCallback((error: any) => {
    console.error("DB Error:", error);
    setGlobalError(error.message || "Operation Failed");
  }, []);

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
    
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        unsubscribe();
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleDbError]);

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setGlobalError(null);
    try {
      await createKey({ 
        prefix, durationValue, durationType, note, hwid: manualHwid.trim() || undefined 
      });
      setNote('');
      setManualHwid('');
      setCreateModalOpen(false);
    } catch (error) {
      handleDbError(error);
    }
  };

  const handleToggleStatus = useCallback(async (id: string, currentStatus: KeyStatus) => {
      try { await toggleKeyStatus(id, currentStatus); } catch (error) { handleDbError(error); }
  }, [handleDbError]);

  const handleResetSession = useCallback(async (id: string) => {
    setResettingIds(prev => new Set(prev).add(id));
    try {
      await resetHwid(id);
      setTimeout(() => setResettingIds(prev => { const next = new Set(prev); next.delete(id); return next; }), 500);
    } catch (error) {
      handleDbError(error);
      setResettingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  }, [handleDbError]);

  const handleDelete = useCallback(async (id: string) => {
      if(window.confirm("Delete this key?")) {
          setDeletingIds(prev => new Set(prev).add(id));
          try {
            await deleteKey(id);
          } catch (error) {
            handleDbError(error);
            setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
          }
      }
  }, [handleDbError]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const filteredKeys = useMemo(() => {
    return keys.filter(k => {
      const matchesSearch = k.key.toLowerCase().includes(filter.toLowerCase()) || 
                            (k.note && k.note.toLowerCase().includes(filter.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' ? true : k.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (sortOrder === 'NEWEST') return b.createdAt - a.createdAt;
        if (sortOrder === 'OLDEST') return a.createdAt - b.createdAt;
        if (sortOrder === 'EXPIRES_SOON') {
            const aExp = a.expiresAt || Infinity;
            const bExp = b.expiresAt || Infinity;
            return aExp - bExp;
        }
        return 0;
    });
  }, [keys, filter, statusFilter, sortOrder]);

  const stats = useMemo(() => {
      return {
          total: keys.length,
          active: keys.filter(k => k.status === KeyStatus.ACTIVE).length,
          banned: keys.filter(k => k.status === KeyStatus.BANNED).length
      }
  }, [keys]);

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0e0e10] border border-[#222] p-3 md:p-4 rounded flex flex-col justify-between">
             <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Keys</div>
             <div className="text-2xl md:text-4xl font-black text-white">{stats.total}</div>
         </motion.div>
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#0e0e10] border border-[#222] p-3 md:p-4 rounded flex flex-col justify-between">
             <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active</div>
             <div className="text-2xl md:text-4xl font-black text-green-500">{stats.active}</div>
         </motion.div>
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0e0e10] border border-[#222] p-3 md:p-4 rounded flex flex-col justify-between">
             <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Banned</div>
             <div className="text-2xl md:text-4xl font-black text-rog-red">{stats.banned}</div>
         </motion.div>
         <ServerLatencyWidget />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
         {/* Search */}
         <div className="md:col-span-4 relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-rog-red transition-colors" />
             <input 
               type="text" 
               placeholder="SEARCH KEYS / NOTES..." 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="w-full h-8 bg-[#0a0a0c] border border-[#222] pl-9 pr-3 text-xs text-white focus:border-rog-red outline-none transition-all font-mono placeholder-gray-700 hover:border-gray-700 shadow-inner rounded-sm"
             />
         </div>

         {/* Filter Tabs */}
         <div className="md:col-span-4 flex bg-[#0a0a0c] border border-[#222] p-0.5 rounded-sm h-8 items-center">
             {['ALL', 'ACTIVE', 'BANNED'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setStatusFilter(tab as any)}
                   className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold tracking-widest transition-all rounded-sm relative overflow-hidden
                       ${statusFilter === tab ? 'text-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                   `}
                 >
                     {tab}
                 </button>
             ))}
         </div>

         {/* Sort & Create */}
         <div className="md:col-span-4 flex gap-2">
              {/* Sort Dropdown */}
              <div className="relative flex-1" ref={sortDropdownRef}>
                  <button 
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="w-full h-8 bg-[#0a0a0c] border border-[#222] flex items-center justify-between px-3 text-[10px] font-bold tracking-widest text-gray-400 hover:text-white hover:border-gray-600 transition-all group rounded-sm"
                  >
                      <div className="flex items-center gap-2">
                          <SortAsc className="w-3.5 h-3.5 group-hover:text-rog-red transition-colors" />
                          <span>{sortOrder.replace('_', ' ')}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isSortDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-[#0e0e10] border border-[#333] shadow-xl z-30 rounded-sm overflow-hidden"
                      >
                          {['NEWEST', 'OLDEST', 'EXPIRES_SOON'].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => { setSortOrder(opt as any); setIsSortDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest hover:bg-white/10 transition-colors
                                   ${sortOrder === opt ? 'text-rog-red bg-rog-red/5' : 'text-gray-400'}
                                `}
                              >
                                  {opt.replace('_', ' ')}
                              </button>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>

              <button 
                  onClick={() => setCreateModalOpen(true)}
                  className="h-8 px-4 bg-rog-red hover:bg-red-600 text-white font-bold tracking-widest uppercase flex items-center gap-2 transition-all clip-angle-top active:scale-95 shadow-[0_0_20px_rgba(255,0,60,0.2)] hover:shadow-[0_0_30px_rgba(255,0,60,0.4)] text-[10px]"
              >
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">GENERATE</span>
              </button>
         </div>
      </div>

      {/* Error Banner */}
      {globalError && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-rog-red/10 border-l-2 border-rog-red p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rog-red text-xs font-mono">
                <AlertTriangle className="w-4 h-4" />
                {globalError}
            </div>
            <button onClick={() => setGlobalError(null)}><X className="w-4 h-4 text-rog-red/50 hover:text-rog-red" /></button>
        </motion.div>
      )}

      {/* List Area */}
      <div className="min-h-[400px] relative">
          {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-rog-red animate-spin" />
                      <div className="text-[10px] font-mono text-gray-600 animate-pulse">SYNCING DATABASE...</div>
                  </div>
              </div>
          ) : filteredKeys.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#222] rounded bg-white/5">
                 <Search className="w-8 h-8 text-gray-600 mb-2" />
                 <div className="text-xs text-gray-500 font-bold tracking-widest">NO KEYS FOUND</div>
             </div>
          ) : (
             <div className="space-y-2">
                 <AnimatePresence mode="popLayout">
                    {filteredKeys.map((key) => (
                        <KeyRow 
                          key={key.id} 
                          k={key} 
                          isDeleting={deletingIds.has(key.id)}
                          isResetting={resettingIds.has(key.id)}
                          isCopied={copiedId === key.id}
                          onToggle={handleToggleStatus}
                          onReset={handleResetSession}
                          onCopy={handleCopy}
                          onDelete={handleDelete}
                        />
                    ))}
                 </AnimatePresence>
             </div>
          )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-[#0e0e10] border border-rog-border w-full max-w-md p-6 shadow-2xl relative clip-angle-top"
             >
                 <button onClick={() => setCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                     <X className="w-5 h-5" />
                 </button>

                 <h2 className="text-xl font-black italic text-white mb-6 flex items-center gap-2">
                     <Zap className="w-5 h-5 text-rog-red" />
                     GENERATE KEY
                 </h2>

                 <form onSubmit={handleGenerate} className="space-y-5">
                     <div>
                         <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Prefix</label>
                         <input 
                           type="text" 
                           value={prefix}
                           onChange={e => setPrefix(e.target.value.toUpperCase())}
                           className="w-full bg-black border border-gray-800 p-3 text-white font-mono text-sm focus:border-rog-red outline-none uppercase"
                           placeholder="ROG"
                         />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Duration</label>
                             <input 
                               type="number" 
                               value={durationValue}
                               onChange={e => setDurationValue(parseInt(e.target.value))}
                               min="1"
                               className="w-full bg-black border border-gray-800 p-3 text-white font-mono text-sm focus:border-rog-red outline-none"
                             />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unit</label>
                             <select 
                               value={durationType}
                               onChange={e => setDurationType(e.target.value as DurationType)}
                               className="w-full bg-black border border-gray-800 p-3 text-white font-mono text-sm focus:border-rog-red outline-none appearance-none"
                             >
                                 {Object.values(DurationType).map(t => (
                                     <option key={t} value={t}>{t}</option>
                                 ))}
                             </select>
                         </div>
                     </div>

                     <div>
                         <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Hardware Lock (Optional)</label>
                         <div className="relative">
                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input 
                              type="text" 
                              value={manualHwid}
                              onChange={e => setManualHwid(e.target.value)}
                              className="w-full bg-black border border-gray-800 p-3 pl-10 text-white font-mono text-xs focus:border-rog-red outline-none"
                              placeholder="Pre-bind to specific HWID..."
                            />
                         </div>
                     </div>

                     <div>
                         <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Note</label>
                         <input 
                           type="text" 
                           value={note}
                           onChange={e => setNote(e.target.value)}
                           className="w-full bg-black border border-gray-800 p-3 text-white font-mono text-sm focus:border-rog-red outline-none"
                           placeholder="Client Name / Ref"
                         />
                     </div>

                     <button type="submit" className="w-full bg-rog-red hover:bg-red-600 text-white font-bold py-3 uppercase tracking-widest mt-2 transition-all">
                         Create License
                     </button>
                 </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KeyManager;