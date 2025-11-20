import React, { useState } from 'react';
import { Check, Copy, Code2, Terminal, ShieldCheck, Server, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PythonIntegration: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'bash'>('node');
  
  const PROJECT_ID = "key-generator-93f89"; 
  const API_KEY = "AIzaSyBTKlUci5WyWwFw3FBriWWjC2AgmuH1TmY";

  // 1. PYTHON SCRIPT (Optimized - No Pip)
  const pythonCode = `import json
import uuid
import hashlib
import platform
import sys
import time
import os
import subprocess
import socket
from urllib.request import Request, urlopen

# ====================================================
# ROG ADMIN - OPTIMIZED CLIENT (NO PIP REQUIRED)
# ====================================================

PROJECT_ID = "${PROJECT_ID}"
API_KEY = "${API_KEY}"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

def get_hwid():
    """Generates a stable Hardware ID without external deps."""
    try:
        if platform.system() == "Windows":
            return subprocess.check_output("wmic csproduct get uuid", shell=True).decode().split("\\n")[1].strip()
        elif platform.system() == "Linux": 
            if os.path.exists("/etc/machine-id"):
                with open("/etc/machine-id", "r") as f: return f.read().strip()
    except: pass
    return hashlib.sha256(str(uuid.getnode()).encode()).hexdigest()

def request(url, method="GET", payload=None):
    """Lightweight HTTP Client using standard library."""
    try:
        req = Request(url, method=method)
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(payload).encode() if payload else None
        with urlopen(req, data=data, timeout=10) as res:
            return json.loads(res.read().decode())
    except Exception as e:
        return None

def validate_license():
    print("\\n[ ROG SECURITY PROTOCOL ]")
    key = input("ENTER LICENSE KEY: ").strip().upper()
    hwid = get_hwid()
    
    print(f"[+] CHECKING ID: {hwid[:8]}...")

    # 1. Query Key
    query = {
        "structuredQuery": {
            "from": [{"collectionId": "keys"}],
            "where": {"fieldFilter": {"field": {"fieldPath": "key"}, "op": "EQUAL", "value": {"stringValue": key}}},
            "limit": 1
        }
    }
    
    data = request(f"{BASE_URL}:runQuery?key={API_KEY}", "POST", query)
    
    if not data or 'document' not in data[0]:
        print("[!] ACCESS DENIED: INVALID KEY")
        return False

    doc = data[0]['document']
    doc_id = doc['name'].split('/')[-1]
    fields = doc.get('fields', {})
    
    status = fields.get('status', {}).get('stringValue', 'UNKNOWN')
    bound_hwid = fields.get('boundDeviceId', {}).get('stringValue', None)
    expires = fields.get('expiresAt', {}).get('integerValue', None)

    if status != 'ACTIVE':
        print(f"[!] KEY STATUS: {status}")
        return False

    if expires and int(time.time() * 1000) > int(expires):
        print("[!] KEY EXPIRED")
        return False

    if bound_hwid:
        if bound_hwid != hwid:
            print("[!] HWID MISMATCH (Key bound to another device)")
            return False
    else:
        print("[*] BINDING DEVICE...")
        update_url = f"{BASE_URL}/keys/{doc_id}?updateMask.fieldPaths=boundDeviceId&updateMask.fieldPaths=deviceName&key={API_KEY}"
        patch_data = {"fields": {"boundDeviceId": {"stringValue": hwid}, "deviceName": {"stringValue": socket.gethostname()}}}
        if not request(update_url, "PATCH", patch_data):
            print("[!] BINDING FAILED")
            return False

    print("[+] ACCESS GRANTED")
    return True

if __name__ == "__main__":
    if validate_license():
        print("\\n>>> LAUNCHING PAYLOAD...")
        # YOUR CODE HERE
    else:
        sys.exit(1)
`;

  // 2. NODE.JS SCRIPT (Termux Friendly)
  const nodeCode = `const https = require('https');
const crypto = require('crypto');
const readline = require('readline');
const os = require('os');

// ====================================================
// ROG ADMIN - TERMUX / NODE CLIENT
// ====================================================

const PROJECT_ID = "${PROJECT_ID}";
const API_KEY = "${API_KEY}";
const BASE_URL = \`https://firestore.googleapis.com/v1/projects/\${PROJECT_ID}/databases/(default)/documents\`;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

function getHWID() {
    try {
        // Simple stable ID for Termux
        const cpus = os.cpus();
        const info = (cpus[0]?.model || '') + os.totalmem() + os.arch();
        return crypto.createHash('sha256').update(info).digest('hex');
    } catch(e) {
        return crypto.randomUUID().replace(/-/g, '');
    }
}

function request(url, method, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method, headers: {'Content-Type': 'application/json'} }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch(e) { resolve({}); }
            });
        });
        req.on('error', reject);
        if(data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log("\\n[ ROG NODE.JS CLIENT ]");
    const key = (await ask("ENTER KEY: ")).trim().toUpperCase();
    const hwid = getHWID();
    
    console.log(\`[*] HWID: \${hwid.substring(0, 8)}...\`);

    // 1. Query Key
    const query = {
        structuredQuery: {
            from: [{collectionId: "keys"}],
            where: {fieldFilter: {field: {fieldPath: "key"}, op: "EQUAL", value: {stringValue: key}}},
            limit: 1
        }
    };

    try {
        const res = await request(\`\${BASE_URL}:runQuery?key=\${API_KEY}\`, 'POST', query);
        
        if(!res || !res[0] || !res[0].document) {
            console.log("[!] INVALID KEY");
            process.exit(1);
        }

        const doc = res[0].document;
        const docId = doc.name.split('/').pop();
        const fields = doc.fields || {};
        
        const status = fields.status?.stringValue;
        const boundHwid = fields.boundDeviceId?.stringValue;
        const expires = fields.expiresAt?.integerValue;

        if(status !== 'ACTIVE') { console.log(\`[!] KEY IS \${status}\`); process.exit(1); }
        
        if(expires && Date.now() > parseInt(expires)) { console.log("[!] EXPIRED"); process.exit(1); }

        if(boundHwid) {
            if(boundHwid !== hwid) { console.log("[!] HWID MISMATCH"); process.exit(1); }
            console.log("[+] VERIFIED");
        } else {
            console.log("[*] BINDING DEVICE...");
            const patch = { fields: { boundDeviceId: {stringValue: hwid}, deviceName: {stringValue: os.hostname()} } };
            await request(\`\${BASE_URL}/keys/\${docId}?updateMask.fieldPaths=boundDeviceId&updateMask.fieldPaths=deviceName&key=\${API_KEY}\`, 'PATCH', patch);
            console.log("[+] BOUND SUCCESSFULLY");
        }
        
        console.log("\\n>>> LAUNCHING APP...");
        // ADD YOUR LOGIC HERE
        
    } catch(e) {
        console.log("[!] ERROR:", e.message);
    } finally {
        rl.close();
    }
}

main();
`;

  const bashCode = `#!/bin/bash
# SIMPLE HWID GENERATOR

echo "-----------------------"
echo " ROG MACHINE ID"
echo "-----------------------"

if [ -f /etc/machine-id ]; then
  cat /etc/machine-id
else
  echo "Generating fallback ID..."
  echo $RANDOM | md5sum | head -c 32
fi
echo ""
`;

  const getCurrentCode = () => {
      if (activeTab === 'python') return pythonCode;
      if (activeTab === 'node') return nodeCode;
      return bashCode;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full md:p-0 p-4 pb-20 md:pb-8"
    >
      
      {/* Top Bar */}
      <motion.div variants={itemVariants} className="bg-[#121214] border-b border-rog-red/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
         <div>
             <div className="flex items-center gap-2 mb-1">
                <Code2 className="w-6 h-6 text-rog-red" />
                <h1 className="text-xl font-bold text-white tracking-wider italic uppercase">Integration</h1>
             </div>
             <p className="text-xs text-gray-400 font-mono">CLIENT SCRIPTS & TOOLS</p>
         </div>

         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-black/50 border border-gray-800 p-2 rounded flex items-center gap-3 px-4">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#0f0] animate-pulse"></div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status: Ready</div>
            </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Info */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 h-full">
              
              <div className="bg-[#1a1a1d] border border-rog-border p-5 rounded-sm hover:border-gray-600 transition-colors shadow-lg">
                  <h3 className="text-rog-red font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Client Integration
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Select your preferred environment to validate keys.
                      <br/><br/>
                      <strong className="text-white">Node.js</strong> is recommended for Termux.
                      <br/>
                      <strong className="text-white">Python</strong> is optimized for standard desktops (No PIP required).
                  </p>
              </div>

              {/* Tab Selector */}
              <div className="bg-[#1a1a1d] border border-rog-border p-2 rounded-sm flex flex-col gap-2 shadow-lg">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">Environment</div>
                  
                  <button 
                    onClick={() => setActiveTab('node')}
                    className={`p-3 rounded text-left flex items-center gap-3 transition-all border ${activeTab === 'node' ? 'bg-rog-red/10 border-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.1)]' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                  >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${activeTab === 'node' ? 'bg-rog-red text-white' : 'bg-[#222]'}`}>
                          <Server className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="text-xs font-bold uppercase">Node.js (Termux)</div>
                          <div className="text-[9px] opacity-60">Fast & Native</div>
                      </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('python')}
                    className={`p-3 rounded text-left flex items-center gap-3 transition-all border ${activeTab === 'python' ? 'bg-rog-red/10 border-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.1)]' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                  >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${activeTab === 'python' ? 'bg-rog-red text-white' : 'bg-[#222]'}`}>
                          <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="text-xs font-bold uppercase">Python</div>
                          <div className="text-[9px] opacity-60">Standard Lib Only</div>
                      </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('bash')}
                    className={`p-3 rounded text-left flex items-center gap-3 transition-all border ${activeTab === 'bash' ? 'bg-rog-red/10 border-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.1)]' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                  >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${activeTab === 'bash' ? 'bg-rog-red text-white' : 'bg-[#222]'}`}>
                          <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="text-xs font-bold uppercase">Bash</div>
                          <div className="text-[9px] opacity-60">Utils Only</div>
                      </div>
                  </button>
              </div>
          </motion.div>

          {/* Right Column: Code Editor */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col h-[600px] lg:h-full min-h-[500px] bg-[#08080a] border border-gray-800 rounded-sm shadow-2xl group perspective-1000">
             <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1d] border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-400 font-mono">
                        {activeTab === 'python' ? 'client.py' : activeTab === 'node' ? 'server.js' : 'get_hwid.sh'}
                    </span>
                </div>
                <button 
                    onClick={handleCopy}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all rounded-sm ${copied ? 'bg-green-600 text-white' : 'bg-rog-red text-white hover:bg-red-600'}`}
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIED' : 'COPY CODE'}
                </button>
             </div>
             
             <div className="flex-1 overflow-auto p-6 custom-scrollbar relative">
                <pre className="text-xs sm:text-sm text-gray-300 leading-relaxed font-mono">
                    <code>{getCurrentCode()}</code>
                </pre>
             </div>
          </motion.div>

      </div>
    </motion.div>
  );
};

export default PythonIntegration;