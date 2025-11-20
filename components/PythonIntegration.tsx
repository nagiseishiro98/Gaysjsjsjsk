import React, { useState } from 'react';
import { Check, Copy, Code2, Terminal, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PythonIntegration: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'python' | 'bash'>('python');
  
  // Config for Python Script
  const PROJECT_ID = "key-generator-93f89"; 
  const API_KEY = "AIzaSyBTKlUci5WyWwFw3FBriWWjC2AgmuH1TmY";

  const pythonCode = `import requests
import uuid
import hashlib
import platform
import sys
import json
import time
import os
import subprocess
import socket

# ====================================================
# ROG ADMIN - SIMPLE CLIENT
# ====================================================

PROJECT_ID = "${PROJECT_ID}"
API_KEY = "${API_KEY}"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

def get_hwid():
    """
    Generates a stable Hardware ID for device locking.
    """
    try:
        # Platform specific HWID fetching
        if platform.system() == "Windows":
            return subprocess.check_output("wmic csproduct get uuid", shell=True).decode().split("\\n")[1].strip()
        elif platform.system() == "Linux":
            # Try machine-id
            if os.path.exists("/etc/machine-id"):
                with open("/etc/machine-id", "r") as f: return f.read().strip()
        elif platform.system() == "Darwin": # macOS
            cmd = "ioreg -d2 -c IOPlatformExpertDevice | awk -F\\\" '/IOPlatformUUID/{print $(NF-1)}'"
            return subprocess.check_output(cmd, shell=True).decode().strip()
    except:
        pass
        
    # Fallback: Mac address based UUID
    return hashlib.sha256(str(uuid.getnode()).encode()).hexdigest()

def validate_license():
    print("--- ROG LICENSE VERIFICATION ---")
    key_input = input("Enter License Key: ").strip().upper()
    
    hwid = get_hwid()
    device_name = socket.gethostname()
    
    print(f"\\n[+] HWID: {hwid}")
    print("[*] Connecting to server...")

    # Firestore REST API Query
    query_url = f"{BASE_URL}:runQuery?key={API_KEY}"
    query_payload = {
        "structuredQuery": {
            "from": [{"collectionId": "keys"}],
            "where": {
                "fieldFilter": {
                    "field": {"fieldPath": "key"},
                    "op": "EQUAL",
                    "value": {"stringValue": key_input}
                }
            },
            "limit": 1
        }
    }

    try:
        res = requests.post(query_url, json=query_payload)
        data = res.json()

        if not data or not data[0].get('document'):
            print("[!] Error: Invalid Key")
            return False

        doc = data[0]['document']
        doc_id = doc['name'].split('/')[-1]
        fields = doc.get('fields', {})

        status = fields.get('status', {}).get('stringValue', 'UNKNOWN')
        bound_hwid = fields.get('boundDeviceId', {}).get('stringValue', None)
        expires_at = fields.get('expiresAt', {}).get('integerValue', None) 
        
        # 1. Check Status
        if status != 'ACTIVE':
            print(f"[!] Error: Key is {status}")
            return False

        # 2. Check Expiration
        if expires_at and int(time.time() * 1000) > int(expires_at):
            print("[!] Error: Key Expired")
            return False

        # 3. Check HWID Binding
        if bound_hwid:
            if bound_hwid != hwid:
                print("[!] Error: HWID Mismatch (Key bound to different device)")
                return False
            else:
                print("[+] Success: Device Verified")
        else:
            print("[*] Binding key to this device...")
            update_url = f"{BASE_URL}/keys/{doc_id}?updateMask.fieldPaths=boundDeviceId&updateMask.fieldPaths=deviceName&key={API_KEY}"
            patch_body = {
                "fields": {
                    "boundDeviceId": {"stringValue": hwid},
                    "deviceName": {"stringValue": device_name}
                }
            }
            patch_res = requests.patch(update_url, json=patch_body)
            if patch_res.status_code != 200:
                print("[!] Error: Failed to bind device")
                return False
            print("[+] Success: Device Bound")

        print("\\n[SUCCESS] Login Approved")
        return True

    except Exception as e:
        print(f"[!] Connection Error: {e}")
        return False

if __name__ == "__main__":
    if validate_license():
        print("\\n>>> STARTING APPLICATION...")
        # ADD YOUR MAIN APPLICATION LOGIC HERE
        input("Press Enter to continue...")
    else:
        print("\\n>>> ACCESS DENIED")
        sys.exit(1)
`;

  const bashCode = `#!/bin/bash
# ROG ADMIN // SIMPLE HWID TOOL

get_hwid() {
    local raw_id=""
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/machine-id ]; then raw_id=$(cat /etc/machine-id); fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        raw_id=$(ioreg -d2 -c IOPlatformExpertDevice | awk -F\\" '/IOPlatformUUID/{print $(NF-1)}')
    fi
    if [ -z "$raw_id" ]; then raw_id=$(date +%s%N); fi
    
    # Hash to SHA256
    echo -n "$raw_id" | shasum -a 256 | awk '{print $1}'
}

echo "--------------------------------"
echo " ROG ADMIN // HWID"
echo "--------------------------------"
HWID=$(get_hwid)
echo "HOSTNAME: $(hostname)"
echo "HWID:     $HWID"
echo ""
echo "Copy the HWID above to manually bind a key."
`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeTab === 'python' ? pythonCode : bashCode);
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
                      <ShieldCheck className="w-4 h-4" /> Simple Integration
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      This is a lightweight Python script that validates license keys directly against your database.
                      <br/><br/>
                      It handles <strong>HWID Binding</strong>, <strong>Expiration Checks</strong>, and <strong>Status Validation</strong> automatically.
                  </p>
              </div>

              {/* Tab Selector */}
              <div className="bg-[#1a1a1d] border border-rog-border p-2 rounded-sm flex flex-col gap-2 shadow-lg">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">Select Language</div>
                  
                  <button 
                    onClick={() => setActiveTab('python')}
                    className={`p-3 rounded text-left flex items-center gap-3 transition-all border ${activeTab === 'python' ? 'bg-rog-red/10 border-rog-red text-white shadow-[0_0_10px_rgba(255,0,60,0.1)]' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                  >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${activeTab === 'python' ? 'bg-rog-red text-white' : 'bg-[#222]'}`}>
                          <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="text-xs font-bold uppercase">Python</div>
                          <div className="text-[9px] opacity-60">Production Ready</div>
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
                          <div className="text-[9px] opacity-60">Helper Tool</div>
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
                        {activeTab === 'python' ? 'client.py' : 'get_hwid.sh'}
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
                    <code>{activeTab === 'python' ? pythonCode : bashCode}</code>
                </pre>
             </div>
          </motion.div>

      </div>
    </motion.div>
  );
};

export default PythonIntegration;