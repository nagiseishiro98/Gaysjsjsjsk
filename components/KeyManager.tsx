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
      className="bg-[#0e0e10] border border-[#222] p-3 md:p-4 rounded flex flex-col justify-between relative overflow-hidden group"
    >
       <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Latency</div>
       <div className="text-2xl md:text-4xl font-black text-white">{serverLoad}<span className="text-[10px] md:text-sm text-gray-600 ml-1 font-mono">ms</span></div>
       <Server className="absolute -bottom-1 -right-1 w-8 h-8 md:w-12 md:h-12 text-green-500 opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110" />
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
            className={`bg-[#0e0e10] border border-[#222] p-4 rounded-sm relative group hover:border-rog-red/30 transition-all duration-300 hover:shadow-[0_5px_20px_-10px_rgba(0,0,0,0.5)] ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
        >
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
           
           <div className="flex flex-col lg:flex-row lg:items-center gap-4 relative z-10">
               {/* Main Info */}
               <div className="flex items-center gap-3 flex-1 min-w-0">
                   <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 bg-[#151518] border border-[#222] group-hover:border-rog-red/50 transition-colors ${k.status === 'ACTIVE' ? 'text-white' : 'text-gray-600'}`}>
                      <Key className="w-5 h-5" />
                   </div>
                   <div className="flex flex-col min-w-0">
                       <div className="font-mono font-bold text-sm md:text-base text-white truncate tracking-wider select-all group-hover:text-rog-red transition-colors">{k.key}</div>
                       <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                          {k.note ? <FileText className="w-3 h-3" /> : null}
                          {k.note || 'NO REF'}
                       </div>
                   </div>
               </div>

               {/* Status & Controls */}
               <div className="flex flex-wrap lg:flex-nowrap items-center justify-between lg:justify-end gap-3 lg:gap-6 w-full lg:w-auto border-t lg:border-t-0 border-[#222] pt-3 lg:pt-0">
                   
                   <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onToggle(k.id, k.status)}
                         className={`px-2 py-1.5 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all w-24
                           ${isExpired ? 'border-orange-900/50 bg-orange-900/10 text-orange-500' : 
                             k.status === KeyStatus.ACTIVE ? 'border-green-900/50 bg-green-900/10 text-green-500' : 
                             'border-yellow-900/50 bg-yellow-900/10 text-yellow-500'}`}
                       >
                         <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-orange-500' : k.status === KeyStatus.ACTIVE ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                         {isExpired ? 'EXPIRED' : k.status}
                       </button>

                       <div className="hidden sm:flex px-2 py-1.5 rounded border border-gray-800 bg-black/30 text-[10px] font-mono text-gray-400 items-center justify-center gap-2 w-24">
                          <Clock className="w-3 h-3" />
                          {timeLeft}
                       </div>
                   </div>

                   <div className="flex-1 lg:flex-none flex items-center justify-end gap-4">
                       {k.boundDeviceId ? (
                          <div className="flex flex-col items-end min-w-[140px]">
                             <div className="flex items-center gap-2 text-rog-red bg-rog-red/10 px-2 py-1 rounded border border-rog-red/20">
                                 <Laptop className="w-3 h-3" />
                                 <span className="text-[10px] font-bold uppercase max-w-[120px] truncate" title={k.deviceName || 'Unknown Device'}>
                                    {k.deviceName || 'UNKNOWN DEVICE'}
                                 </span>
                             </div>
                             <div className="text-[9px] font-mono text-gray-600 mt-1 flex items-center gap-1" title={k.boundDeviceId}>
                                 <Fingerprint className="w-2 h-2"/>
                                 <span className="truncate max-w-[100px]">{k.boundDeviceId}</span>
                             </div>
                          </div>
                       ) : (
                          <div className="px-3 py-1.5 rounded border border-dashed border-gray-800 text-gray-600 text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 opacity-50">
                              <Monitor className="w-3 h-3" />
                              Waiting for Login
                          </div>
                       )}
                   </div>

                   <div className="h-6 w-px bg-gray-800 hidden lg:block"></div>

                   <div className="flex items-center gap-1">
                       <button onClick={() => onReset(k.id)} disabled={!k.boundDeviceId || isResetting} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-30" title="Reset Session (Unbind)">
                           {isResetting ? <Loader2 className="w-4 h-4 animate-spin"/> : <RotateCcw className="w-4 h-4"/>}
                       </button>
                       <button onClick={() => onCopy(k.key, k.id)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Copy Key">
                           {isCopied ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                       </button>
                       <button onClick={() => onDelete(k.id)} className="p-2 hover:bg-rog-red/20 rounded text-gray-400 hover:text-rog-red transition-colors" title="Delete">
                           {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
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
        const matchesSearch = k.key.toLowerCase().includes(filter.toLowerCase()) || k.note.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || k.status === statusFilter;
        return matchesSearch && matchesStatus;
      }).sort((a, b) => {
        if (sortOrder === 'NEWEST') return b.createdAt - a.createdAt;
        if (sortOrder === 'OLDEST') return a.createdAt - b.createdAt;
        if (sortOrder === 'EXPIRES_SOON') {
          const expA = a.expiresAt || 9999999999999;
          const expB = b.expiresAt || 9999999999999;
          return expA - expB;
        }
        return 0;
      });
  }, [keys, filter, statusFilter, sortOrder]);

  const handleExportCsv = () => {
    const headers = ["ID", "Key", "Status", "Note", "Created", "Expires", "Bound HWID", "Device Name"];
    const rows = filteredKeys.map(k => [
      k.id,
      k.key,
      k.status,
      k.note || "",
      new Date(k.createdAt).toISOString(),
      k.expiresAt ? new Date(k.expiresAt).toISOString() : "Lifetime",
      k.boundDeviceId || "Unbound",
      k.deviceName || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rog_keys_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 text-white h-full pb-20">
      
      {/* Error Banner */}
      <AnimatePresence>
        {globalError && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rog-red/10 border border-rog-red text-rog-red p-3 rounded text-xs font-mono flex items-center gap-2 overflow-hidden"
          >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{globalError}</span>
              <button onClick={() => setGlobalError(null)}><X className="w-4 h-4"/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20, rotateX: 15 }} 
            animate={{ opacity: 1, y: 0, rotateX: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-[#0e0e10] border border-[#222] p-3 md:p-4 rounded flex flex-col justify-between relative overflow-hidden group perspective-1000"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-rog-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 relative z-10">Active Keys</div>
             <div className="text-2xl md:text-4xl font-black text-white relative z-10">{keys.filter(k => k.status === KeyStatus.ACTIVE).length}</div>
             <Activity className="absolute -bottom-1 -right-1 w-8 h-8 md:w-12 md:h-12 text-rog-red opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110" />
          </motion.div>
          <ServerLatencyWidget />
      </div>

      {/* Action Bar */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex flex-col lg:flex-row gap-3 bg-[#0e0e10] border border-[#222] p-2 rounded relative z-30"
      >
          {/* Search */}
          <div className="relative flex-1 h-10 min-w-0">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
             <input 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               placeholder="Search Keys..."
               className="w-full h-full bg-[#151518] border border-[#2a2a2e] rounded pl-9 pr-3 text-xs text-white focus:border-rog-red outline-none transition-colors font-mono placeholder-gray-700 focus:shadow-[0_0_15px_rgba(255,0,60,0.1)]"
             />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
             
             {/* Filter Pills */}
             <div className="flex bg-[#151518] border border-[#2a2a2e] rounded p-1 min-h-[40px] gap-1 overflow-x-auto no-scrollbar max-w-full">
                {(['ALL', KeyStatus.ACTIVE, KeyStatus.BANNED] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all relative overflow-hidden flex items-center justify-center whitespace-nowrap flex-shrink-0 h-full
                            ${statusFilter === s 
                               ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                               : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                        `}
                    >
                        {s}
                    </button>
                ))}
             </div>

             <div className="w-px h-6 bg-gray-800 mx-1 hidden lg:block"></div>

             {/* Custom Sorting Dropdown */}
             <div className="relative h-10 min-w-[140px] flex-1 sm:flex-none" ref={sortDropdownRef}>
                <button 
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className={`w-full h-full bg-[#151518] border ${isSortDropdownOpen ? 'border-rog-red text-white' : 'border-[#2a2a2e] text-gray-400'} hover:text-white hover:border-gray-500 rounded px-3 flex items-center justify-between transition-all text-[10px] font-bold uppercase tracking-wider group active:scale-95`}
                >
                   <div className="flex items-center gap-2">
                      <SortAsc className={`w-3 h-3 ${isSortDropdownOpen ? 'text-rog-red' : 'group-hover:text-rog-red'} transition-colors`} />
                      <span>
                        {sortOrder === 'NEWEST' && 'Newest'}
                        {sortOrder === 'OLDEST' && 'Oldest'}
                        {sortOrder === 'EXPIRES_SOON' && 'Expiry'}
                      </span>
                   </div>
                   <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                {isSortDropdownOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: 5, scale: 0.98 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 5, scale: 0.98 }}
                     transition={{ duration: 0.15, ease: "easeOut" }}
                     className="absolute top-full right-0 mt-2 w-full min-w-[140px] bg-[#0e0e10] border border-[#333] rounded-lg shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] z-50 p-1 flex flex-col gap-1"
                   >
                       {[
                         { id: 'NEWEST', label: 'Newest' },
                         { id: 'OLDEST', label: 'Oldest' },
                         { id: 'EXPIRES_SOON', label: 'Expiry' }
                       ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                                setSortOrder(item.id as any);
                                setIsSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-between rounded-md group
                                ${sortOrder === item.id 
                                   ? 'bg-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.2)]' 
                                   : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            `}
                          >
                             {item.label}
                             {sortOrder === item.id && <Check className="w-3 h-3" />}
                          </button>
                       ))}
                   </motion.div>
                )}
                </AnimatePresence>
             </div>

             {/* Export */}
             <button 
               onClick={handleExportCsv}
               className="h-10 w-10 bg-[#151518] border border-[#2a2a2e] hover:border-gray-500 hover:bg-white/5 text-gray-400 hover:text-white rounded flex items-center justify-center transition-all group active:scale-95"
               title="Export CSV"
             >
               <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
             </button>
             
             {/* Generate Button */}
             <button 
                onClick={() => setCreateModalOpen(true)}
                className="h-10 px-5 bg-rog-red hover:bg-red-600 text-white rounded font-bold uppercase tracking-wider text-xs flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(255,0,60,0.3)] gap-2 hover:scale-105 active:scale-95 ml-2 flex-1 sm:flex-none"
             >
                <Plus className="w-4 h-4" /> <span className="">Create</span>
             </button>
             
             <button 
                onClick={handleForceSync}
                className="h-10 w-10 bg-[#151518] border border-[#2a2a2e] text-gray-400 hover:text-white rounded flex items-center justify-center transition-colors hover:border-gray-700 active:scale-95 active:rotate-180"
             >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-rog-red' : ''}`} />
             </button>
          </div>
      </motion.div>

      {/* Keys List */}
      <div className="space-y-3 relative z-0">
          {filteredKeys.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 opacity-30 flex flex-col items-center border border-dashed border-gray-800 rounded">
                 {isLoading ? <Loader2 className="w-8 h-8 animate-spin mb-2"/> : <Shield className="w-8 h-8 mb-2"/>}
                 <span className="text-xs uppercase tracking-widest">{isLoading ? 'Syncing Database...' : 'No Keys Found'}</span>
              </motion.div>
          ) : (
              <AnimatePresence mode="popLayout" initial={false}>
              {filteredKeys.map((k) => (
                  <KeyRow 
                      key={k.id}
                      k={k}
                      isDeleting={deletingIds.has(k.id)}
                      isResetting={resettingIds.has(k.id)}
                      isCopied={copiedId === k.id}
                      onToggle={handleToggleStatus}
                      onReset={handleResetSession}
                      onCopy={handleCopy}
                      onDelete={handleDelete}
                  />
              ))}
              </AnimatePresence>
          )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
      {isCreateModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
        >
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="w-full h-full md:h-auto md:max-h-[600px] md:max-w-lg bg-[#0e0e10] md:border border-[#333] md:rounded-lg flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
                
                <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#151518]">
                    <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-4 h-4 text-rog-red" /> Generate Key
                    </div>
                    <button onClick={() => setCreateModalOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-white"/></button>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Prefix</label>
                        <input 
                          value={prefix}
                          onChange={e => setPrefix(e.target.value.toUpperCase())}
                          className="w-full bg-black border border-[#333] p-3 text-white font-mono font-bold rounded focus:border-rog-red outline-none transition-all focus:shadow-[0_0_15px_rgba(255,0,60,0.2)]"
                          placeholder="ROG"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Duration</label>
                        <div className="flex gap-2">
                            <input 
                              type="number"
                              value={durationValue}
                              onChange={e => setDurationValue(parseInt(e.target.value))}
                              className="w-20 bg-black border border-[#333] p-3 text-white font-mono font-bold rounded focus:border-rog-red outline-none text-center"
                            />
                            <div className="flex-1 flex bg-black border border-[#333] rounded p-1">
                                {['HOURS', 'DAYS', 'YEARS'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setDurationType(type as DurationType)}
                                        className={`flex-1 text-[10px] font-bold rounded transition-all ${durationType === type ? 'bg-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hardware ID (Manual Binding)</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input 
                            value={manualHwid}
                            onChange={e => setManualHwid(e.target.value)}
                            className="w-full bg-black border border-[#333] p-3 pl-10 text-white font-mono text-xs rounded focus:border-rog-red outline-none"
                            placeholder="Optional: Pre-bind to HWID"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Note</label>
                        <textarea 
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          className="w-full bg-black border border-[#333] p-3 text-white font-mono text-xs rounded focus:border-rog-red outline-none h-20 resize-none"
                          placeholder="Reference note..."
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-[#222] bg-[#151518]">
                    <button 
                        onClick={handleGenerate}
                        className="w-full bg-white hover:bg-gray-200 text-black font-black py-4 rounded uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                    >
                        <Zap className="w-5 h-5 group-hover:text-rog-red transition-colors" /> GENERATE
                    </button>
                </div>

            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default KeyManager;