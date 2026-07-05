export interface HistoryItem {
  id: string;
  title: string;
  points: number;
  date: string;
  type: 'recharge' | 'chat' | 'gift';
}

export interface User {
  name: string;
  avatarUrl: string;
}
