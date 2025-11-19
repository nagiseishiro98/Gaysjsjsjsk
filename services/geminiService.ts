import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 

export const generatePythonCode = async (securityLevel: string): Promise<string> => {
  if (!apiKey) {
    return `# ERROR: API Key not found in environment variables.\n# Please configure process.env.API_KEY to use the AI generator.\n\n# FALLBACK TEMPLATE:\nimport requests\nimport hashlib\nimport uuid\n\ndef get_hwid():\n    return hashlib.sha256(str(uuid.getnode()).encode()).hexdigest()\n\nkey = input("Enter Key: ")\nhwid = get_hwid()\n# ... implement your check here`;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Write a production-ready Python script for a client application that validates a license key with strict 1-Device-1-Key binding.
    
    Requirements:
    1. Use the 'requests' library to communicate with a hypothetical validation server (URL: https://api.yoursite.com/validate).
    2. The script must collect the user's Hardware ID (HWID) securely. Use 'uuid.getnode()' and 'platform' info hashed via 'hashlib' (SHA256) to generate a stable unique Device ID.
    3. It should send a POST request with JSON: {'key': 'USER_INPUT_KEY', 'hwid': 'GENERATED_HWID'}.
    4. Handle responses logic: 
       - 200 OK: "Login Successful" -> Proceed to main app logic.
       - 403 Forbidden: "Invalid Key" or "HWID Mismatch" (This key is bound to another device).
       - 401 Unauthorized: "Key Expired"
    5. Security Level requested: ${securityLevel}.
    6. If Security Level is "High", add a simple anti-debugger check (e.g., checking for tracer via sys.gettrace()) and obscure variable names slightly.
    7. Add comments explaining where to put the main application code after successful login.
    8. Return ONLY the raw Python code, no markdown backticks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text;
    if (text.startsWith('```python')) text = text.replace('```python', '');
    if (text.startsWith('```')) text = text.replace('```', '');
    if (text.endsWith('```')) text = text.replace('```', '');
    
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "# Error generating code via Gemini. Please check your API quota or key.";
  }
};