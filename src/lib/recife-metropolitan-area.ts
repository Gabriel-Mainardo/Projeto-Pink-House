// Região Metropolitana do Recife (RMR)
export const metropolitanCities = [
  'Recife',
  'Olinda',
  'Jaboatão dos Guararapes',
  'Paulista',
  'Cabo de Santo Agostinho',
  'Camaragibe',
  'Igarassu',
  'Abreu e Lima',
  'São Lourenço da Mata',
  'Araçoiaba',
  'Ipojuca',
  'Itapissuma',
  'Itamaracá',
  'Moreno'
];

// Opções de filtro
export const locationFilterOptions = [
  { value: 'recife', label: 'Recife' },
  { value: 'regiao-metropolitana', label: 'Região Metropolitana' }
];

// Função helper para verificar se uma cidade está na RMR
export const isInMetropolitanArea = (cityName: string): boolean => {
  const cityLower = cityName.toLowerCase().trim();
  return metropolitanCities.some(city =>
    cityLower.includes(city.toLowerCase()) ||
    city.toLowerCase().includes(cityLower)
  );
};
