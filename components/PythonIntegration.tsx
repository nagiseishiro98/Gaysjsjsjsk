import React, { useState } from 'react';
import { Check, Copy, Code2, RefreshCw, Globe, ArrowRight, Database, Terminal } from 'lucide-react';

const PythonIntegration: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
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
from datetime import datetime

# ====================================================
# ROG ADMIN - DIRECT FIRESTORE CLIENT
# ====================================================

# CONFIGURATION
PROJECT_ID = "${PROJECT_ID}"
API_KEY = "${API_KEY}"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

def get_hwid():
    """
    Generates a stable Hardware ID.
    Uses a 'hwid.lock' file to guarantee the ID never changes for this installation,
    even if system commands fail or return dynamic values.
    """
    LOCK_FILE = "hwid.lock"
    
    if os.path.exists(LOCK_FILE):
        try:
            with open(LOCK_FILE, "r") as f:
                saved_id = f.read().strip()
                if saved_id: return saved_id
        except: pass

    system = platform.system()
    raw_id = None
    
    try:
        if system == "Windows":
            raw_id = subprocess.check_output("wmic csproduct get uuid", shell=True).decode().split("\\n")[1].strip()
        elif system == "Linux":
            if os.path.exists("/etc/machine-id"):
                with open("/etc/machine-id", "r") as f: raw_id = f.read().strip()
            elif os.path.exists("/var/lib/dbus/machine-id"):
                 with open("/var/lib/dbus/machine-id", "r") as f: raw_id = f.read().strip()
        elif system == "Darwin": 
            cmd = "ioreg -d2 -c IOPlatformExpertDevice | awk -F\\\" '/IOPlatformUUID/{print $(NF-1)}'"
            raw_id = subprocess.check_output(cmd, shell=True).decode().strip()
    except Exception: pass
        
    if not raw_id: raw_id = str(uuid.uuid4())
        
    final_hwid = hashlib.sha256(raw_id.encode()).hexdigest()
    
    try:
        with open(LOCK_FILE, "w") as f: f.write(final_hwid)
    except: pass
        
    return final_hwid

def validate_license(key_input):
    """
    Validates key directly against Firestore using REST API.
    Performs 1-Device Binding logic client-side securely.
    """
    hwid = get_hwid()
    device_name = socket.gethostname()
    
    print(f"[*] Hostname:    {device_name}")
    print(f"[*] Hardware ID: {hwid[:8]}...")
    print(f"[*] Connecting to Database...")

    # 1. SEARCH FOR KEY
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
            print("[-] INVALID KEY: Key not found in database.")
            return False

        doc = data[0]['document']
        doc_id = doc['name'].split('/')[-1]
        fields = doc.get('fields', {})

        # 2. PARSE FIELDS
        status = fields.get('status', {}).get('stringValue', 'UNKNOWN')
        bound_hwid = fields.get('boundDeviceId', {}).get('stringValue', None)
        expires_at = fields.get('expiresAt', {}).get('integerValue', None) 
        
        # 3. VALIDATION CHECKS
        if status != 'ACTIVE':
            print(f"[-] ACCESS DENIED: Key is {status}")
            return False

        if expires_at:
            if int(time.time() * 1000) > int(expires_at):
                print("[-] ACCESS DENIED: Key has expired.")
                return False

        # 4. DEVICE BINDING LOGIC
        if bound_hwid:
            if bound_hwid != hwid:
                print(f"[-] HWID MISMATCH: Key bound to another device.")
                return False
            else:
                print("[+] DEVICE VERIFIED: HWID Matches.")
        else:
            print(f"[*] BINDING KEY TO: {device_name}...")
            # PATCH request to bind HWID AND Device Name
            update_url = f"{BASE_URL}/keys/{doc_id}?updateMask.fieldPaths=boundDeviceId&updateMask.fieldPaths=deviceName&key={API_KEY}"
            patch_body = {
                "fields": {
                    "boundDeviceId": {"stringValue": hwid},
                    "deviceName": {"stringValue": device_name}
                }
            }
            patch_res = requests.patch(update_url, json=patch_body)
            if patch_res.status_code != 200:
                print("[!] BINDING FAILED. Check Firestore Rules.")
                print(patch_res.text)
                return False
            print("[+] BINDING SUCCESSFUL.")

        # 5. SUCCESS
        print("="*40)
        print(" ACCESS GRANTED - WELCOME USER")
        print("="*40)
        return True

    except Exception as e:
        print(f"[!] CONNECTION ERROR: {e}")
        return False

if __name__ == "__main__":
    print("--- ROG ADMIN VALIDATOR ---")
    key = input("Enter License Key: ").strip().upper()
    if validate_license(key):
        print(">>> LAUNCHING APPLICATION...")
        # Your payload code here
    else:
        print(">>> CLOSING...")
        sys.exit()
`;

  const bashCode = `#!/bin/bash
# ROG ADMIN // HWID GENERATOR
# Use this to get the HWID for Manual Key Binding

get_hwid() {
    local raw_id=""
    
    # 1. Try to get stable System ID
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/machine-id ]; then
            raw_id=$(cat /etc/machine-id)
        elif [ -f /var/lib/dbus/machine-id ]; then
            raw_id=$(cat /var/lib/dbus/machine-id)
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        raw_id=$(ioreg -d2 -c IOPlatformExpertDevice | awk -F\\" '/IOPlatformUUID/{print $(NF-1)}')
    fi

    # 2. Fallback if empty
    if [ -z "$raw_id" ]; then
        # Try uuidgen if available
        if command -v uuidgen &> /dev/null; then
            raw_id=$(uuidgen)
        else
            # Weak fallback using date
            raw_id=$(date +%s%N) 
        fi
    fi

    # 3. Sanitize
    raw_id=$(echo "$raw_id" | tr -d '[:space:]')

    # 4. Hash (SHA256) to match Python Client
    if command -v sha256sum &> /dev/null; then
        echo -n "$raw_id" | sha256sum | awk '{print $1}'
    elif command -v shasum &> /dev/null; then
        echo -n "$raw_id" | shasum -a 256 | awk '{print $1}'
    else
        # Fallback to python for hashing if installed
        python3 -c "import hashlib; print(hashlib.sha256('$raw_id'.encode()).hexdigest())" 2>/dev/null
    fi
}

echo "------------------------------------------------"
echo " ROG ADMIN // MANUAL BINDING TOOL"
echo "------------------------------------------------"
HWID=$(get_hwid)

if [ -z "$HWID" ]; then
  echo "Error: Could not generate HWID."
else
  echo "HOSTNAME: $(hostname)"
  echo "HWID:     $HWID"
  echo "------------------------------------------------"
  echo ">> Copy 'HWID' and use it in the Admin Panel."
fi
`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeTab === 'python' ? pythonCode : bashCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full md:p-0 p-4 animate-slide-in pb-20 md:pb-8">
      
      {/* Top Bar */}
      <div className="bg-[#121214] border-b border-rog-red/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
         <div>
             <div className="flex items-center gap-2 mb-1">
                <Code2 className="w-6 h-6 text-rog-red" />
                <h1 className="text-xl font-bold text-white tracking-wider italic uppercase">Integration</h1>
             </div>
             <p className="text-xs text-gray-400 font-mono">CLIENT SCRIPTS & TOOLS</p>
         </div>

         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-black/50 border border-gray-800 p-2 rounded flex items-center gap-3 px-4">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#0f0]"></div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Serverless</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-4 space-y-6 h-full">
              
              <div className="bg-[#1a1a1d] border border-rog-border p-5 rounded-sm">
                  <h3 className="text-rog-red font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                      <Database className="w-4 h-4" /> How it works
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      The Python script connects directly to Firestore. It automatically captures the user's 
                      <strong className="text-white mx-1">Hostname</strong> and 
                      <strong className="text-white mx-1">HWID</strong> to lock the key to their specific device.
                  </p>
                  <div className="text-[10px] font-mono bg-black p-3 rounded border border-gray-800 text-gray-300">
                      Endpoint: <span className="text-green-500">firestore.googleapis.com</span>
                  </div>
              </div>

              {/* Tab Selector */}
              <div className="bg-[#1a1a1d] border border-rog-border p-2 rounded-sm flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">Select Tool</div>
                  
                  <button 
                    onClick={() => setActiveTab('python')}
                    className={`p-3 rounded text-left flex items-center gap-3 transition-all border ${activeTab === 'python' ? 'bg-rog-red/10 border-rog-red text-white' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                  >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${activeTab === 'python' ? 'bg-rog-red text-white' : 'bg-[#222]'}`}>
                          <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="text-xs font-bold uppercase">Python Client</div>
                          <div className="text-[9px] opacity-60">Main Loader Script</div>
                      </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('bash')}
                    className={`p-3 rounded text-left flex items-center gap-3 transition-all border ${activeTab === 'bash' ? 'bg-rog-red/10 border-rog-red text-white' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}
                  >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${activeTab === 'bash' ? 'bg-rog-red text-white' : 'bg-[#222]'}`}>
                          <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="text-xs font-bold uppercase">Bash Generator</div>
                          <div className="text-[9px] opacity-60">Get HWID for Manual Bind</div>
                      </div>
                  </button>
              </div>
          </div>

          {/* Right Column: Code Editor */}
          <div className="lg:col-span-8 flex flex-col h-[600px] lg:h-full min-h-[500px] bg-[#08080a] border border-gray-800 rounded-sm shadow-2xl">
             <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1d] border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-400 font-mono">
                        {activeTab === 'python' ? 'loader.py' : 'get_hwid.sh'}
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
          </div>

      </div>
    </div>
  );
};

export default PythonIntegration;