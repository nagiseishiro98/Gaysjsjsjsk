import React, { useState } from 'react';
import { Check, Copy, Server, ShieldAlert, Info } from 'lucide-react';

const SERVER_CODE = `/**
 * FIREBASE CLOUD FUNCTION (Node.js)
 * Deploy this to handle Key Validation AND Device Binding.
 * 
 * LOGIC:
 * 1. Check if key exists (Case Insensitive).
 * 2. Check status & expiration.
 * 3. Device Binding Check:
 *    - If key has no boundDeviceId, bind it to incoming HWID.
 *    - If key has boundDeviceId, ensure it matches incoming HWID.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.validateKey = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST, GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  // Get Key and HWID from body or query
  const rawKey = req.body.key || req.query.key; 
  const hwid = req.body.hwid || req.query.hwid;

  if (!rawKey) {
    res.status(400).json({ valid: false, message: "Missing key" });
    return;
  }
  
  if (!hwid) {
    res.status(400).json({ valid: false, message: "Missing HWID (Device ID)" });
    return;
  }

  // FORCE UPPERCASE to match Database format
  const key = String(rawKey).trim().toUpperCase();

  try {
    // 1. Find the key document
    const keysRef = admin.firestore().collection('keys');
    const snapshot = await keysRef.where('key', '==', key).limit(1).get();

    if (snapshot.empty) {
      res.status(404).json({ valid: false, message: "Key not found" });
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const now = Date.now();

    // 2. Check Status
    if (data.status !== 'ACTIVE') {
      res.status(403).json({ valid: false, message: "Key is " + data.status });
      return;
    }

    // 3. Check Expiration
    if (data.expiresAt && now > data.expiresAt) {
      res.status(403).json({ valid: false, message: "Key Expired" });
      return;
    }

    // 4. DEVICE BINDING CHECK
    if (data.boundDeviceId) {
        // Check if incoming HWID matches stored HWID
        if (data.boundDeviceId !== hwid) {
            res.status(403).json({ valid: false, message: "HWID Mismatch (Key bound to another device)" });
            return;
        }
    } else {
        // First use: Bind to this device
        await doc.ref.update({ boundDeviceId: hwid });
    }

    // 5. Update usage stats
    await doc.ref.update({ 
      lastUsed: now,
      ip: req.ip || 'unknown',
      usageCount: admin.firestore.FieldValue.increment(1)
    });

    res.status(200).json({ 
      valid: true, 
      expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : "LIFETIME",
      message: "Login Successful"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, message: "Internal Server Error" });
  }
});`;

const ApiSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SERVER_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full md:p-8 p-4 animate-slide-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-rog-panel p-6 border-b border-rog-red/30">
        <div>
           <h2 className="text-xl font-bold uppercase italic tracking-wider text-white flex items-center gap-2">
               <Server className="w-6 h-6 text-rog-red" />
               Backend Logic (Node.js)
           </h2>
           <p className="text-xs text-gray-400 mt-1 font-mono">FIREBASE FUNCTIONS // HWID BINDING ENABLED</p>
        </div>

        <button 
            onClick={handleCopy}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all clip-angle ${copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED' : 'COPY CODE'}
        </button>
      </div>

      <div className="bg-blue-900/20 border border-blue-600/30 p-4 mb-6 flex gap-3 rounded-sm">
          <Info className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="text-xs text-blue-200 font-mono leading-relaxed">
              <span className="font-bold text-blue-500">UPDATE:</span> 
              This code now includes <strong>Device Binding</strong> logic. The first device to use a key will be locked to it. 
              If you set a manual HWID in the panel, it will only work for that HWID.
          </div>
      </div>

      <div className="flex-1 bg-[#08080a] border border-gray-800 relative flex flex-col shadow-2xl font-mono rounded-sm overflow-hidden">
         <div className="flex items-center px-4 py-2 bg-[#1a1a1d] border-b border-gray-800">
            <ShieldAlert className="w-3 h-3 text-rog-red mr-2" />
            <span className="text-xs text-gray-400 tracking-widest uppercase">functions/index.js</span>
         </div>
         
         <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            <pre className="text-sm text-gray-300 leading-relaxed selection:bg-rog-red selection:text-white">
                <code style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                    {SERVER_CODE}
                </code>
            </pre>
         </div>
      </div>
    </div>
  );
};

export default ApiSection;