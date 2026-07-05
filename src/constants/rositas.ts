import { Product, Transaction } from '../types/rositas';

export const PRODUCTS: Product[] = [
  {
    id: 'start',
    tierName: 'START',
    price: 'R$19,90',
    rositasAmount: 100,
    pinkPoints: 200,
    description: 'Comece sua jornada: suba anúncios, poste stories e experimente os recursos da Faixa Rosa.',
    highlightColor: false,
  },
  {
    id: 'essencial',
    tierName: 'ESSENCIAL',
    price: 'R$59,90',
    rositasAmount: 300,
    pinkPoints: 600,
    description: 'Mantenha seu perfil ativo, ganhe visibilidade e conquiste novos clientes.',
    highlightColor: false,
  },
  {
    id: 'top',
    tierName: 'TOP',
    price: 'R$139,90',
    rositasAmount: 700,
    pinkPoints: 1400,
    description: 'Destaques frequentes, stories fixados e liberdade total pra investir na sua imagem.',
    bonusText: '+10% Bônus',
    isRecommended: true,
    highlightColor: true,
  },
  {
    id: 'premium',
    tierName: 'PREMIUM',
    price: 'R$299,90',
    rositasAmount: 1500,
    pinkPoints: 3000,
    description: 'Domine as buscas, conquiste posição de destaque e mostre seu melhor lado todos os dias.',
    bonusText: '+20% Bônus',
    highlightColor: false,
  },
  {
    id: 'black',
    tierName: 'BLACK',
    price: 'R$599,90',
    rositasAmount: 3000,
    pinkPoints: 6000,
    description: 'O topo é seu lugar: máximo destaque, visibilidade total e status de elite dentro da Faixa Rosa.',
    bonusText: '+30% Bônus',
    highlightColor: false,
  },
];

export const HISTORY: Transaction[] = [
  {
    id: '1',
    title: 'Compra de Rositas',
    amount: 250,
    currencyType: 'rositas',
    date: '15 de Julho, 2024'
  },
  {
    id: '2',
    title: 'Presente para Sofia',
    amount: -50,
    currencyType: 'love',
    date: '14 de Julho, 2024'
  }
];
