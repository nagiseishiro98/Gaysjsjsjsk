import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Check,
  RefreshCw, X, Shield, Activity, Server, Zap, AlertTriangle,
  FileText, Globe, Monitor,
  Key, Copy, Loader2, RotateCcw, Fingerprint, Clock, Laptop
} from 'lucide-react';
import { createKey, toggleKeyStatus, deleteKey, subscribeToKeys, resetHwid } from '../services/mockDb';
import { LicenseKey, KeyStatus, DurationType } from '../types';

const KeyManager: React.FC = () => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [filter, setFilter] = useState('');
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

  const [serverLoad, setServerLoad] = useState(34);

  const handleDbError = (error: any) => {
    console.error("DB Error:", error);
    setGlobalError(error.message || "Operation Failed");
  };

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
        prefix, durationValue, durationType, note, hwid: manualHwid.trim() || undefined 
      });
      setNote('');
      setManualHwid('');
      setCreateModalOpen(false);
    } catch (error) {
      handleDbError(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: KeyStatus) => {
      try { await toggleKeyStatus(id, currentStatus); } catch (error) { handleDbError(error); }
  };

  const handleResetSession = async (id: string) => {
    setResettingIds(prev => new Set(prev).add(id));
    try {
      await resetHwid(id);
      setTimeout(() => setResettingIds(prev => { const next = new Set(prev); next.delete(id); return next; }), 500);
    } catch (error) {
      handleDbError(error);
      setResettingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleDelete = async (id: string) => {
      if(window.confirm("Delete this key?")) {
          setDeletingIds(prev => new Set(prev).add(id));
          try {
            await deleteKey(id);
          } catch (error) {
            handleDbError(error);
            setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
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
    if (days > 0) return `${days}D LEFT`;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${hours}H LEFT`;
  };

  const filteredKeys = keys.filter(k => 
    k.key.toLowerCase().includes(filter.toLowerCase()) || k.note.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 text-white h-full">
      
      {/* Error Banner */}
      {globalError && (
        <div className="bg-rog-red/10 border border-rog-red text-rog-red p-3 rounded text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{globalError}</span>
            <button onClick={() => setGlobalError(null)}><X className="w-4 h-4"/></button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
          <div className="bg-[#0e0e10] border border-[#222] p-3 md:p-4 rounded flex flex-col justify-between relative overflow-hidden group">
             <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Keys</div>
             <div className="text-2xl md:text-4xl font-black text-white">{keys.filter(k => k.status === KeyStatus.ACTIVE).length}</div>
             <Activity className="absolute -bottom-1 -right-1 w-8 h-8 md:w-12 md:h-12 text-rog-red opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <div className="bg-[#0e0e10] border border-[#222] p-3 md:p-4 rounded flex flex-col justify-between relative overflow-hidden group">
             <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Latency</div>
             <div className="text-2xl md:text-4xl font-black text-white">{serverLoad}<span className="text-[10px] md:text-sm text-gray-600 ml-1 font-mono">ms</span></div>
             <Server className="absolute -bottom-1 -right-1 w-8 h-8 md:w-12 md:h-12 text-green-500 opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-2 h-12">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
             <input 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               placeholder="Search Keys..."
               className="w-full h-full bg-[#0e0e10] border border-[#222] rounded pl-9 pr-3 text-xs text-white focus:border-rog-red outline-none transition-colors font-mono placeholder-gray-700 focus:bg-[#151518]"
             />
          </div>
          <button 
             onClick={() => setCreateModalOpen(true)}
             className="bg-rog-red hover:bg-red-600 text-white px-4 rounded font-bold uppercase tracking-wider text-xs flex items-center justify-center shrink-0 transition-colors shadow-[0_0_15px_rgba(255,0,60,0.3)] gap-2"
          >
             <Plus className="w-5 h-5" /> <span className="hidden md:inline">Generate</span>
          </button>
          <button 
             onClick={handleForceSync}
             className="bg-[#0e0e10] border border-[#222] text-gray-400 hover:text-white px-3 rounded flex items-center justify-center shrink-0 transition-colors hover:border-gray-700"
          >
             <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-rog-red' : ''}`} />
          </button>
      </div>

      {/* Keys List */}
      <div className="space-y-3 pb-20">
          {filteredKeys.length === 0 ? (
              <div className="text-center py-20 opacity-30 flex flex-col items-center border border-dashed border-gray-800 rounded">
                 {isLoading ? <Loader2 className="w-8 h-8 animate-spin mb-2"/> : <Shield className="w-8 h-8 mb-2"/>}
                 <span className="text-xs uppercase tracking-widest">{isLoading ? 'Syncing Database...' : 'No Keys Found'}</span>
              </div>
          ) : (
              filteredKeys.map((k) => {
                  const isExpired = k.expiresAt && Date.now() > k.expiresAt;
                  const isDeleting = deletingIds.has(k.id);
                  const isResetting = resettingIds.has(k.id);
                  const timeLeft = getFormattedTimeLeft(k.expiresAt);

                  return (
                    <div key={k.id} className={`bg-[#0e0e10] border border-[#222] p-4 rounded-sm relative group ${isDeleting ? 'opacity-50' : 'hover:border-gray-700'} transition-colors`}>
                       
                       <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                           
                           {/* Main Info */}
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                               <div 
                                 className={`w-10 h-10 rounded flex items-center justify-center shrink-0 bg-white/5 ${k.status === 'ACTIVE' ? 'text-white' : 'text-gray-600'}`}
                               >
                                  <Key className="w-5 h-5" />
                               </div>
                               <div className="flex flex-col min-w-0">
                                   <div className="font-mono font-bold text-sm md:text-base text-white truncate tracking-wider select-all">{k.key}</div>
                                   <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                      {k.note ? <FileText className="w-3 h-3" /> : null}
                                      {k.note || 'NO REF'}
                                   </div>
                               </div>
                           </div>

                           {/* Status & Controls Container */}
                           <div className="flex flex-wrap lg:flex-nowrap items-center justify-between lg:justify-end gap-3 lg:gap-6 w-full lg:w-auto border-t lg:border-t-0 border-[#222] pt-3 lg:pt-0">
                               
                               {/* Badges */}
                               <div className="flex items-center gap-2">
                                   <button 
                                     onClick={() => handleToggleStatus(k.id, k.status)}
                                     className={`px-2 py-1.5 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all w-24
                                       ${isExpired ? 'border-orange-900/50 bg-orange-900/10 text-orange-500' : 
                                         k.status === KeyStatus.ACTIVE ? 'border-green-900/50 bg-green-900/10 text-green-500' : 
                                         'border-yellow-900/50 bg-yellow-900/10 text-yellow-500'}`}
                                   >
                                     <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-orange-500' : k.status === KeyStatus.ACTIVE ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                                     {isExpired ? 'EXPIRED' : k.status}
                                   </button>

                                   <div className="hidden sm:flex px-2 py-1.5 rounded border border-gray-800 bg-black/30 text-[10px] font-mono text-gray-400 items-center justify-center gap-2 w-24">
                                      <Clock className="w-3 h-3" />
                                      {timeLeft}
                                   </div>
                               </div>

                               {/* Device Info - ENHANCED */}
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

                               {/* Actions */}
                               <div className="flex items-center gap-1">
                                   <button onClick={() => handleResetSession(k.id)} disabled={!k.boundDeviceId || isResetting} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-30" title="Reset Session (Unbind)">
                                       {isResetting ? <Loader2 className="w-4 h-4 animate-spin"/> : <RotateCcw className="w-4 h-4"/>}
                                   </button>
                                   <button onClick={() => handleCopy(k.key, k.id)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Copy Key">
                                       {copiedId === k.id ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                                   </button>
                                   <button onClick={() => handleDelete(k.id)} className="p-2 hover:bg-rog-red/20 rounded text-gray-400 hover:text-rog-red transition-colors" title="Delete">
                                       {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                                   </button>
                               </div>
                           </div>
                       </div>

                    </div>
                  );
              })
          )}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in p-0 md:p-4">
            <div className="w-full h-full md:h-auto md:max-h-[600px] md:max-w-lg bg-[#0e0e10] md:border border-[#333] md:rounded-lg flex flex-col animate-slide-up overflow-hidden shadow-2xl">
                
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
                          className="w-full bg-black border border-[#333] p-3 text-white font-mono font-bold rounded focus:border-rog-red outline-none"
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
                                        className={`flex-1 text-[10px] font-bold rounded transition-all ${durationType === type ? 'bg-rog-red text-white' : 'text-gray-500'}`}
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
                        className="w-full bg-white hover:bg-gray-200 text-black font-black py-4 rounded uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <Zap className="w-5 h-5" /> GENERATE
                    </button>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default KeyManager;