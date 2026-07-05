import { HistoryItem } from '../types/pinkpoints';

export const HISTORY_DATA: HistoryItem[] = [
  {
    id: '1',
    title: 'Recarga R$20',
    points: 200,
    date: 'Hoje',
    type: 'recharge',
  },
  {
    id: '2',
    title: 'Chat com Maria',
    points: 50,
    date: 'Ontem',
    type: 'chat',
  },
  {
    id: '3',
    title: 'Enviou Presente 💝',
    points: 500,
    date: '24/05/24',
    type: 'gift',
  },
];

export const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'Mensagens', href: '#' },
  { label: 'Subidas', href: '#' },
  { label: 'Carteira', href: '#', active: true },
  { label: 'Conta', href: '#' },
];
