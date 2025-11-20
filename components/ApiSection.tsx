import React, { useState } from 'react';
import { Copy, Shield, Database, AlertTriangle, Lock, Eye, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Configuration from your mockDb.ts
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBTKlUci5WyWwFw3FBriWWjC2AgmuH1TmY",
  projectId: "key-generator-93f89",
};

const ApiSection: React.FC = () => {
  const [copiedRule, setCopiedRule] = useState(false);

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // KEYS COLLECTION
    match /keys/{keyId} {
      // 1. ADMIN ACCESS (Authenticated Users)
      // Full access to create, read, update, delete
      allow read, write: if request.auth != null;
      
      // 2. PUBLIC ACCESS (Python Client / Unauthenticated)
      // Allow validating keys (Read Only)
      allow get, list: if true;
      
      // Allow binding device (Restricted Update)
      // Only allows updating specific fields for device locking
      // Denies creating new keys or deleting existing ones
      allow update: if request.auth == null 
                    && request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['boundDeviceId', 'deviceName', 'lastUsed', 'ip']);
    }
  }
}`;

  const handleCopyRules = async () => {
    await navigator.clipboard.writeText(firestoreRules);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full md:p-8 p-4 pb-24 md:pb-8 overflow-visible"
    >
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-rog-panel p-6 border-b border-rog-red/30">
        <div>
           <h2 className="text-xl font-bold uppercase italic tracking-wider text-white flex items-center gap-2">
               <Database className="w-6 h-6 text-rog-red" />
               Database Config
           </h2>
           <p className="text-xs text-gray-400 mt-1 font-mono">DIRECT FIRESTORE CONNECTION</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* Column 1: Credentials */}
          <motion.div variants={itemVariants} className="space-y-6">
              
              {/* Alert */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-orange-500/10 border border-orange-500/30 p-4 rounded flex gap-3 items-start transition-transform"
              >
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                      <h4 className="text-orange-500 font-bold text-xs uppercase tracking-wider mb-1">Serverless Mode Active</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                          You are using <strong>Direct Firestore</strong> mode. The Python client connects directly to Google's servers. 
                          No hosting or backend setup is required.
                      </p>
                  </div>
              </motion.div>

              {/* Config Card */}
              <div className="bg-[#1a1a1d] border border-rog-border p-5 rounded-sm hover:border-gray-700 transition-colors duration-300">
                  <h3 className="text-rog-red font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Public Credentials
                  </h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold block mb-1.5">PROJECT ID</label>
                          <div className="bg-black border border-gray-800 p-3 rounded text-xs text-white font-mono flex justify-between items-center group transition-all hover:border-rog-red/50">
                              <span>{FIREBASE_CONFIG.projectId}</span>
                              <button onClick={() => navigator.clipboard.writeText(FIREBASE_CONFIG.projectId)} className="text-gray-600 hover:text-white"><Copy className="w-3 h-3"/></button>
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] text-gray-500 font-bold block mb-1.5">WEB API KEY</label>
                          <div className="bg-black border border-gray-800 p-3 rounded text-xs text-green-500 font-mono flex justify-between items-center group transition-all hover:border-green-500/50">
                              <span>{FIREBASE_CONFIG.apiKey}</span>
                              <button onClick={() => navigator.clipboard.writeText(FIREBASE_CONFIG.apiKey)} className="text-gray-600 hover:text-white"><Copy className="w-3 h-3"/></button>
                          </div>
                      </div>
                  </div>
              </div>
          </motion.div>

          {/* Column 2: Security Rules */}
          <motion.div variants={itemVariants} className="flex flex-col min-h-[500px] h-auto lg:h-full pb-4 lg:pb-0">
              <div className="bg-[#1a1a1d] border border-rog-border rounded-sm flex flex-col h-full overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-shadow duration-300">
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#151518]">
                      <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-rog-red" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Firestore Rules</span>
                      </div>
                      <button 
                        onClick={handleCopyRules}
                        className="flex items-center gap-2 text-[10px] bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors font-bold uppercase"
                      >
                          {copiedRule ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                          {copiedRule ? 'Copied' : 'Copy Rules'}
                      </button>
                  </div>
                  
                  <div className="relative flex-1 bg-[#0e0e10]">
                      <div className="absolute inset-0 overflow-auto custom-scrollbar p-4">
                          <pre className="text-[10px] md:text-xs font-mono text-gray-300 whitespace-pre-wrap">
                              {firestoreRules}
                          </pre>
                      </div>
                  </div>

                  <div className="p-3 bg-[#151518] border-t border-gray-800">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Eye className="w-3 h-3" />
                          <span>Paste this in Firebase Console &gt; Firestore &gt; Rules</span>
                      </div>
                  </div>
              </div>
          </motion.div>

      </div>
    </motion.div>
  );
};

export default ApiSection;