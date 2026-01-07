
import React, { useState, useEffect } from 'react';
import { AuthView } from './components/AuthView';
import { AdminView } from './components/AdminView';
import { MainAppView } from './components/MainAppView';
import { AppStatus, AppSettings, Language, ThemeType } from './types';

const THEME_COLORS: Record<ThemeType, { primary: string, hover: string, secondary: string, glow: string, shadow: string }> = {
  indigo: { primary: '#4f46e5', hover: '#4338ca', secondary: '#f5f7ff', glow: 'rgba(79, 70, 229, 0.2)', shadow: 'rgba(79, 70, 229, 0.1)' },
  sky: { primary: '#0284c7', hover: '#0369a1', secondary: '#f0f9ff', glow: 'rgba(2, 132, 199, 0.2)', shadow: 'rgba(2, 132, 199, 0.1)' },
  emerald: { primary: '#059669', hover: '#047857', secondary: '#f0fdf4', glow: 'rgba(5, 150, 105, 0.2)', shadow: 'rgba(5, 150, 105, 0.1)' },
  rose: { primary: '#e11d48', hover: '#be123c', secondary: '#fff1f2', glow: 'rgba(225, 29, 72, 0.2)', shadow: 'rgba(225, 29, 72, 0.1)' },
  violet: { primary: '#7c3aed', hover: '#6d28d9', secondary: '#f5f3ff', glow: 'rgba(124, 58, 237, 0.2)', shadow: 'rgba(124, 58, 237, 0.1)' },
  amber: { primary: '#d97706', hover: '#b45309', secondary: '#fffbeb', glow: 'rgba(217, 119, 6, 0.2)', shadow: 'rgba(217, 119, 6, 0.1)' },
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.LOCKED);
  const [systemId, setSystemId] = useState<string>("");
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('sentinel_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { language: 'mr', theme: 'indigo' };
      }
    }
    return { language: 'mr', theme: 'indigo' };
  });

  useEffect(() => {
    localStorage.setItem('sentinel_settings', JSON.stringify(settings));
    
    // Apply Theme CSS Variables
    const root = document.documentElement;
    const colors = THEME_COLORS[settings.theme || 'indigo'];
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--primary-hover', colors.hover);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-glow', colors.glow);
    root.style.setProperty('--shadow-accent', colors.shadow);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleUnlock = (sid: string) => {
    setSystemId(sid);
    setStatus(AppStatus.UNLOCKED);
  };

  const renderView = () => {
    switch (status) {
      case AppStatus.LOCKED:
        return (
          <AuthView 
            onUnlock={handleUnlock} 
            triggerAdminMode={() => setStatus(AppStatus.ADMIN_AUTH)}
            settings={settings}
            updateSettings={updateSettings}
          />
        );
      case AppStatus.ADMIN_AUTH:
      case AppStatus.ADMIN_DASHBOARD:
        return (
          <AdminView 
            onBack={() => setStatus(AppStatus.LOCKED)} 
          />
        );
      case AppStatus.UNLOCKED:
        return (
          <MainAppView 
            onLock={() => {
              setStatus(AppStatus.LOCKED);
              setSystemId("");
            }} 
            systemId={systemId}
            settings={settings}
            updateSettings={updateSettings}
          />
        );
      default:
        return <AuthView 
          onUnlock={handleUnlock} 
          triggerAdminMode={() => setStatus(AppStatus.ADMIN_AUTH)}
          settings={settings}
          updateSettings={updateSettings}
        />;
    }
  };

  return (
    <div className="selection:bg-slate-200">
      {renderView()}
    </div>
  );
};

export default App;
