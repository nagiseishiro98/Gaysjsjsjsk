import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Copy, Trash2, Play, Pause, ShieldAlert, 
  CheckCircle, AlertTriangle, Activity, Search
} from 'lucide-react';
import { getKeys, createKey, toggleKeyStatus, deleteKey, resetHwid, banKey } from '../services/mockDb';
import { LicenseKey, KeyStatus, DurationType } from '../types';

const KeyManager: React.FC = () => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [filter, setFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [prefix, setPrefix] = useState('YW-TEST-KEY');
  const [durationValue, setDurationValue] = useState(1);
  const [durationType, setDurationType] = useState<DurationType>(DurationType.DAYS);
  const [note, setNote] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshKeys = useCallback(() => {
    setKeys(getKeys());
  }, []);

  useEffect(() => {
    refreshKeys();
  }, [refreshKeys]);

  const handleGenerate = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    createKey({ prefix, durationValue, durationType, note });
    refreshKeys();
    setNote('');
    setIsFormOpen(false);
  };

  const quickGenerate = (val: number, type: DurationType, label: string) => {
     createKey({ prefix: 'YW', durationValue: val, durationType: type, note: `Quick ${label}` });
     refreshKeys();
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleToggle = (id: string) => {
    toggleKeyStatus(id);
    refreshKeys();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('CONFIRM DELETION? This action cannot be undone.')) {
      deleteKey(id);
      refreshKeys();
    }
  };

  const handleBan = (id: string) => {
      if(window.confirm('CONFIRM BAN? Key will be permanently blacklisted.')) {
          banKey(id);
          refreshKeys();
      }
  }

  const handleResetHwid = (id: string) => {
    if (window.confirm('RESET HARDWARE BINDING?')) {
      resetHwid(id);
      refreshKeys();
    }
  };

  const filteredKeys = keys.filter(k => 
    k.key.toLowerCase().includes(filter.toLowerCase()) || 
    k.note.toLowerCase().includes(filter.toLowerCase())
  );

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'LIFETIME';
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: false 
    });
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {/* Quick Presets */}
         <button onClick={() => quickGenerate(1, DurationType.DAYS, '1 Day')} className="bg-gray-900/50 border border-gray-800 hover:border-gray-600 p-4 text-center group transition-all">
            <span className="text-sm text-gray-500 font-bold tracking-widest group-hover:text-white">1 DAY</span>
         </button>
         <button onClick={() => quickGenerate(7, DurationType.DAYS, '1 Week')} className="bg-gray-900/50 border border-gray-800 hover:border-gray-600 p-4 text-center group transition-all">
            <span className="text-sm text-gray-500 font-bold tracking-widest group-hover:text-white">1 WEEK</span>
         </button>
         <button onClick={() => quickGenerate(30, DurationType.DAYS, '1 Month')} className="bg-gray-900/50 border border-gray-800 hover:border-gray-600 p-4 text-center group transition-all">
            <span className="text-sm text-gray-500 font-bold tracking-widest group-hover:text-white">1 MONTH</span>
         </button>
         <button onClick={() => quickGenerate(1, DurationType.YEARS, '1 Year')} className="bg-gray-900/50 border border-gray-800 hover:border-gray-600 p-4 text-center group transition-all">
            <span className="text-sm text-gray-500 font-bold tracking-widest group-hover:text-white">1 YEAR</span>
         </button>
      </div>

      {/* Initiate Button */}
      <button 
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="w-full bg-rog-red hover:bg-red-600 text-white font-bold text-xl py-6 tracking-widest uppercase shadow-[0_0_20px_rgba(255,0,60,0.3)] transition-all clip-path-button relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <Plus className="w-6 h-6" /> {isFormOpen ? 'CANCEL_SEQUENCE' : 'INITIATE_GENERATION'}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      </button>

      {/* Generator Form Panel */}
      {isFormOpen && (
        <div className="bg-gray-900/80 border border-rog-red p-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
             <div>
               <label className="block text-[10px] text-rog-red font-bold uppercase tracking-widest mb-2">KEY PREFIX</label>
               <input value={prefix} onChange={e => setPrefix(e.target.value)} className="w-full bg-black border border-gray-700 p-3 text-white font-mono focus:border-rog-red outline-none" />
             </div>
             <div>
               <label className="block text-[10px] text-rog-red font-bold uppercase tracking-widest mb-2">DURATION VALUE</label>
               <input type="number" value={durationValue} onChange={e => setDurationValue(parseInt(e.target.value))} className="w-full bg-black border border-gray-700 p-3 text-white font-mono focus:border-rog-red outline-none" />
             </div>
             <div>
               <label className="block text-[10px] text-rog-red font-bold uppercase tracking-widest mb-2">DURATION TYPE</label>
               <select value={durationType} onChange={e => setDurationType(e.target.value as DurationType)} className="w-full bg-black border border-gray-700 p-3 text-white font-mono focus:border-rog-red outline-none">
                 <option value={DurationType.MINUTES}>MINUTES</option>
                 <option value={DurationType.HOURS}>HOURS</option>
                 <option value={DurationType.DAYS}>DAYS</option>
                 <option value={DurationType.YEARS}>YEARS</option>
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-rog-red font-bold uppercase tracking-widest mb-2">NOTE</label>
               <input value={note} onChange={e => setNote(e.target.value)} placeholder="CLIENT_REF" className="w-full bg-black border border-gray-700 p-3 text-white font-mono focus:border-rog-red outline-none" />
             </div>
          </div>
          <button onClick={handleGenerate} className="w-full bg-white text-black font-bold py-3 hover:bg-gray-200 uppercase tracking-widest">CONFIRM GENERATION</button>
        </div>
      )}

      {/* System Tip */}
      <div className="border border-rog-red/50 bg-rog-red/5 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-rog-red"></div>
        <h3 className="text-white font-bold tracking-widest flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-rog-red" /> SYSTEM_TIP
        </h3>
        <div className="text-gray-400 text-sm font-mono leading-relaxed">
          <span className="text-rog-red">|</span> HARDWARE ID LOCKING IS ACTIVE.<br/>
          <span className="text-rog-red">|</span> REGENERATION REQUIRED FOR DEVICE RESET. ENSURE CLIENT PY SCRIPT IS V2.0+.
        </div>
      </div>

      {/* Active Keys Table Container */}
      <div>
        <div className="flex items-center justify-between mb-4 border-l-4 border-rog-red pl-4">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">ACTIVE_KEYS</h2>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="SEARCH_DB..."
                  className="bg-black border border-gray-800 py-2 pl-10 pr-4 text-xs text-white font-mono focus:border-rog-red outline-none w-48"
                />
             </div>
             <div className="bg-rog-red/10 border border-rog-red/30 px-3 py-1">
               <span className="text-xs text-rog-red font-bold">COUNT: {keys.length}</span>
             </div>
          </div>
        </div>

        <div className="bg-black border border-gray-900 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800">
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest"># KEY_ID</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">TIME</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">STATE</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">HWID_BINDING</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">EXPIRY</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">CONTROLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {filteredKeys.length === 0 && (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-600 font-mono">NO_DATA_FOUND</td></tr>
              )}
              {filteredKeys.map((k) => {
                const isExpired = k.expiresAt && Date.now() > k.expiresAt;
                const isBanned = k.status === KeyStatus.BANNED;
                
                return (
                  <tr key={k.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="font-mono text-rog-red font-bold text-sm break-all max-w-[200px]">
                        {k.key}
                      </div>
                      <div className="text-[10px] text-gray-600 uppercase mt-1">{k.note || 'NO_REF'}</div>
                    </td>
                    <td className="p-4">
                       <div className="border border-gray-800 p-2 inline-block min-w-[60px] text-center">
                         <span className="text-xs text-gray-300 font-mono">
                           {k.expiresAt ? 
                             Math.ceil((k.expiresAt - k.createdAt) / (1000 * 60 * 60 * 24)) + ' D' 
                             : 'INF'
                           }
                         </span>
                       </div>
                    </td>
                    <td className="p-4">
                       <div className={`inline-flex items-center gap-2 px-3 py-1 border ${
                         isBanned ? 'border-red-900 bg-red-900/20' :
                         isExpired ? 'border-gray-700 bg-gray-800' :
                         k.status === KeyStatus.ACTIVE ? 'border-emerald-900 bg-emerald-900/20' : 'border-yellow-900 bg-yellow-900/20'
                       }`}>
                         <div className={`w-2 h-2 rounded-sm ${
                           isBanned ? 'bg-red-600' :
                           isExpired ? 'bg-gray-500' :
                           k.status === KeyStatus.ACTIVE ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-yellow-500'
                         }`}></div>
                         <span className={`text-[10px] font-bold tracking-widest ${
                           isBanned ? 'text-red-500' :
                           isExpired ? 'text-gray-500' :
                           k.status === KeyStatus.ACTIVE ? 'text-emerald-500' : 'text-yellow-500'
                         }`}>
                           {isBanned ? 'BANNED' : isExpired ? 'EXPIRED' : k.status}
                         </span>
                       </div>
                    </td>
                    <td className="p-4">
                      {k.boundDeviceId ? (
                         <div className="font-mono text-xs text-gray-400 flex flex-col gap-1">
                           <span className="truncate max-w-[120px]" title={k.boundDeviceId}>{k.boundDeviceId}</span>
                           <button onClick={() => handleResetHwid(k.id)} className="text-[10px] text-rog-red hover:text-white hover:underline text-left uppercase">
                             [RESET_BINDING]
                           </button>
                         </div>
                       ) : (
                         <span className="text-xs text-gray-600 italic tracking-wider">AWAITING_BINDING</span>
                       )}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-gray-400">{formatDate(k.expiresAt)}</span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleCopy(k.key, k.id)} className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="COPY">
                             {copiedId === k.id ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleToggle(k.id)} disabled={isExpired || isBanned} className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-30">
                             {k.status === KeyStatus.ACTIVE ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleBan(k.id)} className="p-2 hover:bg-red-900/30 text-gray-400 hover:text-rog-red transition-colors">
                             <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(k.id)} className="p-2 hover:bg-red-900/30 text-gray-400 hover:text-rog-red transition-colors">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeyManager;