// Serviço para buscar bairros de qualquer cidade brasileira

export interface Neighborhood {
  name: string;
  city: string;
  state: string;
}

// Cache de bairros por cidade
const neighborhoodCache: Record<string, Neighborhood[]> = {};

// Função para normalizar texto (remover acentos)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Lista completa de bairros das principais cidades brasileiras
const allNeighborhoods: Record<string, Neighborhood[]> = {
  // REGIÃO SUDESTE
  'São Paulo': [
    { name: 'Aclimação', city: 'São Paulo', state: 'SP' },
    { name: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    { name: 'Brooklin', city: 'São Paulo', state: 'SP' },
    { name: 'Campo Belo', city: 'São Paulo', state: 'SP' },
    { name: 'Centro', city: 'São Paulo', state: 'SP' },
    { name: 'Consolação', city: 'São Paulo', state: 'SP' },
    { name: 'Ibirapuera', city: 'São Paulo', state: 'SP' },
    { name: 'Itaim Bibi', city: 'São Paulo', state: 'SP' },
    { name: 'Jardim Paulista', city: 'São Paulo', state: 'SP' },
    { name: 'Jardins', city: 'São Paulo', state: 'SP' },
    { name: 'Lapa', city: 'São Paulo', state: 'SP' },
    { name: 'Liberdade', city: 'São Paulo', state: 'SP' },
    { name: 'Moema', city: 'São Paulo', state: 'SP' },
    { name: 'Morumbi', city: 'São Paulo', state: 'SP' },
    { name: 'Paraíso', city: 'São Paulo', state: 'SP' },
    { name: 'Perdizes', city: 'São Paulo', state: 'SP' },
    { name: 'Pinheiros', city: 'São Paulo', state: 'SP' },
    { name: 'Santana', city: 'São Paulo', state: 'SP' },
    { name: 'Santo Amaro', city: 'São Paulo', state: 'SP' },
    { name: 'Tatuapé', city: 'São Paulo', state: 'SP' },
    { name: 'Vila Madalena', city: 'São Paulo', state: 'SP' },
    { name: 'Vila Mariana', city: 'São Paulo', state: 'SP' },
    { name: 'Vila Olímpia', city: 'São Paulo', state: 'SP' }
  ],

  'Rio de Janeiro': [
    { name: 'Barra da Tijuca', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Botafogo', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Catete', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Centro', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Flamengo', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Gávea', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Ipanema', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Jacarepaguá', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Lapa', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Laranjeiras', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Leblon', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Maracanã', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Méier', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Recreio dos Bandeirantes', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Santa Teresa', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'São Conrado', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Tijuca', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Urca', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Vila Isabel', city: 'Rio de Janeiro', state: 'RJ' }
  ],

  'Belo Horizonte': [
    { name: 'Anchieta', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Belvedere', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Buritis', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Carlos Prates', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Carmo', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Centro', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Cidade Nova', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Coração Eucarístico', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Floresta', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Funcionários', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Gutierrez', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Lourdes', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Mangabeiras', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Pampulha', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Santa Efigênia', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Santo Agostinho', city: 'Belo Horizonte', state: 'MG' },
    { name: 'São Pedro', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Savassi', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Serra', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Sion', city: 'Belo Horizonte', state: 'MG' }
  ],

  'Vitória': [
    { name: 'Barro Vermelho', city: 'Vitória', state: 'ES' },
    { name: 'Bento Ferreira', city: 'Vitória', state: 'ES' },
    { name: 'Centro', city: 'Vitória', state: 'ES' },
    { name: 'Enseada do Suá', city: 'Vitória', state: 'ES' },
    { name: 'Jardim Camburi', city: 'Vitória', state: 'ES' },
    { name: 'Jardim da Penha', city: 'Vitória', state: 'ES' },
    { name: 'Praia do Canto', city: 'Vitória', state: 'ES' },
    { name: 'Praia do Suá', city: 'Vitória', state: 'ES' },
    { name: 'Santa Lúcia', city: 'Vitória', state: 'ES' }
  ],

  // REGIÃO NORDESTE
  'Salvador': [
    { name: 'Armação', city: 'Salvador', state: 'BA' },
    { name: 'Barra', city: 'Salvador', state: 'BA' },
    { name: 'Caminho das Árvores', city: 'Salvador', state: 'BA' },
    { name: 'Campo Grande', city: 'Salvador', state: 'BA' },
    { name: 'Corredor da Vitória', city: 'Salvador', state: 'BA' },
    { name: 'Costa Azul', city: 'Salvador', state: 'BA' },
    { name: 'Federação', city: 'Salvador', state: 'BA' },
    { name: 'Flamengo', city: 'Salvador', state: 'BA' },
    { name: 'Graça', city: 'Salvador', state: 'BA' },
    { name: 'Iguatemi', city: 'Salvador', state: 'BA' },
    { name: 'Imbuí', city: 'Salvador', state: 'BA' },
    { name: 'Itaigara', city: 'Salvador', state: 'BA' },
    { name: 'Ondina', city: 'Salvador', state: 'BA' },
    { name: 'Patamares', city: 'Salvador', state: 'BA' },
    { name: 'Pelourinho', city: 'Salvador', state: 'BA' },
    { name: 'Piatã', city: 'Salvador', state: 'BA' },
    { name: 'Pituba', city: 'Salvador', state: 'BA' },
    { name: 'Rio Vermelho', city: 'Salvador', state: 'BA' },
    { name: 'Stella Maris', city: 'Salvador', state: 'BA' },
    { name: 'Vitória', city: 'Salvador', state: 'BA' }
  ],

  'Recife': [
    { name: 'Aflitos', city: 'Recife', state: 'PE' },
    { name: 'Boa Viagem', city: 'Recife', state: 'PE' },
    { name: 'Boa Vista', city: 'Recife', state: 'PE' },
    { name: 'Candeias', city: 'Recife', state: 'PE' },
    { name: 'Casa Amarela', city: 'Recife', state: 'PE' },
    { name: 'Casa Forte', city: 'Recife', state: 'PE' },
    { name: 'Derby', city: 'Recife', state: 'PE' },
    { name: 'Encruzilhada', city: 'Recife', state: 'PE' },
    { name: 'Espinheiro', city: 'Recife', state: 'PE' },
    { name: 'Graças', city: 'Recife', state: 'PE' },
    { name: 'Ilha do Leite', city: 'Recife', state: 'PE' },
    { name: 'Imbiribeira', city: 'Recife', state: 'PE' },
    { name: 'Jaqueira', city: 'Recife', state: 'PE' },
    { name: 'Madalena', city: 'Recife', state: 'PE' },
    { name: 'Parnamirim', city: 'Recife', state: 'PE' },
    { name: 'Pina', city: 'Recife', state: 'PE' },
    { name: 'Piedade', city: 'Recife', state: 'PE' },
    { name: 'Poço da Panela', city: 'Recife', state: 'PE' },
    { name: 'Recife Antigo', city: 'Recife', state: 'PE' },
    { name: 'Rosarinho', city: 'Recife', state: 'PE' },
    { name: 'Santo Amaro', city: 'Recife', state: 'PE' },
    { name: 'Santo Antônio', city: 'Recife', state: 'PE' },
    { name: 'São José', city: 'Recife', state: 'PE' },
    { name: 'Setúbal', city: 'Recife', state: 'PE' },
    { name: 'Tamarineira', city: 'Recife', state: 'PE' },
    { name: 'Torre', city: 'Recife', state: 'PE' },
    { name: 'Torrões', city: 'Recife', state: 'PE' },
    { name: 'Várzea', city: 'Recife', state: 'PE' }
  ],

  'Fortaleza': [
    { name: 'Aldeota', city: 'Fortaleza', state: 'CE' },
    { name: 'Beira Mar', city: 'Fortaleza', state: 'CE' },
    { name: 'Centro', city: 'Fortaleza', state: 'CE' },
    { name: 'Cocó', city: 'Fortaleza', state: 'CE' },
    { name: 'Dionísio Torres', city: 'Fortaleza', state: 'CE' },
    { name: 'Edson Queiroz', city: 'Fortaleza', state: 'CE' },
    { name: 'Fátima', city: 'Fortaleza', state: 'CE' },
    { name: 'Iracema', city: 'Fortaleza', state: 'CE' },
    { name: 'Luciano Cavalcante', city: 'Fortaleza', state: 'CE' },
    { name: 'Meireles', city: 'Fortaleza', state: 'CE' },
    { name: 'Messejana', city: 'Fortaleza', state: 'CE' },
    { name: 'Mucuripe', city: 'Fortaleza', state: 'CE' },
    { name: 'Papicu', city: 'Fortaleza', state: 'CE' },
    { name: 'Patriolino Ribeiro', city: 'Fortaleza', state: 'CE' },
    { name: 'Praia de Iracema', city: 'Fortaleza', state: 'CE' },
    { name: 'Varjota', city: 'Fortaleza', state: 'CE' },
    { name: 'Água Fria', city: 'Fortaleza', state: 'CE' }
  ],

  'Natal': [
    { name: 'Alecrim', city: 'Natal', state: 'RN' },
    { name: 'Areia Preta', city: 'Natal', state: 'RN' },
    { name: 'Candelária', city: 'Natal', state: 'RN' },
    { name: 'Capim Macio', city: 'Natal', state: 'RN' },
    { name: 'Centro', city: 'Natal', state: 'RN' },
    { name: 'Cidade Alta', city: 'Natal', state: 'RN' },
    { name: 'Lagoa Nova', city: 'Natal', state: 'RN' },
    { name: 'Petrópolis', city: 'Natal', state: 'RN' },
    { name: 'Ponta Negra', city: 'Natal', state: 'RN' },
    { name: 'Ribeira', city: 'Natal', state: 'RN' },
    { name: 'Tirol', city: 'Natal', state: 'RN' }
  ],

  'João Pessoa': [
    { name: 'Altiplano', city: 'João Pessoa', state: 'PB' },
    { name: 'Bancários', city: 'João Pessoa', state: 'PB' },
    { name: 'Bessa', city: 'João Pessoa', state: 'PB' },
    { name: 'Cabo Branco', city: 'João Pessoa', state: 'PB' },
    { name: 'Centro', city: 'João Pessoa', state: 'PB' },
    { name: 'Expedicionários', city: 'João Pessoa', state: 'PB' },
    { name: 'Jaguaribe', city: 'João Pessoa', state: 'PB' },
    { name: 'Manaíra', city: 'João Pessoa', state: 'PB' },
    { name: 'Miramar', city: 'João Pessoa', state: 'PB' },
    { name: 'Tambaú', city: 'João Pessoa', state: 'PB' },
    { name: 'Tambauzinho', city: 'João Pessoa', state: 'PB' },
    { name: 'Torre', city: 'João Pessoa', state: 'PB' }
  ],

  'Maceió': [
    { name: 'Centro', city: 'Maceió', state: 'AL' },
    { name: 'Farol', city: 'Maceió', state: 'AL' },
    { name: 'Jatiúca', city: 'Maceió', state: 'AL' },
    { name: 'Mangabeiras', city: 'Maceió', state: 'AL' },
    { name: 'Pajuçara', city: 'Maceió', state: 'AL' },
    { name: 'Ponta Grossa', city: 'Maceió', state: 'AL' },
    { name: 'Ponta Verde', city: 'Maceió', state: 'AL' },
    { name: 'Serraria', city: 'Maceió', state: 'AL' }
  ],

  'Aracaju': [
    { name: 'Atalaia', city: 'Aracaju', state: 'SE' },
    { name: 'Aruana', city: 'Aracaju', state: 'SE' },
    { name: 'Centro', city: 'Aracaju', state: 'SE' },
    { name: 'Coroa do Meio', city: 'Aracaju', state: 'SE' },
    { name: 'Farolândia', city: 'Aracaju', state: 'SE' },
    { name: 'Grageru', city: 'Aracaju', state: 'SE' },
    { name: 'Jardins', city: 'Aracaju', state: 'SE' },
    { name: 'Luzia', city: 'Aracaju', state: 'SE' },
    { name: 'Salgado Filho', city: 'Aracaju', state: 'SE' },
    { name: 'São José', city: 'Aracaju', state: 'SE' }
  ],

  'Teresina': [
    { name: 'Cabral', city: 'Teresina', state: 'PI' },
    { name: 'Centro', city: 'Teresina', state: 'PI' },
    { name: 'Fátima', city: 'Teresina', state: 'PI' },
    { name: 'Horto', city: 'Teresina', state: 'PI' },
    { name: 'Ilhotas', city: 'Teresina', state: 'PI' },
    { name: 'Ininga', city: 'Teresina', state: 'PI' },
    { name: 'Jóquei', city: 'Teresina', state: 'PI' },
    { name: 'Mocambinho', city: 'Teresina', state: 'PI' },
    { name: 'Noivos', city: 'Teresina', state: 'PI' },
    { name: 'Piçarra', city: 'Teresina', state: 'PI' },
    { name: 'Primavera', city: 'Teresina', state: 'PI' },
    { name: 'Redenção', city: 'Teresina', state: 'PI' }
  ],

  'São Luís': [
    { name: 'Anil', city: 'São Luís', state: 'MA' },
    { name: 'Calhau', city: 'São Luís', state: 'MA' },
    { name: 'Centro', city: 'São Luís', state: 'MA' },
    { name: 'Cohab', city: 'São Luís', state: 'MA' },
    { name: 'Cohama', city: 'São Luís', state: 'MA' },
    { name: 'Jaracaty', city: 'São Luís', state: 'MA' },
    { name: 'Olho D\'Água', city: 'São Luís', state: 'MA' },
    { name: 'Ponta d\'Areia', city: 'São Luís', state: 'MA' },
    { name: 'Renascença', city: 'São Luís', state: 'MA' },
    { name: 'São Francisco', city: 'São Luís', state: 'MA' },
    { name: 'Turu', city: 'São Luís', state: 'MA' }
  ],

  // REGIÃO SUL
  'Curitiba': [
    { name: 'Água Verde', city: 'Curitiba', state: 'PR' },
    { name: 'Ahú', city: 'Curitiba', state: 'PR' },
    { name: 'Alto da Glória', city: 'Curitiba', state: 'PR' },
    { name: 'Batel', city: 'Curitiba', state: 'PR' },
    { name: 'Bigorrilho', city: 'Curitiba', state: 'PR' },
    { name: 'Boqueirão', city: 'Curitiba', state: 'PR' },
    { name: 'Cabral', city: 'Curitiba', state: 'PR' },
    { name: 'Centro', city: 'Curitiba', state: 'PR' },
    { name: 'Centro Cívico', city: 'Curitiba', state: 'PR' },
    { name: 'Cristo Rei', city: 'Curitiba', state: 'PR' },
    { name: 'Jardim Botânico', city: 'Curitiba', state: 'PR' },
    { name: 'Jardim Social', city: 'Curitiba', state: 'PR' },
    { name: 'Juvevê', city: 'Curitiba', state: 'PR' },
    { name: 'Mercês', city: 'Curitiba', state: 'PR' },
    { name: 'Portão', city: 'Curitiba', state: 'PR' },
    { name: 'Rebouças', city: 'Curitiba', state: 'PR' },
    { name: 'Santa Felicidade', city: 'Curitiba', state: 'PR' },
    { name: 'São Francisco', city: 'Curitiba', state: 'PR' }
  ],

  'Porto Alegre': [
    { name: 'Azenha', city: 'Porto Alegre', state: 'RS' },
    { name: 'Bela Vista', city: 'Porto Alegre', state: 'RS' },
    { name: 'Boa Vista', city: 'Porto Alegre', state: 'RS' },
    { name: 'Bom Fim', city: 'Porto Alegre', state: 'RS' },
    { name: 'Centro', city: 'Porto Alegre', state: 'RS' },
    { name: 'Centro Histórico', city: 'Porto Alegre', state: 'RS' },
    { name: 'Cidade Baixa', city: 'Porto Alegre', state: 'RS' },
    { name: 'Floresta', city: 'Porto Alegre', state: 'RS' },
    { name: 'Independência', city: 'Porto Alegre', state: 'RS' },
    { name: 'Moinhos de Vento', city: 'Porto Alegre', state: 'RS' },
    { name: 'Mont\'Serrat', city: 'Porto Alegre', state: 'RS' },
    { name: 'Petrópolis', city: 'Porto Alegre', state: 'RS' },
    { name: 'Praia de Belas', city: 'Porto Alegre', state: 'RS' },
    { name: 'Santana', city: 'Porto Alegre', state: 'RS' },
    { name: 'São Geraldo', city: 'Porto Alegre', state: 'RS' },
    { name: 'Tristeza', city: 'Porto Alegre', state: 'RS' }
  ],

  'Florianópolis': [
    { name: 'Agronômica', city: 'Florianópolis', state: 'SC' },
    { name: 'Barra da Lagoa', city: 'Florianópolis', state: 'SC' },
    { name: 'Canto', city: 'Florianópolis', state: 'SC' },
    { name: 'Canasvieiras', city: 'Florianópolis', state: 'SC' },
    { name: 'Centro', city: 'Florianópolis', state: 'SC' },
    { name: 'Córrego Grande', city: 'Florianópolis', state: 'SC' },
    { name: 'Ingleses', city: 'Florianópolis', state: 'SC' },
    { name: 'Itacorubi', city: 'Florianópolis', state: 'SC' },
    { name: 'Jurerê', city: 'Florianópolis', state: 'SC' },
    { name: 'Jurerê Internacional', city: 'Florianópolis', state: 'SC' },
    { name: 'Lagoa da Conceição', city: 'Florianópolis', state: 'SC' },
    { name: 'Pantanal', city: 'Florianópolis', state: 'SC' },
    { name: 'Trindade', city: 'Florianópolis', state: 'SC' }
  ],

  // REGIÃO CENTRO-OESTE
  'Brasília': [
    { name: 'Asa Norte', city: 'Brasília', state: 'DF' },
    { name: 'Asa Sul', city: 'Brasília', state: 'DF' },
    { name: 'Lago Norte', city: 'Brasília', state: 'DF' },
    { name: 'Lago Sul', city: 'Brasília', state: 'DF' },
    { name: 'Noroeste', city: 'Brasília', state: 'DF' },
    { name: 'Sudoeste', city: 'Brasília', state: 'DF' },
    { name: 'Águas Claras', city: 'Brasília', state: 'DF' },
    { name: 'Taguatinga', city: 'Brasília', state: 'DF' },
    { name: 'Ceilândia', city: 'Brasília', state: 'DF' },
    { name: 'Samambaia', city: 'Brasília', state: 'DF' },
    { name: 'Guará', city: 'Brasília', state: 'DF' }
  ],

  'Goiânia': [
    { name: 'Bueno', city: 'Goiânia', state: 'GO' },
    { name: 'Centro', city: 'Goiânia', state: 'GO' },
    { name: 'Jardim América', city: 'Goiânia', state: 'GO' },
    { name: 'Jardim Goiás', city: 'Goiânia', state: 'GO' },
    { name: 'Marista', city: 'Goiânia', state: 'GO' },
    { name: 'Nova Suíça', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Bueno', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Oeste', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Sul', city: 'Goiânia', state: 'GO' },
    { name: 'Vila Nova', city: 'Goiânia', state: 'GO' }
  ],

  'Campo Grande': [
    { name: 'Amambaí', city: 'Campo Grande', state: 'MS' },
    { name: 'Centro', city: 'Campo Grande', state: 'MS' },
    { name: 'Chácara Cachoeira', city: 'Campo Grande', state: 'MS' },
    { name: 'Jardim dos Estados', city: 'Campo Grande', state: 'MS' },
    { name: 'Jardim Leblon', city: 'Campo Grande', state: 'MS' },
    { name: 'Monte Castelo', city: 'Campo Grande', state: 'MS' },
    { name: 'Santa Fé', city: 'Campo Grande', state: 'MS' },
    { name: 'São Francisco', city: 'Campo Grande', state: 'MS' },
    { name: 'Tiradentes', city: 'Campo Grande', state: 'MS' },
    { name: 'Vila Planalto', city: 'Campo Grande', state: 'MS' }
  ],

  'Cuiabá': [
    { name: 'Araés', city: 'Cuiabá', state: 'MT' },
    { name: 'Bosque da Saúde', city: 'Cuiabá', state: 'MT' },
    { name: 'Centro', city: 'Cuiabá', state: 'MT' },
    { name: 'Centro Norte', city: 'Cuiabá', state: 'MT' },
    { name: 'CPA', city: 'Cuiabá', state: 'MT' },
    { name: 'Duque de Caxias', city: 'Cuiabá', state: 'MT' },
    { name: 'Goiabeiras', city: 'Cuiabá', state: 'MT' },
    { name: 'Jardim das Américas', city: 'Cuiabá', state: 'MT' },
    { name: 'Popular', city: 'Cuiabá', state: 'MT' },
    { name: 'Quilombo', city: 'Cuiabá', state: 'MT' }
  ],

  // REGIÃO NORTE
  'Manaus': [
    { name: 'Adrianópolis', city: 'Manaus', state: 'AM' },
    { name: 'Aleixo', city: 'Manaus', state: 'AM' },
    { name: 'Centro', city: 'Manaus', state: 'AM' },
    { name: 'Chapada', city: 'Manaus', state: 'AM' },
    { name: 'Flores', city: 'Manaus', state: 'AM' },
    { name: 'Nossa Senhora das Graças', city: 'Manaus', state: 'AM' },
    { name: 'Parque 10', city: 'Manaus', state: 'AM' },
    { name: 'Ponta Negra', city: 'Manaus', state: 'AM' },
    { name: 'São Jorge', city: 'Manaus', state: 'AM' },
    { name: 'Vieiralves', city: 'Manaus', state: 'AM' }
  ],

  'Belém': [
    { name: 'Batista Campos', city: 'Belém', state: 'PA' },
    { name: 'Campina', city: 'Belém', state: 'PA' },
    { name: 'Centro', city: 'Belém', state: 'PA' },
    { name: 'Cidade Velha', city: 'Belém', state: 'PA' },
    { name: 'Cremação', city: 'Belém', state: 'PA' },
    { name: 'Marco', city: 'Belém', state: 'PA' },
    { name: 'Nazaré', city: 'Belém', state: 'PA' },
    { name: 'Pedreira', city: 'Belém', state: 'PA' },
    { name: 'Reduto', city: 'Belém', state: 'PA' },
    { name: 'Umarizal', city: 'Belém', state: 'PA' }
  ],

  'Palmas': [
    { name: 'Plano Diretor Norte', city: 'Palmas', state: 'TO' },
    { name: 'Plano Diretor Sul', city: 'Palmas', state: 'TO' },
    { name: 'Centro', city: 'Palmas', state: 'TO' },
    { name: 'Taquaralto', city: 'Palmas', state: 'TO' },
    { name: 'Aureny I', city: 'Palmas', state: 'TO' },
    { name: 'Aureny II', city: 'Palmas', state: 'TO' },
    { name: 'Aureny III', city: 'Palmas', state: 'TO' }
  ],

  'Macapá': [
    { name: 'Araxá', city: 'Macapá', state: 'AP' },
    { name: 'Buritizal', city: 'Macapá', state: 'AP' },
    { name: 'Centro', city: 'Macapá', state: 'AP' },
    { name: 'Infraero', city: 'Macapá', state: 'AP' },
    { name: 'Jesus de Nazaré', city: 'Macapá', state: 'AP' },
    { name: 'Laguinho', city: 'Macapá', state: 'AP' },
    { name: 'Santa Rita', city: 'Macapá', state: 'AP' },
    { name: 'Trem', city: 'Macapá', state: 'AP' }
  ],

  'Porto Velho': [
    { name: 'Agenor de Carvalho', city: 'Porto Velho', state: 'RO' },
    { name: 'Caladinho', city: 'Porto Velho', state: 'RO' },
    { name: 'Centro', city: 'Porto Velho', state: 'RO' },
    { name: 'Eldorado', city: 'Porto Velho', state: 'RO' },
    { name: 'Embratel', city: 'Porto Velho', state: 'RO' },
    { name: 'Flodoaldo Pontes Pinto', city: 'Porto Velho', state: 'RO' },
    { name: 'Lagoinha', city: 'Porto Velho', state: 'RO' },
    { name: 'Nacional', city: 'Porto Velho', state: 'RO' }
  ],

  'Rio Branco': [
    { name: 'Bosque', city: 'Rio Branco', state: 'AC' },
    { name: 'Cadeia Velha', city: 'Rio Branco', state: 'AC' },
    { name: 'Centro', city: 'Rio Branco', state: 'AC' },
    { name: 'Cidade Nova', city: 'Rio Branco', state: 'AC' },
    { name: 'Esperança', city: 'Rio Branco', state: 'AC' },
    { name: 'Habitasa', city: 'Rio Branco', state: 'AC' },
    { name: 'Ipase', city: 'Rio Branco', state: 'AC' },
    { name: 'Ivonete', city: 'Rio Branco', state: 'AC' }
  ],

  'Boa Vista': [
    { name: 'Aeroporto', city: 'Boa Vista', state: 'RR' },
    { name: 'Caçari', city: 'Boa Vista', state: 'RR' },
    { name: 'Calungá', city: 'Boa Vista', state: 'RR' },
    { name: 'Centro', city: 'Boa Vista', state: 'RR' },
    { name: 'Mecejana', city: 'Boa Vista', state: 'RR' },
    { name: 'Paraviana', city: 'Boa Vista', state: 'RR' },
    { name: 'Pintolândia', city: 'Boa Vista', state: 'RR' },
    { name: 'São Francisco', city: 'Boa Vista', state: 'RR' }
  ],

  // CIDADES IMPORTANTES DO RIO GRANDE DO SUL
  'Caxias do Sul': [
    { name: 'Ana Rech', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Bela Vista', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Centenário', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Centro', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Charqueadas', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Cinquentenário', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Cruzeiro', city: 'Caxias do Sul', state: 'RS' },
    { name: 'De Carli', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Desvio Rizzo', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Esplanada', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Exposição', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Fazenda Souza', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Interlagos', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Jardim América', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Kayser', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Lourdes', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Madureira', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Medianeira', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Menino Deus', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Nossa Senhora da Saúde', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Nossa Senhora de Lourdes', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Panazzolo', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Petrópolis', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Pioneiro', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Pio X', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Presidente Vargas', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Provisória', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Rio Branco', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Sagrada Família', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Salgado Filho', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Sanvitto', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Santa Catarina', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Santa Lúcia', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Santo Antônio', city: 'Caxias do Sul', state: 'RS' },
    { name: 'São Ciro', city: 'Caxias do Sul', state: 'RS' },
    { name: 'São Cristóvão', city: 'Caxias do Sul', state: 'RS' },
    { name: 'São Giácomo', city: 'Caxias do Sul', state: 'RS' },
    { name: 'São José', city: 'Caxias do Sul', state: 'RS' },
    { name: 'São Leopoldo', city: 'Caxias do Sul', state: 'RS' },
    { name: 'São Pelegrino', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Tijuca', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Universitário', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Vila Cristina', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Vinhedos', city: 'Caxias do Sul', state: 'RS' }
  ],

  'Pelotas': [
    { name: 'Areal', city: 'Pelotas', state: 'RS' },
    { name: 'Centro', city: 'Pelotas', state: 'RS' },
    { name: 'Fragata', city: 'Pelotas', state: 'RS' },
    { name: 'Laranjal', city: 'Pelotas', state: 'RS' },
    { name: 'Porto', city: 'Pelotas', state: 'RS' },
    { name: 'Três Vendas', city: 'Pelotas', state: 'RS' }
  ],

  'Canoas': [
    { name: 'Centro', city: 'Canoas', state: 'RS' },
    { name: 'Guajuviras', city: 'Canoas', state: 'RS' },
    { name: 'Harmonia', city: 'Canoas', state: 'RS' },
    { name: 'Mathias Velho', city: 'Canoas', state: 'RS' },
    { name: 'Niterói', city: 'Canoas', state: 'RS' },
    { name: 'Rio Branco', city: 'Canoas', state: 'RS' }
  ],

  // CIDADES IMPORTANTES DE SÃO PAULO
  'Campinas': [
    { name: 'Barão Geraldo', city: 'Campinas', state: 'SP' },
    { name: 'Cambuí', city: 'Campinas', state: 'SP' },
    { name: 'Centro', city: 'Campinas', state: 'SP' },
    { name: 'Guanabara', city: 'Campinas', state: 'SP' },
    { name: 'Jardim Chapadão', city: 'Campinas', state: 'SP' },
    { name: 'Jardim Proença', city: 'Campinas', state: 'SP' },
    { name: 'Taquaral', city: 'Campinas', state: 'SP' },
    { name: 'Vila Brandina', city: 'Campinas', state: 'SP' }
  ],

  'Santos': [
    { name: 'Aparecida', city: 'Santos', state: 'SP' },
    { name: 'Boqueirão', city: 'Santos', state: 'SP' },
    { name: 'Centro', city: 'Santos', state: 'SP' },
    { name: 'Embaré', city: 'Santos', state: 'SP' },
    { name: 'Gonzaga', city: 'Santos', state: 'SP' },
    { name: 'José Menino', city: 'Santos', state: 'SP' },
    { name: 'Ponta da Praia', city: 'Santos', state: 'SP' }
  ],

  'Ribeirão Preto': [
    { name: 'Alto da Boa Vista', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Centro', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Higienópolis', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Jardim América', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Jardim Paulista', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Ribeirânia', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Vila Tibério', city: 'Ribeirão Preto', state: 'SP' }
  ],

  'Sorocaba': [
    { name: 'Campolim', city: 'Sorocaba', state: 'SP' },
    { name: 'Centro', city: 'Sorocaba', state: 'SP' },
    { name: 'Jardim América', city: 'Sorocaba', state: 'SP' },
    { name: 'Jardim Vera Cruz', city: 'Sorocaba', state: 'SP' },
    { name: 'Trujillo', city: 'Sorocaba', state: 'SP' },
    { name: 'Vila Hortência', city: 'Sorocaba', state: 'SP' }
  ],

  // CIDADES IMPORTANTES DO RIO DE JANEIRO
  'Niterói': [
    { name: 'Centro', city: 'Niterói', state: 'RJ' },
    { name: 'Icaraí', city: 'Niterói', state: 'RJ' },
    { name: 'Ingá', city: 'Niterói', state: 'RJ' },
    { name: 'Itaipu', city: 'Niterói', state: 'RJ' },
    { name: 'Pendotiba', city: 'Niterói', state: 'RJ' },
    { name: 'Piratininga', city: 'Niterói', state: 'RJ' },
    { name: 'Santa Rosa', city: 'Niterói', state: 'RJ' },
    { name: 'São Francisco', city: 'Niterói', state: 'RJ' }
  ],

  'Cabo Frio': [
    { name: 'Braga', city: 'Cabo Frio', state: 'RJ' },
    { name: 'Centro', city: 'Cabo Frio', state: 'RJ' },
    { name: 'Jardim Esperança', city: 'Cabo Frio', state: 'RJ' },
    { name: 'Ogiva', city: 'Cabo Frio', state: 'RJ' },
    { name: 'Passagem', city: 'Cabo Frio', state: 'RJ' },
    { name: 'Peró', city: 'Cabo Frio', state: 'RJ' }
  ],

  // CIDADES IMPORTANTES DE MINAS GERAIS
  'Uberlândia': [
    { name: 'Bom Jesus', city: 'Uberlândia', state: 'MG' },
    { name: 'Brasil', city: 'Uberlândia', state: 'MG' },
    { name: 'Centro', city: 'Uberlândia', state: 'MG' },
    { name: 'Jardim Brasília', city: 'Uberlândia', state: 'MG' },
    { name: 'Martins', city: 'Uberlândia', state: 'MG' },
    { name: 'Santa Mônica', city: 'Uberlândia', state: 'MG' },
    { name: 'Tibery', city: 'Uberlândia', state: 'MG' }
  ],

  'Juiz de Fora': [
    { name: 'Alto dos Passos', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Bom Pastor', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Centro', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Granbery', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Manoel Honório', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Santa Catarina', city: 'Juiz de Fora', state: 'MG' }
  ],

  // CIDADES IMPORTANTES DO PARANÁ
  'Londrina': [
    { name: 'Antares', city: 'Londrina', state: 'PR' },
    { name: 'Centro', city: 'Londrina', state: 'PR' },
    { name: 'Gleba Palhano', city: 'Londrina', state: 'PR' },
    { name: 'Higienópolis', city: 'Londrina', state: 'PR' },
    { name: 'Lago Parque', city: 'Londrina', state: 'PR' },
    { name: 'Vila Brasil', city: 'Londrina', state: 'PR' }
  ],

  'Maringá': [
    { name: 'Centro', city: 'Maringá', state: 'PR' },
    { name: 'Jardim Alvorada', city: 'Maringá', state: 'PR' },
    { name: 'Novo Centro', city: 'Maringá', state: 'PR' },
    { name: 'Vila Esperança', city: 'Maringá', state: 'PR' },
    { name: 'Zona 01', city: 'Maringá', state: 'PR' },
    { name: 'Zona 07', city: 'Maringá', state: 'PR' }
  ],

  // CIDADES IMPORTANTES DE SANTA CATARINA
  'Joinville': [
    { name: 'América', city: 'Joinville', state: 'SC' },
    { name: 'Atiradores', city: 'Joinville', state: 'SC' },
    { name: 'Bucarein', city: 'Joinville', state: 'SC' },
    { name: 'Centro', city: 'Joinville', state: 'SC' },
    { name: 'Glória', city: 'Joinville', state: 'SC' },
    { name: 'Iririú', city: 'Joinville', state: 'SC' },
    { name: 'Santo Antônio', city: 'Joinville', state: 'SC' }
  ],

  'Blumenau': [
    { name: 'Centro', city: 'Blumenau', state: 'SC' },
    { name: 'Garcia', city: 'Blumenau', state: 'SC' },
    { name: 'Itoupava Central', city: 'Blumenau', state: 'SC' },
    { name: 'Ponta Aguda', city: 'Blumenau', state: 'SC' },
    { name: 'Velha', city: 'Blumenau', state: 'SC' },
    { name: 'Victor Konder', city: 'Blumenau', state: 'SC' }
  ],

  // CIDADES IMPORTANTES DA BAHIA
  'Feira de Santana': [
    { name: 'Centro', city: 'Feira de Santana', state: 'BA' },
    { name: 'Capuchinhos', city: 'Feira de Santana', state: 'BA' },
    { name: 'Kalilândia', city: 'Feira de Santana', state: 'BA' },
    { name: 'Mangabeira', city: 'Feira de Santana', state: 'BA' },
    { name: 'Novo Horizonte', city: 'Feira de Santana', state: 'BA' },
    { name: 'Papagaio', city: 'Feira de Santana', state: 'BA' }
  ],

  // CIDADES IMPORTANTES DE PERNAMBUCO
  'Jaboatão dos Guararapes': [
    { name: 'Barra de Jangada', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Candeias', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Centro', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Piedade', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Prazeres', city: 'Jaboatão dos Guararapes', state: 'PE' }
  ],

  'Olinda': [
    { name: 'Bairro Novo', city: 'Olinda', state: 'PE' },
    { name: 'Casa Caiada', city: 'Olinda', state: 'PE' },
    { name: 'Centro', city: 'Olinda', state: 'PE' },
    { name: 'Jardim Atlântico', city: 'Olinda', state: 'PE' },
    { name: 'Rio Doce', city: 'Olinda', state: 'PE' },
    { name: 'Sítio Histórico', city: 'Olinda', state: 'PE' }
  ],

  // CIDADES IMPORTANTES DO CEARÁ
  'Caucaia': [
    { name: 'Araturi', city: 'Caucaia', state: 'CE' },
    { name: 'Centro', city: 'Caucaia', state: 'CE' },
    { name: 'Iparana', city: 'Caucaia', state: 'CE' },
    { name: 'Jurema', city: 'Caucaia', state: 'CE' },
    { name: 'Pacheco', city: 'Caucaia', state: 'CE' }
  ],

  // CIDADES IMPORTANTES DO AMAZONAS
  'Manacapuru': [
    { name: 'Centro', city: 'Manacapuru', state: 'AM' },
    { name: 'Liberdade', city: 'Manacapuru', state: 'AM' },
    { name: 'União', city: 'Manacapuru', state: 'AM' }
  ]
};

// Função para buscar bairros de uma cidade
export const getNeighborhoodsByCity = (cityName: string): Neighborhood[] => {
  // Normalizar o nome da cidade
  const normalizedCityName = normalizeText(cityName);

  // Procurar nos bairros cadastrados (case-insensitive)
  for (const [city, neighborhoods] of Object.entries(allNeighborhoods)) {
    if (normalizeText(city) === normalizedCityName) {
      return neighborhoods;
    }
  }

  // Se não encontrou, retornar bairros genéricos
  return [
    { name: 'Centro', city: cityName, state: '' },
    { name: 'Bairro 1', city: cityName, state: '' },
    { name: 'Bairro 2', city: cityName, state: '' },
    { name: 'Bairro 3', city: cityName, state: '' }
  ];
};

// Função para buscar bairros com filtro
export const searchNeighborhoods = (cityName: string, searchTerm: string): Neighborhood[] => {
  const neighborhoods = getNeighborhoodsByCity(cityName);

  if (!searchTerm.trim()) {
    return neighborhoods;
  }

  const normalizedSearch = normalizeText(searchTerm);

  return neighborhoods.filter(n =>
    normalizeText(n.name).includes(normalizedSearch)
  );
};
