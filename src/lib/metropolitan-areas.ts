export interface City {
  name: string;
  state: string;
  fullName: string;
}

export interface MetropolitanArea {
  name: string;
  mainCity: City;
  cities: City[];
}

// TODAS as cidades brasileiras - amostra das principais + sistema para gerar qualquer cidade
export const mainCities: City[] = [
  // TODAS AS CAPITAIS
  { name: 'Rio Branco', state: 'AC', fullName: 'Rio Branco - AC' },
  { name: 'Maceió', state: 'AL', fullName: 'Maceió - AL' },
  { name: 'Macapá', state: 'AP', fullName: 'Macapá - AP' },
  { name: 'Manaus', state: 'AM', fullName: 'Manaus - AM' },
  { name: 'Salvador', state: 'BA', fullName: 'Salvador - BA' },
  { name: 'Fortaleza', state: 'CE', fullName: 'Fortaleza - CE' },
  { name: 'Brasília', state: 'DF', fullName: 'Brasília - DF' },
  { name: 'Vitória', state: 'ES', fullName: 'Vitória - ES' },
  { name: 'Goiânia', state: 'GO', fullName: 'Goiânia - GO' },
  { name: 'São Luís', state: 'MA', fullName: 'São Luís - MA' },
  { name: 'Cuiabá', state: 'MT', fullName: 'Cuiabá - MT' },
  { name: 'Campo Grande', state: 'MS', fullName: 'Campo Grande - MS' },
  { name: 'Belo Horizonte', state: 'MG', fullName: 'Belo Horizonte - MG' },
  { name: 'Belém', state: 'PA', fullName: 'Belém - PA' },
  { name: 'João Pessoa', state: 'PB', fullName: 'João Pessoa - PB' },
  { name: 'Recife', state: 'PE', fullName: 'Recife - PE' },
  { name: 'Teresina', state: 'PI', fullName: 'Teresina - PI' },
  { name: 'Curitiba', state: 'PR', fullName: 'Curitiba - PR' },
  { name: 'Rio de Janeiro', state: 'RJ', fullName: 'Rio de Janeiro - RJ' },
  { name: 'Natal', state: 'RN', fullName: 'Natal - RN' },
  { name: 'Porto Velho', state: 'RO', fullName: 'Porto Velho - RO' },
  { name: 'Boa Vista', state: 'RR', fullName: 'Boa Vista - RR' },
  { name: 'Porto Alegre', state: 'RS', fullName: 'Porto Alegre - RS' },
  { name: 'Florianópolis', state: 'SC', fullName: 'Florianópolis - SC' },
  { name: 'Aracaju', state: 'SE', fullName: 'Aracaju - SE' },
  { name: 'São Paulo', state: 'SP', fullName: 'São Paulo - SP' },
  { name: 'Palmas', state: 'TO', fullName: 'Palmas - TO' },

  // GRANDES CENTROS URBANOS - SP
  { name: 'Guarulhos', state: 'SP', fullName: 'Guarulhos - SP' },
  { name: 'Campinas', state: 'SP', fullName: 'Campinas - SP' },
  { name: 'São Bernardo do Campo', state: 'SP', fullName: 'São Bernardo do Campo - SP' },
  { name: 'Santo André', state: 'SP', fullName: 'Santo André - SP' },
  { name: 'Osasco', state: 'SP', fullName: 'Osasco - SP' },
  { name: 'Ribeirão Preto', state: 'SP', fullName: 'Ribeirão Preto - SP' },
  { name: 'Sorocaba', state: 'SP', fullName: 'Sorocaba - SP' },
  { name: 'Santos', state: 'SP', fullName: 'Santos - SP' },
  { name: 'Mauá', state: 'SP', fullName: 'Mauá - SP' },
  { name: 'São José dos Campos', state: 'SP', fullName: 'São José dos Campos - SP' },
  { name: 'Mogi das Cruzes', state: 'SP', fullName: 'Mogi das Cruzes - SP' },
  { name: 'Diadema', state: 'SP', fullName: 'Diadema - SP' },
  { name: 'Jundiaí', state: 'SP', fullName: 'Jundiaí - SP' },
  { name: 'Carapicuíba', state: 'SP', fullName: 'Carapicuíba - SP' },
  { name: 'Piracicaba', state: 'SP', fullName: 'Piracicaba - SP' },
  { name: 'Bauru', state: 'SP', fullName: 'Bauru - SP' },
  { name: 'São Vicente', state: 'SP', fullName: 'São Vicente - SP' },
  { name: 'Itaquaquecetuba', state: 'SP', fullName: 'Itaquaquecetuba - SP' },
  { name: 'Franca', state: 'SP', fullName: 'Franca - SP' },
  { name: 'Guarujá', state: 'SP', fullName: 'Guarujá - SP' },

  // RIO DE JANEIRO
  { name: 'São Gonçalo', state: 'RJ', fullName: 'São Gonçalo - RJ' },
  { name: 'Duque de Caxias', state: 'RJ', fullName: 'Duque de Caxias - RJ' },
  { name: 'Nova Iguaçu', state: 'RJ', fullName: 'Nova Iguaçu - RJ' },
  { name: 'Niterói', state: 'RJ', fullName: 'Niterói - RJ' },
  { name: 'Belford Roxo', state: 'RJ', fullName: 'Belford Roxo - RJ' },
  { name: 'São João de Meriti', state: 'RJ', fullName: 'São João de Meriti - RJ' },
  { name: 'Campos dos Goytacazes', state: 'RJ', fullName: 'Campos dos Goytacazes - RJ' },
  { name: 'Petrópolis', state: 'RJ', fullName: 'Petrópolis - RJ' },
  { name: 'Volta Redonda', state: 'RJ', fullName: 'Volta Redonda - RJ' },
  { name: 'Magé', state: 'RJ', fullName: 'Magé - RJ' },

  // MINAS GERAIS
  { name: 'Uberlândia', state: 'MG', fullName: 'Uberlândia - MG' },
  { name: 'Contagem', state: 'MG', fullName: 'Contagem - MG' },
  { name: 'Juiz de Fora', state: 'MG', fullName: 'Juiz de Fora - MG' },
  { name: 'Betim', state: 'MG', fullName: 'Betim - MG' },
  { name: 'Montes Claros', state: 'MG', fullName: 'Montes Claros - MG' },
  { name: 'Ribeirão das Neves', state: 'MG', fullName: 'Ribeirão das Neves - MG' },
  { name: 'Uberaba', state: 'MG', fullName: 'Uberaba - MG' },
  { name: 'Governador Valadares', state: 'MG', fullName: 'Governador Valadares - MG' },
  { name: 'Ipatinga', state: 'MG', fullName: 'Ipatinga - MG' },
  { name: 'Sete Lagoas', state: 'MG', fullName: 'Sete Lagoas - MG' },

  // BAHIA
  { name: 'Feira de Santana', state: 'BA', fullName: 'Feira de Santana - BA' },
  { name: 'Vitória da Conquista', state: 'BA', fullName: 'Vitória da Conquista - BA' },
  { name: 'Camaçari', state: 'BA', fullName: 'Camaçari - BA' },
  { name: 'Itabuna', state: 'BA', fullName: 'Itabuna - BA' },
  { name: 'Juazeiro', state: 'BA', fullName: 'Juazeiro - BA' },
  { name: 'Lauro de Freitas', state: 'BA', fullName: 'Lauro de Freitas - BA' },
  { name: 'Ilhéus', state: 'BA', fullName: 'Ilhéus - BA' },

  // PARANÁ
  { name: 'Londrina', state: 'PR', fullName: 'Londrina - PR' },
  { name: 'Maringá', state: 'PR', fullName: 'Maringá - PR' },
  { name: 'Ponta Grossa', state: 'PR', fullName: 'Ponta Grossa - PR' },
  { name: 'Cascavel', state: 'PR', fullName: 'Cascavel - PR' },
  { name: 'São José dos Pinhais', state: 'PR', fullName: 'São José dos Pinhais - PR' },
  { name: 'Foz do Iguaçu', state: 'PR', fullName: 'Foz do Iguaçu - PR' },
  { name: 'Colombo', state: 'PR', fullName: 'Colombo - PR' },
  { name: 'Guarapuava', state: 'PR', fullName: 'Guarapuava - PR' },

  // RIO GRANDE DO SUL
  { name: 'Caxias do Sul', state: 'RS', fullName: 'Caxias do Sul - RS' },
  { name: 'Pelotas', state: 'RS', fullName: 'Pelotas - RS' },
  { name: 'Canoas', state: 'RS', fullName: 'Canoas - RS' },
  { name: 'Santa Maria', state: 'RS', fullName: 'Santa Maria - RS' },
  { name: 'Gravataí', state: 'RS', fullName: 'Gravataí - RS' },
  { name: 'Viamão', state: 'RS', fullName: 'Viamão - RS' },
  { name: 'Novo Hamburgo', state: 'RS', fullName: 'Novo Hamburgo - RS' },
  { name: 'São Leopoldo', state: 'RS', fullName: 'São Leopoldo - RS' },

  // SANTA CATARINA
  { name: 'Joinville', state: 'SC', fullName: 'Joinville - SC' },
  { name: 'Blumenau', state: 'SC', fullName: 'Blumenau - SC' },
  { name: 'São José', state: 'SC', fullName: 'São José - SC' },
  { name: 'Criciúma', state: 'SC', fullName: 'Criciúma - SC' },
  { name: 'Chapecó', state: 'SC', fullName: 'Chapecó - SC' },
  { name: 'Itajaí', state: 'SC', fullName: 'Itajaí - SC' },
  { name: 'Lages', state: 'SC', fullName: 'Lages - SC' },
  { name: 'Balneário Camboriú', state: 'SC', fullName: 'Balneário Camboriú - SC' },
  { name: 'Palhoça', state: 'SC', fullName: 'Palhoça - SC' },
  { name: 'Tubarão', state: 'SC', fullName: 'Tubarão - SC' },
  { name: 'Caçador', state: 'SC', fullName: 'Caçador - SC' },
  { name: 'Brusque', state: 'SC', fullName: 'Brusque - SC' },
  { name: 'Concórdia', state: 'SC', fullName: 'Concórdia - SC' },
  { name: 'São Bento do Sul', state: 'SC', fullName: 'São Bento do Sul - SC' },
  { name: 'Camboriú', state: 'SC', fullName: 'Camboriú - SC' },
  { name: 'Jaraguá do Sul', state: 'SC', fullName: 'Jaraguá do Sul - SC' },
  { name: 'Araquari', state: 'SC', fullName: 'Araquari - SC' },
  { name: 'Balneário Gaivota', state: 'SC', fullName: 'Balneário Gaivota - SC' },
  { name: 'Sombrio', state: 'SC', fullName: 'Sombrio - SC' },
  { name: 'Laguna', state: 'SC', fullName: 'Laguna - SC' },
  { name: 'Imbituba', state: 'SC', fullName: 'Imbituba - SC' },
  { name: 'Garopaba', state: 'SC', fullName: 'Garopaba - SC' },
  { name: 'Paulo Lopes', state: 'SC', fullName: 'Paulo Lopes - SC' },
  { name: 'Tijucas', state: 'SC', fullName: 'Tijucas - SC' },
  { name: 'Governador Celso Ramos', state: 'SC', fullName: 'Governador Celso Ramos - SC' },

  // CEARÁ
  { name: 'Caucaia', state: 'CE', fullName: 'Caucaia - CE' },
  { name: 'Juazeiro do Norte', state: 'CE', fullName: 'Juazeiro do Norte - CE' },
  { name: 'Maracanaú', state: 'CE', fullName: 'Maracanaú - CE' },
  { name: 'Sobral', state: 'CE', fullName: 'Sobral - CE' },
  { name: 'Crato', state: 'CE', fullName: 'Crato - CE' },
  { name: 'Itapipoca', state: 'CE', fullName: 'Itapipoca - CE' },

  // PERNAMBUCO
  { name: 'Jaboatão dos Guararapes', state: 'PE', fullName: 'Jaboatão dos Guararapes - PE' },
  { name: 'Olinda', state: 'PE', fullName: 'Olinda - PE' },
  { name: 'Caruaru', state: 'PE', fullName: 'Caruaru - PE' },
  { name: 'Petrolina', state: 'PE', fullName: 'Petrolina - PE' },
  { name: 'Paulista', state: 'PE', fullName: 'Paulista - PE' },
  { name: 'Cabo de Santo Agostinho', state: 'PE', fullName: 'Cabo de Santo Agostinho - PE' },

  // GOIÁS
  { name: 'Aparecida de Goiânia', state: 'GO', fullName: 'Aparecida de Goiânia - GO' },
  { name: 'Anápolis', state: 'GO', fullName: 'Anápolis - GO' },
  { name: 'Rio Verde', state: 'GO', fullName: 'Rio Verde - GO' },
  { name: 'Luziânia', state: 'GO', fullName: 'Luziânia - GO' },
  { name: 'Águas Lindas de Goiás', state: 'GO', fullName: 'Águas Lindas de Goiás - GO' },

  // PARÁ
  { name: 'Ananindeua', state: 'PA', fullName: 'Ananindeua - PA' },
  { name: 'Santarém', state: 'PA', fullName: 'Santarém - PA' },
  { name: 'Marabá', state: 'PA', fullName: 'Marabá - PA' },
  { name: 'Castanhal', state: 'PA', fullName: 'Castanhal - PA' },
  { name: 'Parauapebas', state: 'PA', fullName: 'Parauapebas - PA' },

  // MARANHÃO
  { name: 'São José de Ribamar', state: 'MA', fullName: 'São José de Ribamar - MA' },
  { name: 'Timon', state: 'MA', fullName: 'Timon - MA' },
  { name: 'Caxias', state: 'MA', fullName: 'Caxias - MA' },
  { name: 'Codó', state: 'MA', fullName: 'Codó - MA' },
  { name: 'Paço do Lumiar', state: 'MA', fullName: 'Paço do Lumiar - MA' },

  // E muitas outras cidades importantes...
  // O sistema agora pode gerar bairros para QUALQUER cidade brasileira
];

// Regiões metropolitanas das principais cidades
export const metropolitanAreas: MetropolitanArea[] = [
  {
    name: 'Região Metropolitana do Recife',
    mainCity: { name: 'Recife', state: 'PE', fullName: 'Recife - PE' },
    cities: [
      { name: 'Recife', state: 'PE', fullName: 'Recife - PE' },
      { name: 'Olinda', state: 'PE', fullName: 'Olinda - PE' },
      { name: 'Jaboatão dos Guararapes', state: 'PE', fullName: 'Jaboatão dos Guararapes - PE' },
      { name: 'Paulista', state: 'PE', fullName: 'Paulista - PE' },
      { name: 'Cabo de Santo Agostinho', state: 'PE', fullName: 'Cabo de Santo Agostinho - PE' },
      { name: 'Camaragibe', state: 'PE', fullName: 'Camaragibe - PE' },
      { name: 'Igarassu', state: 'PE', fullName: 'Igarassu - PE' },
      { name: 'Abreu e Lima', state: 'PE', fullName: 'Abreu e Lima - PE' },
      { name: 'São Lourenço da Mata', state: 'PE', fullName: 'São Lourenço da Mata - PE' },
      { name: 'Moreno', state: 'PE', fullName: 'Moreno - PE' },
      { name: 'Ipojuca', state: 'PE', fullName: 'Ipojuca - PE' },
      { name: 'Araçoiaba', state: 'PE', fullName: 'Araçoiaba - PE' },
      { name: 'Itapissuma', state: 'PE', fullName: 'Itapissuma - PE' },
      { name: 'Itamaracá', state: 'PE', fullName: 'Itamaracá - PE' }
    ]
  },
  {
    name: 'Região Metropolitana de São Paulo',
    mainCity: { name: 'São Paulo', state: 'SP', fullName: 'São Paulo - SP' },
    cities: [
      { name: 'São Paulo', state: 'SP', fullName: 'São Paulo - SP' },
      { name: 'Guarulhos', state: 'SP', fullName: 'Guarulhos - SP' },
      { name: 'Osasco', state: 'SP', fullName: 'Osasco - SP' },
      { name: 'Santo André', state: 'SP', fullName: 'Santo André - SP' },
      { name: 'São Bernardo do Campo', state: 'SP', fullName: 'São Bernardo do Campo - SP' },
      { name: 'Mauá', state: 'SP', fullName: 'Mauá - SP' },
      { name: 'Diadema', state: 'SP', fullName: 'Diadema - SP' },
      { name: 'Carapicuíba', state: 'SP', fullName: 'Carapicuíba - SP' },
      { name: 'Barueri', state: 'SP', fullName: 'Barueri - SP' },
      { name: 'Taboão da Serra', state: 'SP', fullName: 'Taboão da Serra - SP' },
      { name: 'Embu das Artes', state: 'SP', fullName: 'Embu das Artes - SP' },
      { name: 'Cotia', state: 'SP', fullName: 'Cotia - SP' },
      { name: 'Itaquaquecetuba', state: 'SP', fullName: 'Itaquaquecetuba - SP' },
      { name: 'Suzano', state: 'SP', fullName: 'Suzano - SP' },
      { name: 'Mogi das Cruzes', state: 'SP', fullName: 'Mogi das Cruzes - SP' },
      { name: 'Ferraz de Vasconcelos', state: 'SP', fullName: 'Ferraz de Vasconcelos - SP' }
    ]
  },
  {
    name: 'Região Metropolitana do Rio de Janeiro',
    mainCity: { name: 'Rio de Janeiro', state: 'RJ', fullName: 'Rio de Janeiro - RJ' },
    cities: [
      { name: 'Rio de Janeiro', state: 'RJ', fullName: 'Rio de Janeiro - RJ' },
      { name: 'Niterói', state: 'RJ', fullName: 'Niterói - RJ' },
      { name: 'Duque de Caxias', state: 'RJ', fullName: 'Duque de Caxias - RJ' },
      { name: 'São Gonçalo', state: 'RJ', fullName: 'São Gonçalo - RJ' },
      { name: 'Nova Iguaçu', state: 'RJ', fullName: 'Nova Iguaçu - RJ' },
      { name: 'Belford Roxo', state: 'RJ', fullName: 'Belford Roxo - RJ' },
      { name: 'São João de Meriti', state: 'RJ', fullName: 'São João de Meriti - RJ' },
      { name: 'Magé', state: 'RJ', fullName: 'Magé - RJ' },
      { name: 'Itaboraí', state: 'RJ', fullName: 'Itaboraí - RJ' },
      { name: 'Mesquita', state: 'RJ', fullName: 'Mesquita - RJ' },
      { name: 'Nilópolis', state: 'RJ', fullName: 'Nilópolis - RJ' },
      { name: 'Queimados', state: 'RJ', fullName: 'Queimados - RJ' }
    ]
  },
  {
    name: 'Região Metropolitana de Belo Horizonte',
    mainCity: { name: 'Belo Horizonte', state: 'MG', fullName: 'Belo Horizonte - MG' },
    cities: [
      { name: 'Belo Horizonte', state: 'MG', fullName: 'Belo Horizonte - MG' },
      { name: 'Contagem', state: 'MG', fullName: 'Contagem - MG' },
      { name: 'Betim', state: 'MG', fullName: 'Betim - MG' },
      { name: 'Ribeirão das Neves', state: 'MG', fullName: 'Ribeirão das Neves - MG' },
      { name: 'Santa Luzia', state: 'MG', fullName: 'Santa Luzia - MG' },
      { name: 'Sabará', state: 'MG', fullName: 'Sabará - MG' },
      { name: 'Vespasiano', state: 'MG', fullName: 'Vespasiano - MG' },
      { name: 'Lagoa Santa', state: 'MG', fullName: 'Lagoa Santa - MG' }
    ]
  },
  {
    name: 'Região Metropolitana de Salvador',
    mainCity: { name: 'Salvador', state: 'BA', fullName: 'Salvador - BA' },
    cities: [
      { name: 'Salvador', state: 'BA', fullName: 'Salvador - BA' },
      { name: 'Feira de Santana', state: 'BA', fullName: 'Feira de Santana - BA' },
      { name: 'Camaçari', state: 'BA', fullName: 'Camaçari - BA' },
      { name: 'Lauro de Freitas', state: 'BA', fullName: 'Lauro de Freitas - BA' },
      { name: 'Simões Filho', state: 'BA', fullName: 'Simões Filho - BA' },
      { name: 'Candeias', state: 'BA', fullName: 'Candeias - BA' },
      { name: 'Dias d\'Ávila', state: 'BA', fullName: 'Dias d\'Ávila - BA' },
      { name: 'Mata de São João', state: 'BA', fullName: 'Mata de São João - BA' },
      { name: 'São Francisco do Conde', state: 'BA', fullName: 'São Francisco do Conde - BA' },
      { name: 'Vera Cruz', state: 'BA', fullName: 'Vera Cruz - BA' }
    ]
  },
  {
    name: 'Região Metropolitana de Fortaleza',
    mainCity: { name: 'Fortaleza', state: 'CE', fullName: 'Fortaleza - CE' },
    cities: [
      { name: 'Fortaleza', state: 'CE', fullName: 'Fortaleza - CE' },
      { name: 'Caucaia', state: 'CE', fullName: 'Caucaia - CE' },
      { name: 'Maracanaú', state: 'CE', fullName: 'Maracanaú - CE' },
      { name: 'Maranguape', state: 'CE', fullName: 'Maranguape - CE' },
      { name: 'Aquiraz', state: 'CE', fullName: 'Aquiraz - CE' },
      { name: 'Pacatuba', state: 'CE', fullName: 'Pacatuba - CE' },
      { name: 'Eusébio', state: 'CE', fullName: 'Eusébio - CE' },
      { name: 'Itaitinga', state: 'CE', fullName: 'Itaitinga - CE' },
      { name: 'Guaiúba', state: 'CE', fullName: 'Guaiúba - CE' }
    ]
  },
  {
    name: 'Região Metropolitana de Porto Alegre',
    mainCity: { name: 'Porto Alegre', state: 'RS', fullName: 'Porto Alegre - RS' },
    cities: [
      { name: 'Porto Alegre', state: 'RS', fullName: 'Porto Alegre - RS' },
      { name: 'Canoas', state: 'RS', fullName: 'Canoas - RS' },
      { name: 'Gravataí', state: 'RS', fullName: 'Gravataí - RS' },
      { name: 'Viamão', state: 'RS', fullName: 'Viamão - RS' },
      { name: 'Novo Hamburgo', state: 'RS', fullName: 'Novo Hamburgo - RS' },
      { name: 'São Leopoldo', state: 'RS', fullName: 'São Leopoldo - RS' },
      { name: 'Cachoeirinha', state: 'RS', fullName: 'Cachoeirinha - RS' },
      { name: 'Alvorada', state: 'RS', fullName: 'Alvorada - RS' },
      { name: 'Sapucaia do Sul', state: 'RS', fullName: 'Sapucaia do Sul - RS' },
      { name: 'Esteio', state: 'RS', fullName: 'Esteio - RS' }
    ]
  },
  {
    name: 'Região Metropolitana de Curitiba',
    mainCity: { name: 'Curitiba', state: 'PR', fullName: 'Curitiba - PR' },
    cities: [
      { name: 'Curitiba', state: 'PR', fullName: 'Curitiba - PR' },
      { name: 'São José dos Pinhais', state: 'PR', fullName: 'São José dos Pinhais - PR' },
      { name: 'Colombo', state: 'PR', fullName: 'Colombo - PR' },
      { name: 'Pinhais', state: 'PR', fullName: 'Pinhais - PR' },
      { name: 'Araucária', state: 'PR', fullName: 'Araucária - PR' },
      { name: 'Fazenda Rio Grande', state: 'PR', fullName: 'Fazenda Rio Grande - PR' },
      { name: 'Almirante Tamandaré', state: 'PR', fullName: 'Almirante Tamandaré - PR' },
      { name: 'Campo Largo', state: 'PR', fullName: 'Campo Largo - PR' },
      { name: 'Piraquara', state: 'PR', fullName: 'Piraquara - PR' }
    ]
  }
];

// Função para buscar região metropolitana de uma cidade
export const getMetropolitanArea = (cityName: string, stateName: string): MetropolitanArea | null => {
  return metropolitanAreas.find(area => 
    area.mainCity.name === cityName && area.mainCity.state === stateName
  ) || null;
};

// Função para verificar se uma cidade tem região metropolitana
export const hasMetropolitanArea = (cityName: string, stateName: string): boolean => {
  return getMetropolitanArea(cityName, stateName) !== null;
};