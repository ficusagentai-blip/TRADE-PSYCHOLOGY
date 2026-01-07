
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { MASTER_ADMIN_PIN, SECRET_SALT } from '../constants';
import { generateSecureKey } from '../services/crypto';

interface AdminViewProps {
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [detectedSid, setDetectedSid] = useState("");
  const [finalKey, setFinalKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [sidError, setSidError] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_ADMIN_PIN) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("चुकीचा अ‍ॅडमिन पिन!");
    }
  };

  // Automatic extraction and validation logic
  useEffect(() => {
    if (!inputMessage.trim()) {
      setDetectedSid("");
      setFinalKey("");
      setSidError("");
      return;
    }

    let sid = "";
    // Try to find ID: pattern first
    const idMatch = inputMessage.match(/ID:\s*([^\n\s*]+)/i);
    if (idMatch && idMatch[1]) {
      sid = idMatch[1].trim();
    } else {
      // Fallback: take first word if it looks like an ID
      const firstWord = inputMessage.trim().split(/\s+/)[0];
      if (firstWord && firstWord.length > 1) {
          sid = firstWord;
      }
    }

    const cleanSid = sid.replace(/[*🆔🔑]/g, '').trim().toUpperCase();
    setDetectedSid(cleanSid);
    
    // Real-time Validation
    if (!cleanSid) {
      setSidError("मेसेजमध्ये सिस्टम आयडी सापडला नाही.");
      setFinalKey("");
    } else if (cleanSid.length < 2) {
      setSidError("सिस्टम आयडी खूप लहान आहे (किमान २ अक्षरे हवीत).");
      setFinalKey("");
    } else if (/[^A-Z0-9\-_]/.test(cleanSid)) {
      setSidError("आयडीमध्ये अवैध अक्षरे आहेत.");
      setFinalKey("");
    } else {
      setSidError("");
      setFinalKey(generateSecureKey(cleanSid, SECRET_SALT));
    }
  }, [inputMessage]);

  const copyResponse = () => {
    if (!finalKey) return;
    const response = `✅ *तुमची लायसन्स की तयार आहे!*\n\n💻 *System ID:* ${detectedSid}\n🔑 *License Key:* ${finalKey}\n\n*कसे वापरावे:*\n१. ही की कॉपी करा.\n२. अ‍ॅपमध्ये पेस्ट करा.\n३. 'Unlock' बटण दाबा.\n\nधन्यवाद! 🙏`;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert("युजरला पाठवण्यासाठी उत्तर कॉपी झाले आहे!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-sm glass p-10 rounded-[2.5rem] text-center border-red-500/20 shadow-2xl shadow-red-900/10">
          <i className="fas fa-lock text-4xl text-red-500 mb-6"></i>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Admin Login</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password"
              placeholder="PIN"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 text-center text-white text-3xl focus:ring-2 focus:ring-red-500 outline-none font-mono tracking-widest"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}
            <Button type="submit" variant="danger" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest">प्रवेश करा</Button>
            <button onClick={onBack} type="button" className="text-slate-600 text-[10px] font-bold uppercase hover:text-slate-400">मागे जा</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-900/30">
              <i className="fas fa-key text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter">Key Generator</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Smart Admin Mode Active</p>
            </div>
          </div>
          <Button onClick={onBack} variant="secondary" className="px-6 py-2 rounded-xl text-[10px] uppercase font-black">लॉगआउट</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border-blue-500/10 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">युजरचा मेसेज येथे पेस्ट करा</h3>
              </div>
              <textarea 
                placeholder="युजरने व्हॉट्सअ‍ॅपवर पाठवलेला मेसेज येथे पेस्ट करा..."
                className="w-full h-64 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 placeholder-slate-700 focus:ring-1 focus:ring-blue-500 outline-none text-xs resize-none mb-4"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <div className={`p-4 rounded-2xl border transition-colors ${sidError ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-600/5 border-blue-500/10'}`}>
                <p className={`text-[9px] font-black uppercase mb-1 ${sidError ? 'text-red-500' : 'text-blue-500'}`}>
                  {sidError ? 'Validation Error' : 'Detected System ID'}
                </p>
                <p className={`text-xl font-black mono ${sidError ? 'text-red-400' : 'text-white'}`}>
                  {detectedSid || "---"}
                </p>
                {sidError && <p className="text-[10px] text-red-500/80 font-bold mt-2 italic">{sidError}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border-emerald-500/10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">2</div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-widest">तुमचा रिस्पॉन्स तयार आहे</h3>
                </div>

                {finalKey ? (
                  <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Generated License Key</p>
                      <p className="text-2xl font-black text-white mono tracking-widest">{finalKey}</p>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-2xl space-y-3">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">व्हॉट्सअ‍ॅपसाठी रिस्पॉन्स</p>
                       <Button 
                         onClick={copyResponse}
                         className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-900/30 font-black uppercase text-xs"
                       >
                         <i className="fab fa-whatsapp text-lg mr-2"></i> उत्तर कॉपी करा
                       </Button>
                       <p className="text-[9px] text-slate-600 text-center leading-relaxed font-bold">
                         वरील बटण दाबल्यावर युजरला पाठवण्यासाठीचा संपूर्ण मेसेज कॉपी होईल. तो थेट व्हॉट्सअ‍ॅपवर पाठवा.
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 opacity-20">
                    <i className={`fas ${sidError ? 'fa-triangle-exclamation text-red-500' : 'fa-magic text-slate-600'} text-6xl mb-4`}></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">
                      {sidError ? 'वैध आयडीची वाट पाहत आहे' : 'मेसेजची वाट पाहत आहे...'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-slate-900 text-center">
                <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.5em]">Sentinel Protocol V2.1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
