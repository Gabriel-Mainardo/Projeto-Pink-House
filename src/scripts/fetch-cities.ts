import fs from 'fs';
import path from 'path';

interface City {
  name: string;
  state: string;
}

async function fetchCities() {
  try {
    console.log('Buscando cidades do Brasil...');
    
    // Buscar estados primeiro
    const statesResponse = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    const states = await statesResponse.json();
    
    let allCities: City[] = [];
    
    // Para cada estado, buscar suas cidades
    for (const state of states) {
      console.log(`Buscando cidades de ${state.nome}...`);
      const citiesResponse = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.id}/municipios?orderBy=nome`);
      const cities = await citiesResponse.json();
      
      allCities = allCities.concat(
        cities.map((city: any) => ({
          name: city.nome,
          state: state.sigla
        }))
      );
    }

    // Criar o conteúdo do arquivo
    const fileContent = `interface City {
  name: string;
  state: string;
}

export const brazilianCities: City[] = ${JSON.stringify(allCities, null, 2)};

export const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const citiesByState = brazilianCities.reduce((acc, city) => {
  if (!acc[city.state]) {
    acc[city.state] = [];
  }
  acc[city.state].push(city.name);
  return acc;
}, {} as Record<string, string[]>);
`;

    // Salvar o arquivo
    fs.writeFileSync(
      path.join(process.cwd(), 'src', 'lib', 'cities-complete.ts'),
      fileContent,
      'utf-8'
    );

    console.log('Lista de cidades salva com sucesso!');
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
  }
}

fetchCities(); 