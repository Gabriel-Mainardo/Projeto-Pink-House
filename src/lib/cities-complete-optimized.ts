interface City {
  name: string;
  state: string;
}

// Lista otimizada de cidades brasileiras - versão compacta
export const brazilianCities: City[] = [
  // Pernambuco (principal)
  { name: "Recife", state: "Pernambuco" },
  { name: "Olinda", state: "Pernambuco" },
  { name: "Jaboatão dos Guararapes", state: "Pernambuco" },
  { name: "Paulista", state: "Pernambuco" },
  { name: "Cabo de Santo Agostinho", state: "Pernambuco" },
  { name: "Camaragibe", state: "Pernambuco" },
  { name: "Igarassu", state: "Pernambuco" },
  { name: "Abreu e Lima", state: "Pernambuco" },
  { name: "São Lourenço da Mata", state: "Pernambuco" },
  { name: "Ouricuri", state: "Pernambuco" },
  { name: "Caruaru", state: "Pernambuco" },
  { name: "Petrolina", state: "Pernambuco" },
  { name: "Garanhuns", state: "Pernambuco" },
  { name: "Vitória de Santo Antão", state: "Pernambuco" },
  { name: "Ipojuca", state: "Pernambuco" },
  
  // São Paulo
  { name: "São Paulo", state: "São Paulo" },
  { name: "Guarulhos", state: "São Paulo" },
  { name: "Campinas", state: "São Paulo" },
  { name: "São Bernardo do Campo", state: "São Paulo" },
  { name: "Santo André", state: "São Paulo" },
  { name: "Osasco", state: "São Paulo" },
  { name: "Ribeirão Preto", state: "São Paulo" },
  { name: "Sorocaba", state: "São Paulo" },
  { name: "Mauá", state: "São Paulo" },
  { name: "São José dos Campos", state: "São Paulo" },
  { name: "Mogi das Cruzes", state: "São Paulo" },
  { name: "Diadema", state: "São Paulo" },
  { name: "Jundiaí", state: "São Paulo" },
  { name: "Carapicuíba", state: "São Paulo" },
  { name: "Piracicaba", state: "São Paulo" },
  
  // Rio de Janeiro
  { name: "Rio de Janeiro", state: "Rio de Janeiro" },
  { name: "São Gonçalo", state: "Rio de Janeiro" },
  { name: "Duque de Caxias", state: "Rio de Janeiro" },
  { name: "Nova Iguaçu", state: "Rio de Janeiro" },
  { name: "Niterói", state: "Rio de Janeiro" },
  { name: "Belford Roxo", state: "Rio de Janeiro" },
  { name: "São João de Meriti", state: "Rio de Janeiro" },
  { name: "Campos dos Goytacazes", state: "Rio de Janeiro" },
  { name: "Petrópolis", state: "Rio de Janeiro" },
  { name: "Volta Redonda", state: "Rio de Janeiro" },
  
  // Minas Gerais
  { name: "Belo Horizonte", state: "Minas Gerais" },
  { name: "Uberlândia", state: "Minas Gerais" },
  { name: "Contagem", state: "Minas Gerais" },
  { name: "Juiz de Fora", state: "Minas Gerais" },
  { name: "Betim", state: "Minas Gerais" },
  { name: "Montes Claros", state: "Minas Gerais" },
  { name: "Ribeirão das Neves", state: "Minas Gerais" },
  { name: "Uberaba", state: "Minas Gerais" },
  { name: "Governador Valadares", state: "Minas Gerais" },
  { name: "Ipatinga", state: "Minas Gerais" },
  
  // Bahia
  { name: "Salvador", state: "Bahia" },
  { name: "Feira de Santana", state: "Bahia" },
  { name: "Vitória da Conquista", state: "Bahia" },
  { name: "Camaçari", state: "Bahia" },
  { name: "Juazeiro", state: "Bahia" },
  { name: "Ilhéus", state: "Bahia" },
  { name: "Itabuna", state: "Bahia" },
  { name: "Lauro de Freitas", state: "Bahia" },
  { name: "Jequié", state: "Bahia" },
  { name: "Teixeira de Freitas", state: "Bahia" },
  
  // Ceará
  { name: "Fortaleza", state: "Ceará" },
  { name: "Caucaia", state: "Ceará" },
  { name: "Juazeiro do Norte", state: "Ceará" },
  { name: "Maracanaú", state: "Ceará" },
  { name: "Sobral", state: "Ceará" },
  { name: "Crato", state: "Ceará" },
  { name: "Itapipoca", state: "Ceará" },
  { name: "Maranguape", state: "Ceará" },
  { name: "Iguatu", state: "Ceará" },
  { name: "Quixadá", state: "Ceará" },
  
  // Paraná
  { name: "Curitiba", state: "Paraná" },
  { name: "Londrina", state: "Paraná" },
  { name: "Maringá", state: "Paraná" },
  { name: "Ponta Grossa", state: "Paraná" },
  { name: "Cascavel", state: "Paraná" },
  { name: "São José dos Pinhais", state: "Paraná" },
  { name: "Foz do Iguaçu", state: "Paraná" },
  { name: "Colombo", state: "Paraná" },
  { name: "Guarapuava", state: "Paraná" },
  { name: "Paranaguá", state: "Paraná" },
  
  // Rio Grande do Sul
  { name: "Porto Alegre", state: "Rio Grande do Sul" },
  { name: "Caxias do Sul", state: "Rio Grande do Sul" },
  { name: "Pelotas", state: "Rio Grande do Sul" },
  { name: "Canoas", state: "Rio Grande do Sul" },
  { name: "Santa Maria", state: "Rio Grande do Sul" },
  { name: "Gravataí", state: "Rio Grande do Sul" },
  { name: "Viamão", state: "Rio Grande do Sul" },
  { name: "Novo Hamburgo", state: "Rio Grande do Sul" },
  { name: "São Leopoldo", state: "Rio Grande do Sul" },
  { name: "Rio Grande", state: "Rio Grande do Sul" },
  
  // Distrito Federal
  { name: "Brasília", state: "Distrito Federal" },
  
  // Goiás
  { name: "Goiânia", state: "Goiás" },
  { name: "Aparecida de Goiânia", state: "Goiás" },
  { name: "Anápolis", state: "Goiás" },
  { name: "Rio Verde", state: "Goiás" },
  { name: "Luziânia", state: "Goiás" },
  
  // Pará
  { name: "Belém", state: "Pará" },
  { name: "Ananindeua", state: "Pará" },
  { name: "Santarém", state: "Pará" },
  { name: "Marabá", state: "Pará" },
  { name: "Parauapebas", state: "Pará" },
  
  // Amazonas
  { name: "Manaus", state: "Amazonas" },
  { name: "Parintins", state: "Amazonas" },
  { name: "Itacoatiara", state: "Amazonas" },
  { name: "Manacapuru", state: "Amazonas" },
  { name: "Coari", state: "Amazonas" },
  
  // Espírito Santo
  { name: "Vitória", state: "Espírito Santo" },
  { name: "Vila Velha", state: "Espírito Santo" },
  { name: "Cariacica", state: "Espírito Santo" },
  { name: "Serra", state: "Espírito Santo" },
  { name: "Cachoeiro de Itapemirim", state: "Espírito Santo" },
  
  // Santa Catarina
  { name: "Florianópolis", state: "Santa Catarina" },
  { name: "Joinville", state: "Santa Catarina" },
  { name: "Blumenau", state: "Santa Catarina" },
  { name: "São José", state: "Santa Catarina" },
  { name: "Criciúma", state: "Santa Catarina" },
  
  // Maranhão
  { name: "São Luís", state: "Maranhão" },
  { name: "Imperatriz", state: "Maranhão" },
  { name: "São José de Ribamar", state: "Maranhão" },
  { name: "Timon", state: "Maranhão" },
  { name: "Caxias", state: "Maranhão" },
  
  // Alagoas
  { name: "Maceió", state: "Alagoas" },
  { name: "Arapiraca", state: "Alagoas" },
  { name: "Rio Largo", state: "Alagoas" },
  { name: "Palmeira dos Índios", state: "Alagoas" },
  { name: "União dos Palmares", state: "Alagoas" },
  
  // Sergipe
  { name: "Aracaju", state: "Sergipe" },
  { name: "Nossa Senhora do Socorro", state: "Sergipe" },
  { name: "Lagarto", state: "Sergipe" },
  { name: "Itabaiana", state: "Sergipe" },
  { name: "São Cristóvão", state: "Sergipe" },
  
  // Paraíba
  { name: "João Pessoa", state: "Paraíba" },
  { name: "Campina Grande", state: "Paraíba" },
  { name: "Santa Rita", state: "Paraíba" },
  { name: "Patos", state: "Paraíba" },
  { name: "Bayeux", state: "Paraíba" },
  
  // Rio Grande do Norte
  { name: "Natal", state: "Rio Grande do Norte" },
  { name: "Mossoró", state: "Rio Grande do Norte" },
  { name: "Parnamirim", state: "Rio Grande do Norte" },
  { name: "São Gonçalo do Amarante", state: "Rio Grande do Norte" },
  { name: "Macaíba", state: "Rio Grande do Norte" },
  
  // Piauí
  { name: "Teresina", state: "Piauí" },
  { name: "Parnaíba", state: "Piauí" },
  { name: "Picos", state: "Piauí" },
  { name: "Piripiri", state: "Piauí" },
  { name: "Floriano", state: "Piauí" }
];



