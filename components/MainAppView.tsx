
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from './ui/Button';
import { askSecurityAssistant } from '../services/geminiService';
import { ChatMessage, TradeEntry, DiaryEntry, AppSettings, Language, ThemeType } from '../types';
import { TRANSLATIONS, APP_VERSION } from '../constants';

interface MainAppViewProps {
  onLock: () => void;
  systemId: string;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
}

interface Mentor {
  id: string;
  name: string;
  lesson: string;
}

const BalloonGame: React.FC<{ onComplete: () => void, t: any }> = ({ onComplete, t }) => {
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'success' | 'fail'>('idle');

  const colors = [
    'radial-gradient(circle at 30% 30%, #ff9a9e, #fecfef)',
    'radial-gradient(circle at 30% 30%, #a18cd1, #fbc2eb)',
    'radial-gradient(circle at 30% 30%, #84fab0, #8fd3f4)',
    'radial-gradient(circle at 30% 30%, #fccb90, #d57eeb)',
    'radial-gradient(circle at 30% 30%, #a1c4fd, #c2e9fb)',
    'radial-gradient(circle at 30% 30%, #89f7fe, #66a6ff)'
  ];

  const spawnBalloon = () => {
    const id = Math.random().toString(36).substring(7);
    const left = Math.random() * 80 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 25 + 45; 
    const speed = Math.random() * 3 + 4; 
    const sway = Math.random() * 10 - 5; 
    setBalloons(prev => [...prev, { id, left, color, size, speed, sway, bottom: -100, popped: false }]);
  };

  useEffect(() => {
    let timer: any;
    let spawnInterval: any;
    if (gameState === 'playing') {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      spawnInterval = setInterval(() => spawnBalloon(), 900);
    }
    return () => {
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [gameState]);

  useEffect(() => {
    if (timeLeft <= 0 && gameState === 'playing') {
      if (score >= 10) setGameState('success');
      else setGameState('fail');
    }
  }, [timeLeft, gameState, score]);

  useEffect(() => {
    if (gameState === 'success') {
      const timer = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, onComplete]);

  const popBalloon = (id: string) => {
    setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setScore(s => s + 1);
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== id));
    }, 300);
  };

  return (
    <div className="relative h-72 md:h-96 w-full bg-gradient-to-b from-sky-400 to-sky-200 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center shadow-2xl border-4 border-white/40 group">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-32 h-16 bg-white blur-2xl rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-10 w-40 h-20 bg-white blur-3xl rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-20 w-48 h-24 bg-white blur-3xl rounded-full animate-pulse delay-500"></div>
      </div>

      {gameState === 'idle' && (
        <div className="text-center p-8 z-10 animate-in fade-in zoom-in-95 backdrop-blur-sm bg-white/20 rounded-3xl p-10 border border-white/30">
          <div className="w-24 h-24 bg-white/40 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl transition-all hover:scale-110">
             <i className="fas fa-cloud-sun text-white text-4xl drop-shadow-md"></i>
          </div>
          <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2 drop-shadow-sm">{t.focusCalibration}</h3>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-6">{t.focusDesc}</p>
          <Button onClick={() => setGameState('playing')} className="px-10 py-4 rounded-2xl bg-white text-sky-600 hover:bg-sky-50 shadow-xl shadow-sky-500/20 text-[10px] uppercase font-black tracking-[0.2em] transition-all border-none">
            {t.startCalibration}
          </Button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-30 pointer-events-none">
             <div className="px-5 py-2 bg-white/30 backdrop-blur-md rounded-full border border-white/40 shadow-lg">
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{t.hits}: {score}</span>
             </div>
             <div className="px-5 py-2 bg-white/30 backdrop-blur-md rounded-full border border-white/40 shadow-lg">
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{timeLeft}s</span>
             </div>
          </div>
          
          <div className="absolute inset-0 overflow-hidden">
            {balloons.map(b => (
              <button
                key={b.id}
                onClick={() => !b.popped && popBalloon(b.id)}
                className={`absolute transition-all transform ${b.popped ? 'scale-150 opacity-0' : 'hover:scale-110 active:scale-125'}`}
                style={{ 
                  left: `${b.left}%`, 
                  width: b.size, 
                  height: b.size * 1.3,
                  background: b.color,
                  borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                  boxShadow: 'inset -8px -8px 15px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)',
                  animation: `floatUp ${b.speed}s linear forwards, sway ${b.speed / 2}s ease-in-out infinite alternate`,
                  cursor: b.popped ? 'default' : 'pointer',
                  zIndex: 20
                }}
              >
                {!b.popped && (
                  <>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white/40 rounded-full"></div>
                    <div className="absolute top-4 left-4 w-4 h-8 bg-white/30 rounded-full rotate-45"></div>
                  </>
                )}
                {b.popped && <div className="absolute inset-0 flex items-center justify-center text-white"><i className="fas fa-sparkles text-xl animate-ping"></i></div>}
              </button>
            ))}
          </div>
          <style>{`
            @keyframes floatUp { 0% { bottom: -120px; } 100% { bottom: 120%; } }
            @keyframes sway { 0% { transform: translateX(-15px) rotate(-3deg); } 100% { transform: translateX(15px) rotate(3deg); } }
          `}</style>
        </>
      )}

      {gameState === 'success' && (
        <div className="text-center p-10 z-10 animate-in fade-in zoom-in-110 backdrop-blur-sm bg-white/20 rounded-[2.5rem] border border-white/30 shadow-2xl">
          <div className="w-28 h-28 rounded-full bg-white/40 text-white flex items-center justify-center mx-auto border-4 border-white/60 mb-6 shadow-2xl animate-bounce">
             <i className="fas fa-smile-beam text-5xl"></i>
          </div>
          <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight drop-shadow-md">{t.mindAligned}</h3>
          <p className="text-[12px] text-white font-bold uppercase tracking-widest mb-6 drop-shadow-sm">{t.gameCalm}</p>
        </div>
      )}

      {gameState === 'fail' && (
        <div className="text-center p-8 z-10 animate-in fade-in slide-in-from-top-4 backdrop-blur-sm bg-white/20 rounded-3xl border border-white/30 shadow-2xl">
          <div className="w-16 h-16 bg-white/30 border border-white/40 rounded-full flex items-center justify-center mx-auto mb-6">
             <i className="fas fa-redo text-white text-2xl"></i>
          </div>
          <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">Try to Calm Your Mind</h3>
          <Button onClick={() => {setScore(0); setTimeLeft(15); setGameState('playing'); setBalloons([]);}} className="px-8 py-3 rounded-xl bg-white text-sky-600 uppercase font-black transition-all hover:scale-105">
            Reset Stress
          </Button>
        </div>
      )}
    </div>
  );
};

export const MainAppView: React.FC<MainAppViewProps> = ({ onLock, systemId, settings, updateSettings }) => {
  const t = TRANSLATIONS[settings.language];
  const [activeTab, setActiveTab] = useState<'discipline' | 'journal' | 'diary' | 'coach' | 'rules' | 'settings'>('discipline');
  const [journalSubTab, setJournalSubTab] = useState<'pre' | 'post'>('pre');
  
  const [routine, setRoutine] = useState(t.routineItems.map((text: string, i: number) => ({ id: `${i}`, text, checked: false })));
  const [isFocused, setIsFocused] = useState(false);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [diaryInput, setDiaryInput] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);

  const [mentors, setMentors] = useState<Mentor[]>(() => {
    const saved = localStorage.getItem(`ficus_mentors_${systemId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [newMentor, setNewMentor] = useState({ name: '', lesson: '' });

  const [moodValue, setMoodValue] = useState(50);
  const [selectedBiases, setSelectedBiases] = useState<string[]>([]);
  const dailyAffirmation = useMemo(() => t.affirmations[Math.floor(Math.random() * t.affirmations.length)], [t.affirmations]);

  const currentStreak = useMemo(() => {
    if (!systemId) return 1;
    const key = `sentinel_start_date_${systemId}`;
    let startDateStr = localStorage.getItem(key);
    if (!startDateStr) {
      const now = new Date().toISOString();
      localStorage.setItem(key, now);
      return 1;
    }
    const startDate = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [systemId]);

  const streakPercentage = (currentStreak / 1111) * 100;

  const [newTrade, setNewTrade] = useState<Partial<TradeEntry>>({ segment: 'NIFTY', symbol: '', qty: 50, entryPrice: 0, slPrice: 0, targetPrice: 0 });
  const [closeTradeData, setCloseTradeData] = useState({ exitPrice: 0, emotion: '', image: '' });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ role: 'model', text: t.zenIntro }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setRoutine(prev => prev.map((item, i) => ({ ...item, text: t.routineItems[i] || item.text })));
  }, [settings.language]);

  useEffect(() => {
    localStorage.setItem(`ficus_mentors_${systemId}`, JSON.stringify(mentors));
  }, [mentors, systemId]);

  const canJournal = (routine.filter(r => r.checked).length / routine.length) === 1 && selectedBiases.length >= 2 && isFocused;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleAddTrade = () => {
    const entry: TradeEntry = { ...(newTrade as TradeEntry), id: Math.random().toString(36).substr(2, 9), status: 'OPEN', emotion: '', timestamp: Date.now() };
    setTrades([...trades, entry]);
    setIsFormOpen(false);
    setNewTrade({ segment: 'NIFTY', symbol: '', qty: 50, entryPrice: 0, slPrice: 0, targetPrice: 0 });
  };

  const handleCloseTrade = () => {
    if (!closingTradeId) return;
    setTrades(trades.map(tr => {
      if (tr.id === closingTradeId) {
        const isProfit = closeTradeData.exitPrice > tr.entryPrice;
        return { ...tr, ...closeTradeData, status: isProfit ? 'PROFIT' : 'LOSS', closedTimestamp: Date.now() };
      }
      return tr;
    }));
    setClosingTradeId(null);
    setCloseTradeData({ exitPrice: 0, emotion: '', image: '' });
    setJournalSubTab('post');
  };

  const handleSaveDiary = () => {
    if (!diaryInput.trim()) return;
    const entry: DiaryEntry = { id: Date.now().toString(), text: diaryInput, timestamp: Date.now() };
    setDiaryEntries([entry, ...diaryEntries]);
    setDiaryInput("");
  };

  const handleAddMentor = () => {
    if (!newMentor.name.trim() || !newMentor.lesson.trim()) return;
    const m: Mentor = { id: Date.now().toString(), name: newMentor.name, lesson: newMentor.lesson };
    setMentors([m, ...mentors]);
    setNewMentor({ name: '', lesson: '' });
  };

  const handleDeleteMentor = (id: string) => {
    setMentors(mentors.filter(m => m.id !== id));
  };

  const handleSendAI = async () => {
    if (!input.trim() || isTyping) return;
    const msg = input.trim();
    setInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    const res = await askSecurityAssistant(msg, settings.language);
    setIsTyping(false);
    setChatHistory(prev => [...prev, { role: 'model', text: res }]);
  };

  const dashboardStats = useMemo(() => {
    const closedTrades = trades.filter(t => t.status !== 'OPEN');
    const wins = closedTrades.filter(t => t.status === 'PROFIT');
    const losses = closedTrades.filter(t => t.status === 'LOSS');
    const totalCount = closedTrades.length;
    const winRate = totalCount > 0 ? (wins.length / totalCount) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((acc, t) => acc + ((t.exitPrice! - t.entryPrice) * t.qty), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((acc, t) => acc + ((t.exitPrice! - t.entryPrice) * t.qty), 0) / losses.length) : 0;
    const expectancy = totalCount > 0 ? ((winRate/100) * avgWin) - ((1 - winRate/100) * avgLoss) : 0;

    const calculatePeriodicReturn = (ms: number) => {
      const threshold = Date.now() - ms;
      return closedTrades.filter(t => t.closedTimestamp! > threshold).reduce((acc, t) => acc + (t.exitPrice! - t.entryPrice) * t.qty, 0);
    };

    const days = [t.mon, t.tue, t.wed, t.thu, t.fri];
    const weeklyPerformance = days.map((dayName, index) => {
        const dayTrades = closedTrades.filter(tr => new Date(tr.closedTimestamp!).getDay() === (index + 1));
        const dayWins = dayTrades.filter(tr => tr.status === 'PROFIT');
        return {
            day: dayName,
            count: dayTrades.length,
            rate: dayTrades.length > 0 ? (dayWins.length / dayTrades.length) * 100 : 0
        };
    });

    return { 
      winRate, 
      expectancy, 
      dayReturn: calculatePeriodicReturn(24 * 3600000), 
      weekReturn: calculatePeriodicReturn(7 * 24 * 3600000),
      weeklyPerformance
    };
  }, [trades, t]);

  const navItems = [
    { id: 'discipline', icon: 'fa-shield-heart', label: t.disciplineHub },
    { id: 'journal', icon: 'fa-chart-line', label: t.performanceLog },
    { id: 'diary', icon: 'fa-book-open', label: t.personalDiary },
    { id: 'coach', icon: 'fa-leaf', label: t.ficusCoach },
    { id: 'rules', icon: 'fa-feather-pointed', label: t.universalLaws },
    { id: 'settings', icon: 'fa-cog', label: t.settings },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden flex-col">
      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-2 bg-white border-b border-slate-100 z-30 shadow-sm shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto mb-3 md:mb-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl theme-bg-primary flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-brain text-xs md:text-sm"></i>
            </div>
            <h1 className="text-xs md:text-sm font-black uppercase tracking-tighter text-slate-800 leading-none">
              {t.appTitle.split(' ')[0]} <span className="theme-text-primary">{t.appTitle.split(' ')[1]}</span>
            </h1>
          </div>
          <button onClick={onLock} className="md:hidden text-rose-400 text-[10px] font-black uppercase tracking-widest">{t.logout}</button>
        </div>

        <nav className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1 md:gap-2 px-1 py-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === item.id ? 'theme-bg-primary text-white shadow-lg shadow-theme' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              <i className={`fas ${item.icon}`}></i>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
           <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.days} {currentStreak}</span>
             </div>
             <div className="w-24 h-1 bg-slate-50 rounded-full mt-1"><div className="h-full theme-bg-primary rounded-full" style={{ width: `${Math.min(streakPercentage, 100)}%` }}></div></div>
           </div>
           <Button onClick={onLock} variant="ghost" className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 px-2">{t.logout}</Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-50/30 p-3 md:p-8 no-scrollbar">
        <div className="max-w-7xl mx-auto w-full">
          
          {activeTab === 'discipline' && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2">
               <div className="p-6 md:p-8 theme-bg-primary text-white rounded-3xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                     <i className="fas fa-quote-right text-6xl md:text-8xl"></i>
                  </div>
                  <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-3">{t.dailyAffirmation}</p>
                  <p className="text-xl md:text-2xl font-bold italic leading-relaxed tracking-tight">"{dailyAffirmation}"</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section className="divine-card p-6 md:p-8 border border-slate-50 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{t.alignment}</h3>
                        <div className="space-y-4">
                          {routine.map(r => (
                            <div key={r.id} onClick={() => setRoutine(prev => prev.map(i => i.id === r.id ? {...i, checked: !i.checked} : i))} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`shrink-0 w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${r.checked ? 'theme-bg-primary theme-border-primary shadow-md' : 'bg-white border-slate-200'}`}>{r.checked && <i className="fas fa-check text-white text-[9px]"></i>}</div>
                              <span className={`text-xs md:text-sm font-bold transition-all ${r.checked ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{r.text}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="divine-card p-6 md:p-8 border border-slate-50 shadow-sm">
                        <h3 className="text-[10px] font-black theme-text-primary uppercase tracking-[0.3em] mb-6">{t.cognitiveBiasCheck}</h3>
                        <div className="space-y-4">
                          {t.biases.map((bias: string) => (
                            <div key={bias} onClick={() => setSelectedBiases(prev => prev.includes(bias) ? prev.filter(b => b !== bias) : [...prev, bias])} className="flex items-center gap-3 cursor-pointer">
                              <div className={`shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedBiases.includes(bias) ? 'theme-bg-primary theme-border-primary shadow-md' : 'bg-white border-slate-200'}`}>
                                {selectedBiases.includes(bias) && <i className="fas fa-shield text-white text-[8px]"></i>}
                              </div>
                              <span className={`text-[10px] font-bold ${selectedBiases.includes(bias) ? 'theme-text-primary' : 'text-slate-500'}`}>{bias}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                    <section className="divine-card p-6 md:p-8 border border-slate-50 shadow-sm">
                       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.fearGreedIndex}</h3>
                          <span className={`w-fit text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${moodValue < 30 ? 'bg-rose-50 text-rose-500' : moodValue > 70 ? 'bg-emerald-50 text-emerald-500' : 'theme-bg-secondary theme-text-primary'}`}>
                             {moodValue < 30 ? 'Excessive Fear' : moodValue > 70 ? 'Extreme Greed' : 'Neutral State'}
                          </span>
                       </div>
                       <input type="range" min="0" max="100" value={moodValue} onChange={(e) => setMoodValue(parseInt(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[var(--primary-color)] mb-4" />
                       <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          <span>Fear</span>
                          <span>Greed</span>
                       </div>
                    </section>
                  </div>
                  <div className="lg:col-span-4">
                    <BalloonGame 
                      onComplete={() => {
                        setIsFocused(true); 
                        setActiveTab('journal');
                      }} 
                      t={t} 
                    />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
               {!canJournal ? (
                 <div className="py-20 flex flex-col items-center text-center opacity-50 px-4">
                    <i className="fas fa-lock text-5xl mb-8"></i>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{t.journalLocked}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 max-w-xs">{t.journalLockDesc}</p>
                    <Button onClick={() => setActiveTab('discipline')} className="mt-2 px-12 py-4 rounded-2xl theme-bg-primary text-white border-none">Complete Preparation</Button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   <div className="lg:col-span-8 space-y-8">
                      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                         <h2 className="text-2xl font-black uppercase tracking-tight">{t.performanceLog}</h2>
                         <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100 w-fit shadow-sm">
                            <button onClick={() => setJournalSubTab('pre')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${journalSubTab === 'pre' ? 'theme-bg-primary text-white' : 'text-slate-400'}`}>{t.preTrade}</button>
                            <button onClick={() => setJournalSubTab('post')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${journalSubTab === 'post' ? 'theme-bg-primary text-white' : 'text-slate-400'}`}>{t.postTrade}</button>
                         </div>
                      </header>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="p-6 md:p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl flex items-center justify-between">
                            <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.successRate}</p><h4 className="text-4xl font-black theme-text-primary mt-1">{dashboardStats.winRate.toFixed(1)}%</h4></div>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner"><i className="fas fa-award theme-text-primary text-2xl"></i></div>
                         </div>
                         <div className="p-6 md:p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{t.tradingExpectancy}</p>
                            <h4 className={`text-3xl font-black mt-1 truncate ${dashboardStats.expectancy >= 0 ? 'theme-text-primary' : 'text-rose-500'}`}>{formatINR(dashboardStats.expectancy)}</h4>
                         </div>
                      </div>

                      <div className="divine-card border border-slate-50 overflow-hidden rounded-[2.5rem] bg-white shadow-sm overflow-x-auto no-scrollbar touch-pan-x">
                        <table className="w-full border-collapse min-w-[500px]">
                            <thead className="bg-slate-50/50">
                                <tr>{['status', 'symbol', 'qty', 'entryPrice', 'exitPrice', 'pnlLabel'].map(h => (<th key={h} className="px-6 py-5 text-[8px] font-black text-slate-400 uppercase text-left whitespace-nowrap">{t[h as keyof typeof t]}</th>))}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {trades.filter(tr => journalSubTab === 'pre' ? tr.status === 'OPEN' : tr.status !== 'OPEN').sort((a,b) => b.timestamp - a.timestamp).map(tr => {
                                  const pnl = (tr.exitPrice! - tr.entryPrice) * tr.qty;
                                  return (
                                  <tr key={tr.id} className="hover:bg-slate-50/20 transition-colors">
                                      <td className="px-6 py-5"><span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase ${tr.status === 'PROFIT' ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100' : tr.status === 'LOSS' ? 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-100' : 'theme-bg-secondary theme-text-primary shadow-sm'}`}>{tr.status}</span></td>
                                      <td className="px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-tighter truncate max-w-[120px]">{tr.symbol}</td>
                                      <td className="px-6 py-5 text-[10px] font-bold text-slate-500">{tr.qty}</td>
                                      <td className="px-6 py-5 text-[10px] font-bold text-slate-500">₹{tr.entryPrice}</td>
                                      <td className="px-6 py-5 text-[10px] font-bold text-slate-500">{tr.status !== 'OPEN' ? `₹${tr.exitPrice}` : '---'}</td>
                                      <td className="px-6 py-5 whitespace-nowrap">{tr.status !== 'OPEN' ? (<span className={`text-xs font-black ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatINR(pnl)}</span>) : (<button onClick={() => setClosingTradeId(tr.id)} className="text-[10px] font-black theme-text-primary uppercase underline decoration-2 underline-offset-4">Close</button>)}</td>
                                  </tr>
                                )})}
                            </tbody>
                        </table>
                      </div>
                   </div>

                   <div className="lg:col-span-4 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-5 bg-white border border-slate-50 rounded-3xl text-center shadow-sm">
                            <p className="text-[7px] font-black text-slate-300 uppercase mb-1">{t.dayReturn}</p>
                            <h5 className={`text-sm font-black tracking-tighter ${dashboardStats.dayReturn >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>{formatINR(dashboardStats.dayReturn)}</h5>
                         </div>
                         <div className="p-5 bg-white border border-slate-50 rounded-3xl text-center shadow-sm">
                            <p className="text-[7px] font-black text-slate-300 uppercase mb-1">{t.weekReturn}</p>
                            <h5 className={`text-sm font-black tracking-tighter ${dashboardStats.weekReturn >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>{formatINR(dashboardStats.weekReturn)}</h5>
                         </div>
                      </div>
                      
                      {journalSubTab === 'pre' && (
                        <div className="pt-2"><Button onClick={() => setIsFormOpen(true)} className="w-full py-6 rounded-[2rem] theme-bg-primary text-white text-xs font-black uppercase tracking-[0.3em] shadow-xl border-none"><i className="fas fa-plus mr-3"></i> {t.newEntry}</Button></div>
                      )}

                      <div className="p-5 md:p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-sm">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center">{t.weeklyPerformance}</h3>
                         <div className="space-y-6">
                            {dashboardStats.weeklyPerformance.map((day, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                 <div className="min-w-0 flex-1 mr-4"><p className="text-[11px] font-black text-slate-800 uppercase mb-0.5 truncate">{day.day}</p><p className="text-[8px] font-bold text-slate-300 uppercase">{day.count} Trades</p></div>
                                 <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-50" /><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={`${day.rate * 1.25} 125.6`} className={day.rate >= 50 ? 'text-emerald-500' : 'text-rose-400'} strokeLinecap="round" /></svg>
                                    <span className="absolute text-[8px] font-black text-slate-400">{day.rate.toFixed(0)}%</span>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'diary' && (
            <div className="space-y-10 animate-in fade-in">
              <header><h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{t.personalDiary}</h2></header>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 divine-card theme-bg-secondary border theme-border-primary/20 shadow-sm">
                    <h3 className="text-[10px] font-black theme-text-primary uppercase mb-4 tracking-widest">Digital Quill</h3>
                    <textarea value={diaryInput} onChange={e => setDiaryInput(e.target.value)} className="w-full h-56 ethereal-input p-6 rounded-[2rem] text-sm outline-none resize-none font-medium text-slate-700 leading-relaxed shadow-inner" placeholder={t.diaryPlaceholder}></textarea>
                    <Button onClick={handleSaveDiary} className="w-full mt-6 py-5 rounded-2xl uppercase font-black theme-bg-primary text-white text-[11px] shadow-lg border-none">{t.saveDiary}</Button>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-6">
                  {diaryEntries.map(entry => (
                    <div key={entry.id} className="p-8 divine-card bg-white border border-slate-50 relative group shadow-sm">
                      <p className="text-[8px] font-black text-slate-300 uppercase mb-4 tracking-widest">{new Date(entry.timestamp).toLocaleString()}</p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                    </div>
                  ))}
                  {diaryEntries.length === 0 && <div className="py-32 text-center opacity-20"><i className="fas fa-pen-nib text-5xl mb-4"></i><p className="text-xs font-black uppercase tracking-[0.4em]">Start your chronicle</p></div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coach' && (
            <div className="h-[75vh] flex flex-col divine-card border border-slate-50 overflow-hidden shadow-2xl bg-white rounded-[2.5rem]">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between theme-bg-secondary/5 shrink-0">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl theme-bg-primary flex items-center justify-center text-white shadow-lg"><i className="fas fa-leaf"></i></div>
                   <div><h3 className="font-black text-slate-800 uppercase text-lg tracking-tight">{t.ficusCoach}</h3><p className="text-[9px] font-black theme-text-primary uppercase tracking-widest">Psychological Wisdom</p></div>
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 no-scrollbar bg-slate-50/10">
                 {chatHistory.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}><div className={`max-w-[85%] md:max-w-[75%] p-6 rounded-[2.5rem] ${m.role === 'user' ? 'theme-bg-primary text-white rounded-br-none shadow-xl' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'}`}><p className="text-sm font-medium leading-relaxed">{m.text}</p></div></div>))}
                 {isTyping && <div className="flex justify-start"><div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex gap-2"><div className="w-2 h-2 theme-bg-primary/40 rounded-full animate-bounce"></div><div className="w-2 h-2 theme-bg-primary/40 rounded-full animate-bounce delay-150"></div><div className="w-2 h-2 theme-bg-primary/40 rounded-full animate-bounce delay-300"></div></div></div>}
               </div>
               <div className="p-6 md:p-10 bg-white border-t border-slate-50 flex gap-5 shrink-0">
                 <input className="ethereal-input flex-1 rounded-2xl px-6 md:px-10 py-5 text-sm outline-none shadow-sm" placeholder={t.placeholderCoach} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendAI()} />
                 <Button onClick={handleSendAI} className="theme-bg-primary text-white border-none w-16 h-16 rounded-2xl shadow-xl shrink-0"><i className="fas fa-paper-plane text-xl"></i></Button>
               </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-16 animate-in fade-in">
               <div className="space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t.universalLaws}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {t.goldenRules.map((rule: any, idx: number) => (
                      <div key={idx} className="divine-card p-10 border border-slate-50 bg-white shadow-sm hover:translate-y-[-4px] transition-all duration-300">
                        <div className="w-12 h-12 theme-bg-secondary theme-text-primary rounded-2xl flex items-center justify-center text-sm font-black mb-8 shadow-inner">{idx + 1}</div>
                        <h4 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tighter">{rule.title}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{rule.text}</p>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="h-[1px] flex-1 bg-slate-100"></div>
                     <h3 className="text-xl font-black uppercase tracking-[0.2em] text-slate-400">{t.personalMentors}</h3>
                     <div className="h-[1px] flex-1 bg-slate-100"></div>
                  </div>
                  
                  <div className="divine-card p-8 theme-bg-secondary/40 border theme-border-primary/10 shadow-inner max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.mentorName}</label>
                        <input type="text" placeholder="e.g. Mark Minervini" className="ethereal-input w-full p-4 rounded-xl text-xs font-bold" value={newMentor.name} onChange={e => setNewMentor({...newMentor, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.mentorLesson}</label>
                        <input type="text" placeholder="e.g. Stop losses are not negotiable." className="ethereal-input w-full p-4 rounded-xl text-xs font-bold" value={newMentor.lesson} onChange={e => setNewMentor({...newMentor, lesson: e.target.value})} />
                      </div>
                    </div>
                    <Button onClick={handleAddMentor} className="w-full py-4 rounded-2xl theme-bg-primary text-white border-none text-[10px] uppercase font-black shadow-lg"><i className="fas fa-plus mr-2"></i> {t.saveMentor}</Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mentors.map(m => (
                      <div key={m.id} className="divine-card p-8 border border-slate-50 bg-white relative group shadow-sm hover:shadow-md transition-all">
                        <button onClick={() => handleDeleteMentor(m.id)} className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><i className="fas fa-trash-alt text-[10px]"></i></button>
                        <div className="w-8 h-8 rounded-lg theme-bg-secondary theme-text-primary flex items-center justify-center text-[10px] mb-4"><i className="fas fa-id-card"></i></div>
                        <h4 className="text-sm font-black text-slate-800 uppercase mb-2 tracking-tight">{m.name}</h4>
                        <div className="h-0.5 w-6 theme-bg-primary/20 mb-3"></div>
                        <p className="text-[11px] font-medium text-slate-500 italic leading-relaxed">"{m.lesson}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
              <header><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t.settings}</h2></header>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <section className="lg:col-span-5 divine-card p-8 md:p-10 bg-white border border-slate-50 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-[0.3em]">{t.language}</h3>
                  <div className="space-y-4">{(['mr', 'hi', 'en'] as Language[]).map(lang => (<button key={lang} onClick={() => updateSettings({ language: lang })} className={`w-full p-5 rounded-[1.5rem] text-sm font-black transition-all flex items-center justify-between border ${settings.language === lang ? 'theme-bg-primary text-white theme-border-primary shadow-2xl scale-[1.02]' : 'bg-white text-slate-400 border-slate-100'}`}><div className="flex items-center gap-6"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm ${settings.language === lang ? 'bg-white/20 text-white shadow-inner' : 'theme-bg-secondary theme-text-primary'}`}>{lang === 'mr' ? 'म' : lang === 'hi' ? 'हि' : 'En'}</div><div className="uppercase tracking-widest text-[10px] md:text-xs font-black">{lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'English'}</div></div></button>))}</div>
                </section>
                
                <section className="lg:col-span-7 divine-card p-8 md:p-10 bg-white border border-slate-50 shadow-sm">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-[0.3em]">Select Theme</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {([
                        { id: 'indigo', name: 'Classic', color: '#4f46e5' },
                        { id: 'sky', name: 'Ocean', color: '#0284c7' },
                        { id: 'emerald', name: 'Nature', color: '#059669' },
                        { id: 'rose', name: 'Berry', color: '#e11d48' },
                        { id: 'violet', name: 'Twilight', color: '#7c3aed' },
                        { id: 'amber', name: 'Golden', color: '#d97706' }
                      ] as { id: ThemeType, name: string, color: string }[]).map(theme => (
                        <button key={theme.id} onClick={() => updateSettings({ theme: theme.id })} className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${settings.theme === theme.id ? 'border-[var(--primary-color)] theme-bg-secondary' : 'border-slate-100 hover:border-slate-200'}`}>
                           <div className="w-10 h-10 rounded-full shadow-lg" style={{ backgroundColor: theme.color }}></div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${settings.theme === theme.id ? 'theme-text-primary' : 'text-slate-400'}`}>{theme.name}</span>
                           {settings.theme === theme.id && <div className="absolute top-2 right-2 w-4 h-4 theme-bg-primary rounded-full flex items-center justify-center text-white"><i className="fas fa-check text-[7px]"></i></div>}
                        </button>
                      ))}
                   </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Form Overlays */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="divine-card p-8 w-full max-w-lg bg-white rounded-[2.5rem] animate-in zoom-in-95 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <h3 className="text-2xl font-black text-slate-800 uppercase mb-8 tracking-tighter">{t.newEntry}</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.segment}</label><select className="ethereal-input w-full p-4 rounded-xl font-bold text-xs outline-none" value={newTrade.segment} onChange={e => setNewTrade({...newTrade, segment: e.target.value})}><option>NIFTY</option><option>BANKNIFTY</option><option>STOCKS</option><option>CRYPTO</option></select></div>
               <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.symbol}</label><input className="ethereal-input w-full p-4 rounded-xl font-bold uppercase text-xs outline-none" placeholder="SYMBOL" value={newTrade.symbol} onChange={e => setNewTrade({...newTrade, symbol: e.target.value})} /></div>
               <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.qty}</label><input type="number" className="ethereal-input w-full p-4 rounded-xl font-bold text-xs outline-none" value={newTrade.qty} onChange={e => setNewTrade({...newTrade, qty: parseInt(e.target.value)})} /></div>
               <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.entryPrice}</label><input type="number" className="ethereal-input w-full p-4 rounded-xl font-bold text-xs outline-none" value={newTrade.entryPrice} onChange={e => setNewTrade({...newTrade, entryPrice: parseFloat(e.target.value)})} /></div>
               <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.slPrice}</label><input type="number" className="ethereal-input w-full p-4 rounded-xl font-bold text-xs outline-none" value={newTrade.slPrice} onChange={e => setNewTrade({...newTrade, slPrice: parseFloat(e.target.value)})} /></div>
               <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.targetPrice}</label><input type="number" className="ethereal-input w-full p-4 rounded-xl font-bold text-xs outline-none" value={newTrade.targetPrice} onChange={e => setNewTrade({...newTrade, targetPrice: parseFloat(e.target.value)})} /></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4"><Button onClick={handleAddTrade} className="theme-bg-primary text-white border-none flex-1 py-5 rounded-2xl uppercase font-black text-[11px] shadow-xl">Save Trade Entry</Button><Button onClick={() => setIsFormOpen(false)} variant="ghost" className="px-10 font-black text-[10px] uppercase">Cancel</Button></div>
          </div>
        </div>
      )}

      {closingTradeId && (
         <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="divine-card p-8 w-full max-w-lg bg-white rounded-[2.5rem] animate-in zoom-in-95 shadow-2xl">
             <h3 className="text-2xl font-black text-slate-800 uppercase mb-8 tracking-tighter">{t.closeTrade}</h3>
             <div className="space-y-6 mb-8">
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.exitPrice}</label><input type="number" className="ethereal-input w-full p-4 rounded-xl font-bold text-xs outline-none" value={closeTradeData.exitPrice} onChange={e => setCloseTradeData({...closeTradeData, exitPrice: parseFloat(e.target.value)})} /></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.emotion}</label><textarea className="ethereal-input w-full p-4 rounded-xl font-bold text-xs h-32 outline-none resize-none" placeholder="What was your mental state during this trade?" value={closeTradeData.emotion} onChange={e => setCloseTradeData({...closeTradeData, emotion: e.target.value})} /></div>
             </div>
             <div className="flex flex-col sm:flex-row gap-4"><Button onClick={handleCloseTrade} className="theme-bg-primary text-white border-none flex-1 py-5 rounded-2xl uppercase font-black text-[11px] shadow-xl">Finalize Trade</Button><Button onClick={() => setClosingTradeId(null)} variant="ghost" className="px-10 font-black text-[10px] uppercase">Discard</Button></div>
           </div>
         </div>
      )}
    </div>
  );
};
