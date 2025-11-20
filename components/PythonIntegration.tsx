import React, { useState } from 'react';
import { Check, Copy, Code2, RefreshCw, Globe, ArrowRight, Database } from 'lucide-react';

const PythonIntegration: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
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
    even if system commands fail or return dynamic values (common on Termux/Android).
    """
    LOCK_FILE = "hwid.lock"
    
    # 1. Return existing locked ID if available
    if os.path.exists(LOCK_FILE):
        try:
            with open(LOCK_FILE, "r") as f:
                saved_id = f.read().strip()
                if saved_id:
                    return saved_id
        except:
            pass # If read fails, regenerate

    # 2. Generate new ID (System based or Random)
    system = platform.system()
    raw_id = None
    
    try:
        if system == "Windows":
            # Reliable Windows UUID
            raw_id = subprocess.check_output("wmic csproduct get uuid", shell=True).decode().split("\\n")[1].strip()
        elif system == "Linux":
            # Reliable Linux Machine ID
            if os.path.exists("/etc/machine-id"):
                with open("/etc/machine-id", "r") as f:
                    raw_id = f.read().strip()
            elif os.path.exists("/var/lib/dbus/machine-id"):
                 with open("/var/lib/dbus/machine-id", "r") as f:
                    raw_id = f.read().strip()
        elif system == "Darwin": # macOS
            cmd = "ioreg -d2 -c IOPlatformExpertDevice | awk -F\\\" '/IOPlatformUUID/{print $(NF-1)}'"
            raw_id = subprocess.check_output(cmd, shell=True).decode().strip()
    except Exception:
        pass # Command failed (likely Termux or Restricted Env)
        
    if not raw_id:
        # Fallback: Generate random UUID
        # This becomes stable because we save it to the lock file below.
        raw_id = str(uuid.uuid4())
        
    # 3. Hash and Save to Lock File
    final_hwid = hashlib.sha256(raw_id.encode()).hexdigest()
    
    try:
        with open(LOCK_FILE, "w") as f:
            f.write(final_hwid)
    except:
        print("[!] Warning: Could not save hwid.lock. ID might change on next run.")
        
    return final_hwid

def validate_license(key_input):
    """
    Validates key directly against Firestore using REST API.
    Performs 1-Device Binding logic client-side securely.
    """
    hwid = get_hwid()
    print(f"[*] Hardware ID: {hwid[:8]}...")
    print(f"[*] Checking Database...")

    # 1. SEARCH FOR KEY (Using runQuery to find document by 'key' field)
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

        # Check if document exists
        if not data or not data[0].get('document'):
            print("[-] INVALID KEY: Key not found in database.")
            return False

        doc = data[0]['document']
        doc_id = doc['name'].split('/')[-1] # Extract Document ID
        fields = doc.get('fields', {})

        # 2. PARSE FIELDS
        status = fields.get('status', {}).get('stringValue', 'UNKNOWN')
        bound_hwid = fields.get('boundDeviceId', {}).get('stringValue', None)
        expires_at = fields.get('expiresAt', {}).get('integerValue', None) # Timestamp (ms)
        
        # 3. VALIDATION CHECKS
        
        # Check Status
        if status != 'ACTIVE':
            print(f"[-] ACCESS DENIED: Key is {status}")
            return False

        # Check Expiration
        if expires_at:
            current_ms = int(time.time() * 1000)
            if current_ms > int(expires_at):
                print("[-] ACCESS DENIED: Key has expired.")
                return False

        # 4. DEVICE BINDING LOGIC
        if bound_hwid:
            if bound_hwid != hwid:
                print("[-] HWID MISMATCH: Key is bound to another device.")
                return False
            else:
                print("[+] DEVICE VERIFIED: HWID Matches.")
        else:
            print("[*] BINDING KEY TO THIS DEVICE...")
            # PATCH request to bind HWID
            update_url = f"{BASE_URL}/keys/{doc_id}?updateMask.fieldPaths=boundDeviceId&key={API_KEY}"
            patch_body = {
                "fields": {
                    "boundDeviceId": {"stringValue": hwid}
                }
            }
            patch_res = requests.patch(update_url, json=patch_body)
            if patch_res.status_code != 200:
                print("[!] BINDING FAILED. Check Firestore Rules.")
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pythonCode);
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
                <h1 className="text-xl font-bold text-white tracking-wider italic uppercase">Python Integration</h1>
             </div>
             <p className="text-xs text-gray-400 font-mono">DIRECT FIRESTORE MODE (NO BACKEND)</p>
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
                      This script connects directly to Google Firestore using the REST API. 
                      It does not require a backend server or Cloud Functions.
                  </p>
                  <div className="text-[10px] font-mono bg-black p-3 rounded border border-gray-800 text-gray-300">
                      Endpoint: <span className="text-green-500">firestore.googleapis.com</span>
                  </div>
              </div>

              {/* Guide */}
              <div className="bg-[#1a1a1d] border border-rog-border rounded-sm overflow-hidden">
                  <button 
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                      <span className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                          <Globe className="w-4 h-4 text-rog-red" /> Quick Start
                      </span>
                      <ArrowRight className={`w-4 h-4 text-gray-500 transition-transform ${showInstructions ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showInstructions && (
                      <div className="p-4 space-y-4 border-t border-gray-800">
                          <div className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-rog-red/20 text-rog-red flex items-center justify-center text-[10px] font-bold border border-rog-red/50 shrink-0 mt-0.5">1</div>
                              <div>
                                  <div className="text-xs font-bold text-white mb-1">Copy Code</div>
                                  <p className="text-[10px] text-gray-500">Copy the Python script to a file named <code className="text-white">loader.py</code>.</p>
                              </div>
                          </div>
                          
                          <div className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-rog-red/20 text-rog-red flex items-center justify-center text-[10px] font-bold border border-rog-red/50 shrink-0 mt-0.5">2</div>
                              <div>
                                  <div className="text-xs font-bold text-white mb-1">Install Requests</div>
                                  <div className="text-[10px] text-gray-500 font-mono bg-black p-1.5 rounded border border-gray-800">pip install requests</div>
                              </div>
                          </div>

                          <div className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-rog-red/20 text-rog-red flex items-center justify-center text-[10px] font-bold border border-rog-red/50 shrink-0 mt-0.5">3</div>
                              <div>
                                  <div className="text-xs font-bold text-white mb-1">Set Rules</div>
                                  <p className="text-[10px] text-gray-500">Go to the <strong>SERVER</strong> tab and copy the Security Rules to your Firebase Console.</p>
                              </div>
                          </div>
                      </div>
                  )}
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
                    <span className="ml-2 text-xs text-gray-400 font-mono">loader.py</span>
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
                    <code>{pythonCode}</code>
                </pre>
             </div>
          </div>

      </div>
    </div>
  );
};

export default PythonIntegration;