
export type Language = 'mr' | 'hi' | 'en';
export type ThemeType = 'indigo' | 'sky' | 'emerald' | 'rose' | 'violet' | 'amber';

export interface AppSettings {
  language: Language;
  theme: ThemeType;
}

export interface SystemState {
  isUnlocked: boolean;
  isAdminMode: boolean;
  systemId: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TradeEntry {
  id: string;
  segment: string;
  symbol: string;
  qty: number;
  entryPrice: number;
  slPrice: number;
  targetPrice: number;
  // Post trade fields
  exitPrice?: number;
  status: 'OPEN' | 'PROFIT' | 'LOSS';
  emotion: string;
  image?: string; // Base64 string for the screenshot
  timestamp: number;
  closedTimestamp?: number;
}

export interface DiaryEntry {
  id: string;
  text: string;
  timestamp: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export enum AppStatus {
  LOCKED = 'LOCKED',
  ADMIN_AUTH = 'ADMIN_AUTH',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  UNLOCKED = 'UNLOCKED'
}
