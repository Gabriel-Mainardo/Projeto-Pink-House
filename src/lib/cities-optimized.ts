// Lista otimizada com apenas 14 cidades principais do Brasil
// Formato { name, state } para LocationContext
export const brazilianCities = [
  { name: 'São Paulo', state: 'SP' },
  { name: 'Rio de Janeiro', state: 'RJ' },
  { name: 'Brasília', state: 'DF' },
  { name: 'Salvador', state: 'BA' },
  { name: 'Fortaleza', state: 'CE' },
  { name: 'Belo Horizonte', state: 'MG' },
  { name: 'Manaus', state: 'AM' },
  { name: 'Curitiba', state: 'PR' },
  { name: 'Recife', state: 'PE' },
  { name: 'Goiânia', state: 'GO' },
  { name: 'Porto Alegre', state: 'RS' },
  { name: 'Belém', state: 'PA' },
  { name: 'Guarulhos', state: 'SP' },
  { name: 'Campinas', state: 'SP' }
];

export const citiesByState = {
  SP: ['São Paulo', 'Guarulhos', 'Campinas'],
  RJ: ['Rio de Janeiro'],
  DF: ['Brasília'],
  BA: ['Salvador'],
  CE: ['Fortaleza'],
  MG: ['Belo Horizonte'],
  AM: ['Manaus'],
  PR: ['Curitiba'],
  PE: ['Recife'],
  GO: ['Goiânia'],
  RS: ['Porto Alegre'],
  PA: ['Belém']
};

export const states = Object.keys(citiesByState);

// Versão para compatibilidade com componentes que esperam array de strings
export const allBrazilianCities = brazilianCities.map(c => `${c.name} - ${c.state}`);
