import React, { useState } from 'react';
import { Check, Copy, Server, ShieldAlert, BookOpen, Globe, Key, AlertTriangle, FolderTree, FileCode, Lock, Terminal, Smartphone, Wifi } from 'lucide-react';

const PROJECT_ID = "key-generator-93f89";
const API_ENDPOINT = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/validateKey`;
const API_SECRET = "ROG_MASTER_KEY_V2";

const ApiSection: React.FC = () => {
  const [showGuide, setShowGuide] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'termux'>('termux');

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(API_ENDPOINT);
    alert("URL Copied!");
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
           <p className="text-xs text-gray-400 mt-1 font-mono">BACKEND CONTROLLER</p>
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
              <div className="bg-black p-3 rounded border border-gray-800 font-mono text-[11px] md:text-xs text-white break-all select-all mb-3 shadow-inner flex items-center justify-between gap-2">
                  <span className="truncate">{API_ENDPOINT}</span>
                  <button onClick={handleCopyUrl} className="p-1 hover:text-rog-red"><Copy className="w-3 h-3"/></button>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-[10px] font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">POST</span>
                  <span className="text-[10px] font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">JSON</span>
                  <span className="text-[9px] text-gray-500 ml-auto font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Deploy to Activate
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

      {/* Deployment Guide */}
      {showGuide && (
          <div className="bg-[#1a1a1d] border border-rog-border rounded-sm animate-slide-up flex flex-col">
              
              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                  <button 
                    onClick={() => setActiveTab('termux')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-r border-gray-800 ${activeTab === 'termux' ? 'bg-rog-red text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                      <Smartphone className="w-4 h-4" /> Termux Guide (Android)
                  </button>
                  <button 
                    onClick={() => setActiveTab('files')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === 'files' ? 'bg-rog-red text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                      <FolderTree className="w-4 h-4" /> File Structure
                  </button>
              </div>

              {/* Content */}
              <div className="p-6">
                  
                  {/* TERMUX GUIDE */}
                  {activeTab === 'termux' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <h4 className="text-rog-red font-bold uppercase text-xs tracking-widest mb-4">A-to-Z Setup Instructions</h4>
                              
                              <div className="relative pl-6 border-l border-gray-800 space-y-6">
                                  {[
                                      { 
                                          step: "01", 
                                          title: "Update & Install Node.js", 
                                          cmd: "pkg update && pkg upgrade -y && pkg install nodejs -y",
                                          desc: "Ensures your Termux environment is ready."
                                      },
                                      { 
                                          step: "02", 
                                          title: "Install Firebase Tools", 
                                          cmd: "npm install -g firebase-tools",
                                          desc: "Installs the Google Cloud CLI tool."
                                      },
                                      { 
                                          step: "03", 
                                          title: "Login to Google", 
                                          cmd: "firebase login --no-localhost",
                                          desc: "Follow the link provided in terminal to auth your account."
                                      },
                                      { 
                                          step: "04", 
                                          title: "Initialize Project", 
                                          cmd: "firebase init functions",
                                          desc: "Select 'Use existing project' -> Choose your project ID."
                                      },
                                      { 
                                          step: "05", 
                                          title: "Deploy Backend", 
                                          cmd: "firebase deploy --only functions",
                                          desc: "Uploads the 'functions/index.js' code to the cloud."
                                      }
                                  ].map((item) => (
                                      <div key={item.step} className="group">
                                          <div className="absolute -left-[9px] mt-1.5 w-4 h-4 bg-gray-900 border border-gray-600 rounded-full group-hover:border-rog-red transition-colors"></div>
                                          <div className="mb-1 flex items-center justify-between">
                                              <span className="text-xs font-bold text-white">{item.step}. {item.title}</span>
                                          </div>
                                          <div className="bg-black p-3 rounded border border-gray-800 flex items-center justify-between gap-2 mb-1 group-hover:border-gray-600 transition-colors">
                                              <code className="text-green-500 font-mono text-[10px] break-all">{item.cmd}</code>
                                              <button 
                                                onClick={() => {navigator.clipboard.writeText(item.cmd); alert('Command Copied!');}} 
                                                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                              >
                                                  <Copy className="w-3 h-3 text-gray-500 hover:text-white" />
                                              </button>
                                          </div>
                                          <p className="text-[10px] text-gray-500">{item.desc}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          <div className="bg-[#0a0a0c] p-5 border border-gray-800 rounded flex flex-col items-center justify-center text-center h-fit">
                              <div className="bg-rog-red/10 p-4 rounded-full mb-4 animate-pulse-glow">
                                  <Terminal className="w-8 h-8 text-rog-red" />
                              </div>
                              <h4 className="text-white font-bold mb-2">Deployment Status</h4>
                              <p className="text-xs text-gray-500 mb-6 max-w-[250px]">
                                  After running "firebase deploy", check the Dashboard tab. The "Latency" indicator will show "Online" if the connection is successful.
                              </p>
                              <div className="text-[10px] font-mono text-gray-600 bg-black p-2 rounded border border-gray-800 w-full">
                                  Expected Output:<br/>
                                  <span className="text-green-500">✔ Deploy complete!</span><br/>
                                  <span className="text-gray-500">Function URL (validateKey): https://...</span>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* FILES GUIDE */}
                  {activeTab === 'files' && (
                      <div className="flex flex-col md:flex-row gap-8">
                          <div className="bg-[#0a0a0c] p-6 border border-gray-800 rounded w-full md:w-1/3 font-mono text-xs text-gray-400 shrink-0">
                              <p className="text-rog-red mb-4 font-bold uppercase tracking-widest text-[10px]">PROJECT FILE TREE:</p>
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
                                  <strong className="text-white">NOTE:</strong> The `functions/index.js` file is already part of this project's code. You just need to initialize firebase and deploy.
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default ApiSection;