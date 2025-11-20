import React, { useState } from 'react';
import { Check, Copy, Terminal, Code2, Server, AlertTriangle, Activity, RefreshCw, Book, Globe, Lock, ArrowRight } from 'lucide-react';

const PythonIntegration: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'online' | 'offline' | 'error'>('idle');
  const [showInstructions, setShowInstructions] = useState(true);
  
  const PROJECT_ID = "key-generator-93f89"; 
  const CLOUD_FUNCTION_URL = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/validateKey`;
  const API_SECRET = "ROG_MASTER_KEY_V2";

  const pythonCode = `import requests
import sys
import time
import uuid
import hashlib
import platform
import json
import subprocess

# ==========================================
# ROG ADMIN CLIENT LOADER V3.4
# ==========================================

# CONFIGURATION
API_URL = "${CLOUD_FUNCTION_URL}"
API_SECRET = "${API_SECRET}" 
APP_NAME = "MY_SECURE_APP"

def get_hwid():
    """
    Generates a stable Hardware ID.
    Combines MAC + System Arch + OS-Specific Serial for robustness.
    """
    try:
        # 1. MAC Address (Physical Interface)
        mac = uuid.getnode()
        
        # 2. Architecture (Stable parts only)
        # We avoid platform.version() as it changes on Windows Updates
        sys_info = f"{platform.system()}-{platform.machine()}-{platform.processor()}"
        
        # 3. OS Specific UUID (The "Fingerprint")
        extra_id = "NONE"
        system = platform.system()
        
        if system == "Windows":
            try:
                # Attempt 1: Motherboard UUID via WMIC
                cmd = "wmic csproduct get uuid"
                # Output format: UUID \\n <UUID_VALUE>
                out = subprocess.check_output(cmd, shell=True).decode()
                if "UUID" in out:
                    extra_id = out.split()[-1].strip()
                
                # Attempt 2: Fallback to Disk Serial if UUID is generic/empty (Common on VMs/Custom Builds)
                if not extra_id or "FFFF" in extra_id or "0000" in extra_id:
                     cmd_disk = "wmic diskdrive get serialnumber"
                     disk_out = subprocess.check_output(cmd_disk, shell=True).decode()
                     if "SerialNumber" in disk_out:
                         extra_id = "DISK-" + disk_out.split()[-1].strip()
            except:
                pass
                
        elif system == "Linux":
            try:
                # Linux Machine ID
                with open("/etc/machine-id", "r") as f:
                    extra_id = f.read().strip()
            except:
                # Fallback to dbus id if machine-id is missing
                try:
                    with open("/var/lib/dbus/machine-id", "r") as f:
                        extra_id = f.read().strip()
                except:
                    pass
                    
        elif system == "Darwin": # macOS
            try:
                # IOPlatformUUID
                cmd = "ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID"
                out = subprocess.check_output(cmd, shell=True).decode()
                extra_id = out.split('"')[-2]
            except:
                pass

        # Combine factors for maximum stability and uniqueness
        raw_fingerprint = f"{mac}-{sys_info}-{extra_id}"
        return hashlib.sha256(raw_fingerprint.encode()).hexdigest()
    except Exception:
        return "HWID_GEN_ERROR"

def validate_key(license_key):
    """Connects to the ROG Admin Cloud Function to validate key."""
    hwid = get_hwid()
    print(f"[*] Hardware ID: {hwid[:12]}...")
    print(f"[*] Connecting to Database...")
    
    payload = {
        "key": license_key,
        "hwid": hwid
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-api-secret": API_SECRET 
    }
    
    try:
        # Set a timeout so it doesn't hang forever
        response = requests.post(API_URL, json=payload, headers=headers, timeout=10)

        # --- CRASH PREVENTER ---
        try:
            data = response.json()
        except ValueError:
            print("\\n[!] CONNECTION ERROR: The server returned HTML/Text instead of JSON.")
            print(f"    Status Code: {response.status_code}")
            print("-" * 40)
            if response.status_code == 404:
                print("    [DIAGNOSIS] The Cloud Function is NOT DEPLOYED.")
                print("    Please go to your project folder and run: firebase deploy --only functions")
            elif response.status_code == 500:
                print("    [DIAGNOSIS] Server Internal Error. Check Firebase Logs.")
            else:
                print(f"    Response: {response.text[:100]}...")
            print("-" * 40)
            return None
        # -----------------------

        # 3. HANDLE LOGIC BASED ON STATUS
        if response.status_code == 200:
            if data.get("valid") is True:
                return data # Success
            else:
                print(f"\\n[-] LOGIN DENIED: {data.get('message', 'Unknown reason')}")
                return None

        elif response.status_code == 403:
            print(f"\\n[-] ACCESS FORBIDDEN: {data.get('message')}")
            return None
            
        elif response.status_code == 404:
            # This is a logical 404 (Key missing), distinct from URL 404
            print(f"\\n[-] KEY INVALID: {data.get('message')}")
            return None
            
        else:
            print(f"\\n[!] SERVER ERROR ({response.status_code}): {data.get('message', 'Unknown')}")
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"\\n[!] NETWORK ERROR: Could not connect to server.")
        print("    Is your internet working? Is the API URL correct?")
        return None
    except requests.exceptions.Timeout:
        print(f"\\n[!] TIMEOUT: Server took too long to respond.")
        return None
    except Exception as e:
        print(f"\\n[!] UNEXPECTED ERROR: {e}")
        return None

def main_program(auth_data):
    """Run your actual application logic here after successful login."""
    print("\\n" + "="*50)
    print(f" WELCOME TO {APP_NAME}")
    print("="*50)
    # Display Data loaded from Database
    print(f"[+] Status      : AUTHORIZED")
    print(f"[+] Client Ref  : {auth_data.get('owner_note', 'N/A')}") 
    print(f"[+] Expiration  : {auth_data.get('expires_at', 'Lifetime')}")
    print(f"[+] Bound HWID  : {auth_data.get('device_id', 'N/A')[:12]}...")
    print("="*50)
    
    print("\\n[SUCCESS] Data loaded from database successfully.")
    print("[*] Starting application modules...")
    # Your app code goes here...
    input("\\nPress Enter to exit...")

if __name__ == "__main__":
    print(f"--- {APP_NAME} SECURITY LOADER ---")
    user_key = input("Enter License Key: ").strip().upper()
    
    if not user_key:
        print("[-] Error: Key cannot be empty.")
        sys.exit(1)
        
    # Attempt Validation
    auth_data = validate_key(user_key)
    
    if auth_data:
        main_program(auth_data)
    else:
        print("\\n[-] Authentication Failed. Exiting...")
        time.sleep(3)
        sys.exit(1)`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(CLOUD_FUNCTION_URL);
    alert("API URL Copied to clipboard!");
  };

  const checkServerStatus = async () => {
    setConnectionStatus('checking');
    try {
        // We send a ping to see if the function is reachable
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ping: true })
        });

        if (response.status === 200) {
            setConnectionStatus('online');
        } else if (response.status === 404) {
            // If we get a 404 on the fetch itself, it means the function URL is not deployed
            setConnectionStatus('offline');
        } else if (response.status === 403 || response.status === 401) {
            // If we get 403/401, the server is alive but rejected our ping (which is good)
            setConnectionStatus('online');
        } else {
            setConnectionStatus('error');
        }
    } catch (error) {
        // If fetch fails entirely (e.g. network error, CORS), we assume offline or blocking
        console.error("Connection check failed:", error);
        setConnectionStatus('offline');
    }
  };

  return (
    <div className="flex flex-col h-full md:p-0 p-4 animate-slide-in pb-20 md:pb-8">
      
      {/* Top Bar: Connection Info */}
      <div className="bg-[#121214] border-b border-rog-red/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
         <div>
             <div className="flex items-center gap-2 mb-1">
                <Code2 className="w-6 h-6 text-rog-red" />
                <h1 className="text-xl font-bold text-white tracking-wider italic uppercase">Python Integration</h1>
             </div>
             <p className="text-xs text-gray-400 font-mono">CONNECT YOUR APP TO THE DATABASE</p>
         </div>

         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-black/50 border border-gray-800 p-2 rounded flex items-center gap-3 min-w-[250px]">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_5px_#0f0]' : connectionStatus === 'offline' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                <div className="flex-1">
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">API Status</div>
                    <div className={`text-xs font-mono font-bold ${connectionStatus === 'online' ? 'text-green-500' : connectionStatus === 'offline' ? 'text-red-500' : 'text-gray-300'}`}>
                        {connectionStatus === 'online' ? 'SYSTEM ONLINE' : connectionStatus === 'offline' ? 'OFFLINE (NOT DEPLOYED)' : connectionStatus === 'checking' ? 'CHECKING...' : 'IDLE'}
                    </div>
                </div>
                <button onClick={checkServerStatus} className="p-2 hover:bg-white/10 rounded transition-colors">
                    <RefreshCw className={`w-3 h-3 text-gray-400 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Settings & Guide */}
          <div className="lg:col-span-4 space-y-6 h-full">
              
              {/* Connection Details Card */}
              <div className="bg-[#1a1a1d] border border-rog-border p-5 rounded-sm">
                  <h3 className="text-rog-red font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Connection Details
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="group">
                          <label className="text-[10px] text-gray-500 font-bold block mb-1.5">API ENDPOINT URL</label>
                          <div className="flex gap-2">
                              <code className="flex-1 bg-black border border-gray-800 p-2 rounded text-[10px] text-green-500 font-mono break-all">
                                  {CLOUD_FUNCTION_URL}
                              </code>
                              <button onClick={handleCopyUrl} className="p-2 bg-gray-800 hover:bg-rog-red hover:text-white text-gray-400 rounded transition-colors">
                                  <Copy className="w-3 h-3" />
                              </button>
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] text-gray-500 font-bold block mb-1.5">SECRET KEY HEADER</label>
                          <code className="block w-full bg-black border border-gray-800 p-2 rounded text-[10px] text-white font-mono">
                              {API_SECRET}
                          </code>
                      </div>
                  </div>
              </div>

              {/* Guide */}
              <div className="bg-[#1a1a1d] border border-rog-border rounded-sm overflow-hidden">
                  <button 
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                      <span className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                          <Book className="w-4 h-4 text-rog-red" /> Setup Instructions
                      </span>
                      <ArrowRight className={`w-4 h-4 text-gray-500 transition-transform ${showInstructions ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showInstructions && (
                      <div className="p-4 space-y-4 border-t border-gray-800">
                          <div className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-rog-red/20 text-rog-red flex items-center justify-center text-[10px] font-bold border border-rog-red/50 shrink-0 mt-0.5">1</div>
                              <div>
                                  <div className="text-xs font-bold text-white mb-1">Install Python & Request Lib</div>
                                  <div className="text-[10px] text-gray-500 font-mono bg-black p-1.5 rounded border border-gray-800">pip install requests</div>
                              </div>
                          </div>
                          
                          <div className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-rog-red/20 text-rog-red flex items-center justify-center text-[10px] font-bold border border-rog-red/50 shrink-0 mt-0.5">2</div>
                              <div>
                                  <div className="text-xs font-bold text-white mb-1">Create Script</div>
                                  <p className="text-[10px] text-gray-500">Copy the code on the right into a file named <span className="text-white font-mono">main.py</span>.</p>
                              </div>
                          </div>

                          <div className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-rog-red/20 text-rog-red flex items-center justify-center text-[10px] font-bold border border-rog-red/50 shrink-0 mt-0.5">3</div>
                              <div>
                                  <div className="text-xs font-bold text-white mb-1">Run & Test</div>
                                  <div className="text-[10px] text-gray-500 font-mono bg-black p-1.5 rounded border border-gray-800">python main.py</div>
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
                    <span className="ml-2 text-xs text-gray-400 font-mono">main.py</span>
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