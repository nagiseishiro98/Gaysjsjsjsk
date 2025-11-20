import React, { useState, useEffect } from 'react';
import { Check, Copy, Terminal, Code2, Server } from 'lucide-react';

const PythonIntegration: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://your-api-endpoint.com');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const pythonCode = `import requests
import sys
import time
import uuid
import hashlib
import platform

# ==========================================
# ROG ADMIN CLIENT LOADER
# ==========================================
# REPLACE THIS with your actual deployed Cloud Function URL
API_URL = "${baseUrl}/api/validate" 
APP_NAME = "SECURE_APP_V1"

def get_hwid():
    """
    Generates a stable Hardware ID based on MAC address and Platform info.
    hashed via SHA256 for security.
    """
    mac = uuid.getnode()
    system_info = platform.system() + platform.release() + platform.version()
    raw_id = f"{mac}-{system_info}"
    return hashlib.sha256(raw_id.encode()).hexdigest()

def validate_key(license_key):
    """
    Sends Key + HWID to server for validation.
    """
    hwid = get_hwid()
    print(f"[*] Generating Session ID (HWID)...")
    print(f"[*] Verifying Key: {license_key} ...")
    
    payload = {
        "key": license_key,
        "hwid": hwid,
        "app_name": APP_NAME
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("valid") is True:
                expiration = data.get("expires_at", "LIFETIME")
                print(f"[+] LOGIN SUCCESSFUL. Expiration: {expiration}")
                return True
            else:
                reason = data.get("message", "Unknown Error")
                print(f"[-] LOGIN FAILED: {reason}")
                return False
                
        elif response.status_code == 403:
            print("[-] ACCESS DENIED: " + response.json().get("message", "Forbidden"))
            return False
        elif response.status_code == 404:
            print("[-] ACCESS DENIED: Key not found.")
            return False
        else:
            print(f"[-] Server Error: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"[-] Connection failed: {e}")
        print("    (Ensure your API URL is correct and Server Code is deployed)")
        return False

def main_program():
    """
    The actual application code runs here after successful validation.
    """
    print("\\n" + "="*40)
    print(f" WELCOME TO {APP_NAME}")
    print("="*40)
    print("[*] Loading assets...")
    time.sleep(1)
    print("[*] System ready.")
    # Your main logic here...
    input("\\nPress Enter to exit...")

if __name__ == "__main__":
    print("--- SECURITY LOADER ---")
    user_key = input("Enter License Key: ").strip().upper()
    
    if validate_key(user_key):
        main_program()
    else:
        print("[-] Exiting due to invalid license.")
        time.sleep(2)
        sys.exit(1)`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full md:p-8 p-4 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-rog-panel p-6 border-b border-rog-red/30">
        <div>
           <h2 className="text-xl font-bold uppercase italic tracking-wider text-white flex items-center gap-2">
               <Code2 className="w-6 h-6 text-rog-red" />
               Client Loader Script
           </h2>
           <p className="text-xs text-gray-400 mt-1 font-mono">PYTHON 3.X // HWID BINDING INCLUDED</p>
        </div>

        <button 
            onClick={handleCopy}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all clip-angle ${copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED' : 'COPY CODE'}
        </button>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 bg-[#08080a] border border-gray-800 relative flex flex-col shadow-2xl font-mono rounded-sm overflow-hidden">
         {/* Terminal Top Bar */}
         <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1d] border-b border-gray-800">
            <div className="flex items-center">
                <Terminal className="w-3 h-3 text-gray-500 mr-2" />
                <span className="text-xs text-gray-400 tracking-widest uppercase">loader.py</span>
            </div>
            <div className="flex items-center gap-2">
                 <Server className="w-3 h-3 text-rog-red" />
                 <span className="text-[10px] text-gray-500">API: {baseUrl}</span>
            </div>
         </div>
         
         {/* Code Area */}
         <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            <pre className="text-sm text-gray-300 leading-relaxed selection:bg-rog-red selection:text-white">
                <code style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                    {pythonCode}
                </code>
            </pre>
         </div>
      </div>
    </div>
  );
};

export default PythonIntegration;