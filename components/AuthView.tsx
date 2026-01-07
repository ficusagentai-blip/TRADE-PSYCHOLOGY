
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { validateKey, encodeRequestToken } from '../services/crypto';
import { SUPPORT_WHATSAPP, TRANSLATIONS } from '../constants';
import { AppSettings, Language } from '../types';

interface AuthViewProps {
  onUnlock: (sid: string) => void;
  triggerAdminMode: () => void;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onUnlock, triggerAdminMode, settings, updateSettings }) => {
  const [sid, setSid] = useState("");
  const [license, setLicense] = useState("");
  const [clicks, setClicks] = useState(0);
  const [error, setError] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[settings.language];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHeaderClick = () => {
    setClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        triggerAdminMode();
        return 0;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanSid = sid.trim().toUpperCase();
    const cleanLicense = license.trim().toUpperCase();
    if (!cleanSid || !cleanLicense) {
      setError(settings.language === 'en' ? "Please fill both ID and License Key." : "कृपया सिस्टिम आयडी आणि लायसन्स की दोन्ही भरा.");
      return;
    }
    if (validateKey(cleanSid, cleanLicense)) {
      onUnlock(cleanSid);
    } else {
      setError(settings.language === 'en' ? "Invalid License Key! Get a new one from Admin." : "चुकीची लायसन्स की! कृपया अ‍ॅडमिनकडून नवीन की मिळवा.");
    }
  };

  const handleSmartRequest = () => {
    setError("");
    const cleanSid = sid.trim().toUpperCase();
    if (!cleanSid || cleanSid.length < 2) {
      setError(t.idLabel);
      return;
    }
    setIsRequesting(true);
    try {
      const token = encodeRequestToken(cleanSid);
      const message = (t as any).waTemplate(cleanSid, token);
      const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } catch (err) {
      setError("Error creating message.");
    } finally {
      setTimeout(() => setIsRequesting(false), 2000);
    }
  };

  const getLangInitial = (lang: Language) => {
    if (lang === 'mr') return 'म';
    if (lang === 'hi') return 'हि';
    return 'EN';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-white relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50" ref={langRef}>
        <div className={`flex items-center transition-all duration-500 bg-slate-50/90 backdrop-blur-xl border border-slate-200/50 shadow-sm overflow-hidden ${isLangOpen ? 'rounded-[1.5rem] p-1' : 'rounded-full p-0.5'}`}>
          {!isLangOpen && (
            <button onClick={() => setIsLangOpen(true)} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shadow-lg">
              {getLangInitial(settings.language)}
            </button>
          )}
          {isLangOpen && (
            <div className="flex items-center px-1">
              {(['mr', 'hi', 'en'] as Language[]).map(lang => (
                <button key={lang} onClick={() => { updateSettings({ language: lang }); setIsLangOpen(false); }} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${settings.language === lang ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
                  {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'English'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 right-0 w-[80%] md:w-[60%] h-[60%] bg-indigo-50/40 blur-[120px] rounded-full floating"></div>
      <div className="absolute bottom-0 left-0 w-[70%] md:w-[50%] h-[50%] bg-purple-50/40 blur-[100px] rounded-full floating" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-sm md:max-w-md z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-8 md:mb-10">
          <div onClick={handleHeaderClick} className="group relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 cursor-pointer active:scale-95 transition-transform">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] md:rounded-[2.5rem] bg-white border border-indigo-100 flex items-center justify-center shadow-xl shadow-indigo-100/40">
              <i className="fas fa-brain text-3xl md:text-4xl text-indigo-500 glow-text"></i>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">
            {t.appTitle.split(' ')[0]} <span className="text-indigo-600">{t.appTitle.split(' ')[1]}</span>
          </h2>
          <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em]">{t.subtitle}</p>
        </div>

        <div className="chan-border divine-card p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[8px]">1</span>
                {t.idLabel}
              </label>
              <input type="text" placeholder={t.idPlaceholder} className="ethereal-input w-full rounded-xl md:rounded-2xl py-3 md:py-4 px-5 md:px-6 text-slate-800 placeholder-slate-300 outline-none font-bold text-sm uppercase" value={sid} onChange={(e) => setSid(e.target.value)} />
            </div>

            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[8px]">2</span>
                {t.keyLabel}
              </label>
              <input type="text" placeholder="KEY-XXXX-XXXX" className="ethereal-input w-full rounded-xl md:rounded-2xl py-3 md:py-4 px-5 md:px-6 text-slate-800 placeholder-slate-300 outline-none font-mono font-bold text-sm uppercase" value={license} onChange={(e) => setLicense(e.target.value)} />
            </div>

            {error && <p className="text-rose-600 text-[10px] md:text-[11px] font-bold text-center">{error}</p>}

            <Button type="submit" className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-black shadow-2xl shadow-indigo-200/50 active:scale-[0.98]">
              {t.unlockBtn}
            </Button>

            <div className="pt-6 md:pt-8 border-t border-slate-100/50 relative text-center">
              <button type="button" onClick={handleSmartRequest} disabled={isRequesting} className="w-full group bg-white border border-emerald-100 rounded-xl md:rounded-[1.5rem] p-4 md:p-5 shadow-sm active:scale-95 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4 text-left">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                      {isRequesting ? <i className="fas fa-circle-notch animate-spin text-lg"></i> : <i className="fab fa-whatsapp text-xl md:text-2xl"></i>}
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-tight">{t.requestBtn}</p>
                      <p className="text-[8px] md:text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{t.adminRequest}</p>
                    </div>
                  </div>
                  <i className="fas fa-arrow-right text-emerald-200 group-hover:translate-x-1 transition-all"></i>
                </div>
              </button>
            </div>
          </form>
        </div>
        <p className="text-center mt-8 md:mt-12 text-[7px] md:text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] md:tracking-[0.8em]">Inner Peace • Total Discipline</p>
      </div>
    </div>
  );
};
