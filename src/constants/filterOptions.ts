export const LOCATION_OPTIONS = [
  { id: 'near', label: 'Perto de mim' },
  { id: 'center', label: 'Centro' },
  { id: 'south', label: 'Zona Sul' },
  { id: 'east', label: 'Zona Leste' },
];

export const AVAILABILITY_OPTIONS = [
  { id: 'now', label: 'Disponível agora' },
  { id: 'schedule', label: 'Aceita agendamento' },
  { id: 'today', label: 'Atende hoje' },
];

export const PRICE_OPTIONS = [
  { id: '200', label: 'R$ 200+' },
  { id: '300', label: 'R$ 300+' },
  { id: '400', label: 'R$ 400+' },
  { id: '600', label: 'R$ 600+' },
];

export const SERVICE_TYPE_OPTIONS = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'motel', label: 'Motel' },
  { id: 'residence', label: 'Residência' },
  { id: 'travel', label: 'Viagens' },
];

export const SECURITY_OPTIONS = [
  { id: 'verified', label: 'Perfil verificado' },
  { id: 'high_trust', label: 'Confiabilidade alta' },
];

export const PHYSICAL_STYLE_OPTIONS = [
  { id: 'brunette', label: 'Morena' },
  { id: 'blonde', label: 'Loira' },
  { id: 'redhead', label: 'Ruiva' },
  { id: 'black', label: 'Negra' },
  { id: 'asian', label: 'Asiática' },
  { id: 'tattooed', label: 'Tatuada' },
  { id: 'fitness', label: 'Fitness' },
];

export const AGE_OPTIONS = [
  { id: '18-22', label: '18-22' },
  { id: '23-27', label: '23-27' },
  { id: '28-35', label: '28-35' },
  { id: '35+', label: '35+' },
];

export const BODY_OPTIONS = [
  { id: 'thin', label: 'Magra' },
  { id: 'curvy', label: 'Curvilínea' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'plus', label: 'Plus Size' },
];

export const MAIN_SERVICES_OPTIONS = [
  { id: 'gfe', label: 'GFE' },
  { id: 'massage', label: 'Massagem' },
  { id: 'strip', label: 'Striptease' },
  { id: 'dom', label: 'Dominação leve' },
  { id: 'events', label: 'Companhia para eventos' },
];

export const PREMIUM_FILTERS_OPTIONS = [
  { id: 'video', label: 'Com vídeo' },
  { id: 'audio', label: 'Com áudio' },
  { id: 'pinkflash', label: 'Com PinkFlash' },
  { id: 'rated', label: 'Mais avaliadas' },
  { id: 'fast', label: 'Responde rápido' },
];

export const INITIAL_SELECTED_STATE = {
  location: [],
  availability: [],
  price: [],
  serviceType: [],
  security: [],
  physical: [],
  age: [],
  body: [],
  services: [],
  premium: [],
};
