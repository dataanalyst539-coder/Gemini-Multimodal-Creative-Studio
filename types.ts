
export type AppView = 'dashboard' | 'search' | 'image' | 'voice' | 'video';

export interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}

// Fixed missing UserProfile interface reported in UpgradeModal.tsx
export interface UserProfile {
  id: string;
  tier: 'free' | 'pro';
  email?: string;
}
