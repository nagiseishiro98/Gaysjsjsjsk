/**
 * ROG ADMIN BACKEND PROTOCOL
 * This file runs on Google Cloud (Firebase Functions).
 * It validates keys sent from the Python script.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK
admin.initializeApp();

// --- CONFIGURATION ---
// This must match the 'API_SECRET' in your Python script
const API_SECRET = "ROG_MASTER_KEY_V2"; 
// ---------------------

exports.validateKey = functions.https.onRequest(async (req, res) => {
  // 1. CORS HEADERS (Allows Python/Web to connect from anywhere)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-secret');
  
  // Handle pre-flight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
      // 2. ROBUST BODY PARSING
      // Sometimes frameworks send body as a string despite Content-Type json
      let body = req.body;
      if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (e) {
             // parse error, continue with empty object
             body = {};
          }
      }

      // 3. HEALTH CHECK (For the UI "Checking..." status)
      if (body.ping || req.query.ping) {
        res.status(200).json({ status: "online", message: "ROG Server Active" });
        return;
      }

      // 4. SECURITY HANDSHAKE
      const incomingSecret = req.headers['x-api-secret'] || req.query.secret;
      if (incomingSecret !== API_SECRET) {
          res.status(401).json({ 
              valid: false, 
              message: "SECURITY BLOCK: Invalid API Secret. Check your Python script configuration." 
          });
          return;
      }

      // 5. EXTRACT DATA
      const rawKey = body.key || req.query.key; 
      const hwid = body.hwid || req.query.hwid;

      // Validate inputs
      if (!rawKey) {
        res.status(400).json({ valid: false, message: "Protocol Error: Missing Key" });
        return;
      }
      
      if (!hwid) {
        res.status(400).json({ valid: false, message: "Protocol Error: Missing HWID" });
        return;
      }

      const key = String(rawKey).trim().toUpperCase();
      const cleanHwid = String(hwid).trim();

      // 6. DATABASE LOOKUP
      const keysRef = admin.firestore().collection('keys');
      const snapshot = await keysRef.where('key', '==', key).limit(1).get();

      // Key does not exist
      if (snapshot.empty) {
        res.status(404).json({ valid: false, message: "License Key Invalid" });
        return;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      const now = Date.now();

      // 7. VALIDATION LOGIC

      // Status Check
      if (data.status !== 'ACTIVE') {
        res.status(403).json({ 
            valid: false, 
            message: `Login Denied: Key is ${data.status}` 
        });
        return;
      }

      // Expiration Check
      if (data.expiresAt && data.expiresAt !== null && now > data.expiresAt) {
        // Optimization: Auto-update status to EXPIRED in DB so we don't calculate it next time
        await doc.ref.update({ status: 'EXPIRED' });
        
        res.status(403).json({ 
            valid: false, 
            message: "License Key Expired" 
        });
        return;
      }

      // HWID Binding Check (1-Device Policy)
      if (data.boundDeviceId) {
          // If key is already bound, check if it matches the incoming HWID
          if (data.boundDeviceId !== cleanHwid) {
              res.status(403).json({ 
                  valid: false, 
                  message: "Security Alert: Key is bound to a different device." 
              });
              return;
          }
      } else {
          // If not bound, bind it NOW to this device
          await doc.ref.update({ boundDeviceId: cleanHwid });
      }

      // 8. LOGGING & STATS
      // Get reliable IP address behind load balancers
      const ip = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0] 
        : req.connection.remoteAddress;

      await doc.ref.update({ 
        lastUsed: now,
        ip: ip || "Unknown",
        usageCount: admin.firestore.FieldValue.increment(1)
      });

      // 9. SUCCESS RESPONSE
      res.status(200).json({ 
        valid: true, 
        expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : "LIFETIME",
        owner_note: data.note || "No Reference",
        device_id: data.boundDeviceId || cleanHwid,
        message: "Authenticated"
      });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ valid: false, message: "Internal Server Error" });
  }
});