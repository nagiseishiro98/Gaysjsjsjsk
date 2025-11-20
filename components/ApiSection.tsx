import React, { useState } from 'react';
import { Check, Copy, Server, ShieldAlert, BookOpen, Globe, Key, AlertTriangle, FolderTree, FileCode, Lock, Terminal } from 'lucide-react';

const PROJECT_ID = "key-generator-93f89";
const API_ENDPOINT = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/validateKey`;
const API_SECRET = "ROG_MASTER_KEY_V2";

const SERVER_CODE = `/**
 * FILE IS NOW INCLUDED: functions/index.js
 * 
 * You do not need to copy-paste this anymore. 
 * The file has been added to your project structure.
 * 
 * TO ENABLE PYTHON ACCESS:
 * 1. Open Terminal
 * 2. Run: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// --- SECURITY CONFIGURATION ---
const API_SECRET = "${API_SECRET}"; 
// ------------------------------

exports.validateKey = functions.https.onRequest(async (req, res) => {
  // ... (See functions/index.js for full code)
});`;

const ApiSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SERVER_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full md:p-8 p-4 animate-slide-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-rog-panel p-6 border-b border-rog-red/30">
        <div>
           <h2 className="text-xl font-bold uppercase italic tracking-wider text-white flex items-center gap-2">
               <Server className="w-6 h-6 text-rog-red" />
               API & Server Config
           </h2>
           <p className="text-xs text-gray-400 mt-1 font-mono">BACKEND FILES ADDED</p>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={() => setShowGuide(!showGuide)}
                className="px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all bg-rog-black border border-rog-border hover:border-rog-red text-white"
            >
                <BookOpen className="w-4 h-4" />
                {showGuide ? 'Hide Guide' : 'Show Guide'}
            </button>
        </div>
      </div>

      {/* API Endpoint Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* URL Info */}
          <div className="bg-[#1a1a1d] border border-rog-border p-5 rounded-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Globe className="w-12 h-12 text-rog-red" />
              </div>
              <h3 className="text-rog-red font-bold uppercase tracking-widest mb-3 text-xs flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Cloud Function URL
              </h3>
              <div className="bg-black p-3 rounded border border-gray-800 font-mono text-[11px] md:text-xs text-white break-all select-all mb-3 shadow-inner">
                  {API_ENDPOINT}
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-[10px] font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">POST</span>
                  <span className="text-[10px] font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">JSON</span>
                  <span className="text-[9px] text-gray-500 ml-auto font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Requires Deployment
                  </span>
              </div>
          </div>

          {/* Security Info */}
          <div className="bg-[#1a1a1d] border border-rog-border p-5 rounded-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Lock className="w-12 h-12 text-rog-red" />
              </div>
              <h3 className="text-rog-red font-bold uppercase tracking-widest mb-3 text-xs flex items-center gap-2">
                  <Key className="w-4 h-4" /> API Keys
              </h3>
              <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs border-b border-gray-800 pb-2">
                      <span className="text-gray-500 font-bold">HEADER NAME</span>
                      <span className="font-mono text-white bg-gray-800 px-2 py-0.5 rounded">x-api-secret</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">SECRET VALUE</span>
                      <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded border border-white/20 select-all">{API_SECRET}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Deployment Guide with Visual Tree */}
      {showGuide && (
          <div className="bg-[#1a1a1d] border border-rog-border p-6 mb-6 rounded-sm animate-slide-up">
              <h3 className="text-rog-red font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FolderTree className="w-4 h-4" /> FILE STRUCTURE STATUS
              </h3>
              <div className="flex flex-col md:flex-row gap-8">
                  
                  {/* Visual File Tree */}
                  <div className="bg-[#0a0a0c] p-6 border border-gray-800 rounded w-full md:w-1/3 font-mono text-xs text-gray-400 shrink-0">
                    <p className="text-rog-red mb-4 font-bold uppercase tracking-widest text-[10px]">CURRENT PROJECT FILES:</p>
                    <div className="pl-2 border-l border-gray-800 space-y-2">
                        <div className="text-white font-bold flex items-center gap-2"><FolderTree className="w-3 h-3"/> project_root/</div>
                        <div className="pl-4 flex items-center gap-2"><FileCode className="w-3 h-3 text-gray-500"/> src/</div>
                        <div className="pl-4 flex items-center gap-2 text-white font-bold"><FolderTree className="w-3 h-3 text-rog-red"/> functions/</div>
                        <div className="pl-8 flex items-center gap-2 text-green-400 font-bold bg-green-900/20 rounded px-2 py-0.5 border border-green-900/50">
                            <Check className="w-3 h-3"/> index.js
                        </div>
                        <div className="pl-8 flex items-center gap-2 text-green-400 font-bold bg-green-900/20 rounded px-2 py-0.5 border border-green-900/50">
                            <Check className="w-3 h-3"/> package.json
                        </div>
                    </div>
                    <div className="mt-6 text-[10px] leading-relaxed text-gray-500 border-t border-gray-800 pt-4">
                        <strong className="text-white">STATUS:</strong> Backend files have been added to your workspace. You must now deploy them to the cloud.
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="flex-1 flex flex-col justify-center gap-4 text-sm font-mono text-gray-300">
                      <div className="bg-black/50 p-6 rounded border border-gray-800 h-fit relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-rog-red/5 rounded-full blur-xl pointer-events-none"></div>
                          <div className="flex items-center gap-3 mb-3 relative z-10">
                              <Terminal className="w-5 h-5 text-rog-red" />
                              <span className="font-bold text-white">FINAL STEP: DEPLOYMENT</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-4">
                              The code is now in <span className="text-white">functions/index.js</span>. Run this command in your terminal to push it to the server:
                          </p>
                          <div className="bg-black p-4 rounded border border-rog-red/30 text-white text-sm font-bold select-all shadow-[0_0_10px_rgba(255,0,60,0.1)]">
                              firebase deploy --only functions
                          </div>
                          <div className="mt-4 flex gap-2 items-center text-[10px] text-gray-500">
                             <AlertTriangle className="w-3 h-3 text-yellow-500" />
                             <span>Wait 1-2 minutes after deployment for the API to become active.</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ApiSection;