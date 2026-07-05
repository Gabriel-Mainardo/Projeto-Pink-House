export interface Neighborhood {
  name: string;
  city: string;
  state: string;
}

// Bairros das principais cidades brasileiras
export const neighborhoodsByCity: Record<string, Neighborhood[]> = {
  'São Paulo': [
    { name: 'Vila Madalena', city: 'São Paulo', state: 'SP' },
    { name: 'Pinheiros', city: 'São Paulo', state: 'SP' },
    { name: 'Moema', city: 'São Paulo', state: 'SP' },
    { name: 'Itaim Bibi', city: 'São Paulo', state: 'SP' },
    { name: 'Jardins', city: 'São Paulo', state: 'SP' },
    { name: 'Copacabana', city: 'São Paulo', state: 'SP' },
    { name: 'Vila Olímpia', city: 'São Paulo', state: 'SP' },
    { name: 'Brooklin', city: 'São Paulo', state: 'SP' },
    { name: 'Morumbi', city: 'São Paulo', state: 'SP' },
    { name: 'Perdizes', city: 'São Paulo', state: 'SP' },
    { name: 'Santana', city: 'São Paulo', state: 'SP' },
    { name: 'Liberdade', city: 'São Paulo', state: 'SP' },
    { name: 'Centro', city: 'São Paulo', state: 'SP' },
    { name: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    { name: 'Vila Mariana', city: 'São Paulo', state: 'SP' },
    { name: 'Aclimação', city: 'São Paulo', state: 'SP' },
    { name: 'Paraíso', city: 'São Paulo', state: 'SP' },
    { name: 'Ibirapuera', city: 'São Paulo', state: 'SP' },
    { name: 'Campo Belo', city: 'São Paulo', state: 'SP' },
    { name: 'Santo Amaro', city: 'São Paulo', state: 'SP' }
  ],

  'Rio de Janeiro': [
    { name: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Ipanema', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Leblon', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Barra da Tijuca', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Botafogo', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Flamengo', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Tijuca', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Centro', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Lapa', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Santa Teresa', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Laranjeiras', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Urca', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Gávea', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'São Conrado', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Recreio dos Bandeirantes', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Jacarepaguá', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Méier', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Vila Isabel', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Maracanã', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Catete', city: 'Rio de Janeiro', state: 'RJ' }
  ],

  'Belo Horizonte': [
    { name: 'Savassi', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Funcionários', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Centro', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Pampulha', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Lourdes', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Santo Agostinho', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Buritis', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Belvedere', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Mangabeiras', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Serra', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Anchieta', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Sion', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Carmo', city: 'Belo Horizonte', state: 'MG' },
    { name: 'São Pedro', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Coração Eucarístico', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Carlos Prates', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Gutierrez', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Floresta', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Santa Efigênia', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Cidade Nova', city: 'Belo Horizonte', state: 'MG' }
  ],

  'Salvador': [
    { name: 'Barra', city: 'Salvador', state: 'BA' },
    { name: 'Ondina', city: 'Salvador', state: 'BA' },
    { name: 'Rio Vermelho', city: 'Salvador', state: 'BA' },
    { name: 'Pituba', city: 'Salvador', state: 'BA' },
    { name: 'Itaigara', city: 'Salvador', state: 'BA' },
    { name: 'Graça', city: 'Salvador', state: 'BA' },
    { name: 'Vitória', city: 'Salvador', state: 'BA' },
    { name: 'Corredor da Vitória', city: 'Salvador', state: 'BA' },
    { name: 'Campo Grande', city: 'Salvador', state: 'BA' },
    { name: 'Pelourinho', city: 'Salvador', state: 'BA' },
    { name: 'Federação', city: 'Salvador', state: 'BA' },
    { name: 'Costa Azul', city: 'Salvador', state: 'BA' },
    { name: 'Armação', city: 'Salvador', state: 'BA' },
    { name: 'Piatã', city: 'Salvador', state: 'BA' },
    { name: 'Imbuí', city: 'Salvador', state: 'BA' },
    { name: 'Caminho das Árvores', city: 'Salvador', state: 'BA' },
    { name: 'Iguatemi', city: 'Salvador', state: 'BA' },
    { name: 'Patamares', city: 'Salvador', state: 'BA' },
    { name: 'Stella Maris', city: 'Salvador', state: 'BA' },
    { name: 'Flamengo', city: 'Salvador', state: 'BA' }
  ],

  'Brasília': [
    { name: 'Asa Norte', city: 'Brasília', state: 'DF' },
    { name: 'Asa Sul', city: 'Brasília', state: 'DF' },
    { name: 'Lago Norte', city: 'Brasília', state: 'DF' },
    { name: 'Lago Sul', city: 'Brasília', state: 'DF' },
    { name: 'Sudoeste', city: 'Brasília', state: 'DF' },
    { name: 'Noroeste', city: 'Brasília', state: 'DF' },
    { name: 'Águas Claras', city: 'Brasília', state: 'DF' },
    { name: 'Taguatinga', city: 'Brasília', state: 'DF' },
    { name: 'Ceilândia', city: 'Brasília', state: 'DF' },
    { name: 'Samambaia', city: 'Brasília', state: 'DF' },
    { name: 'Planaltina', city: 'Brasília', state: 'DF' },
    { name: 'Sobradinho', city: 'Brasília', state: 'DF' },
    { name: 'Gama', city: 'Brasília', state: 'DF' },
    { name: 'Santa Maria', city: 'Brasília', state: 'DF' },
    { name: 'São Sebastião', city: 'Brasília', state: 'DF' },
    { name: 'Recanto das Emas', city: 'Brasília', state: 'DF' },
    { name: 'Riacho Fundo', city: 'Brasília', state: 'DF' },
    { name: 'Guará', city: 'Brasília', state: 'DF' },
    { name: 'Cruzeiro', city: 'Brasília', state: 'DF' },
    { name: 'Octogonal', city: 'Brasília', state: 'DF' }
  ],

  'Fortaleza': [
    { name: 'Meireles', city: 'Fortaleza', state: 'CE' },
    { name: 'Aldeota', city: 'Fortaleza', state: 'CE' },
    { name: 'Cocó', city: 'Fortaleza', state: 'CE' },
    { name: 'Dionísio Torres', city: 'Fortaleza', state: 'CE' },
    { name: 'Papicu', city: 'Fortaleza', state: 'CE' },
    { name: 'Praia de Iracema', city: 'Fortaleza', state: 'CE' },
    { name: 'Centro', city: 'Fortaleza', state: 'CE' },
    { name: 'Benfica', city: 'Fortaleza', state: 'CE' },
    { name: 'Fátima', city: 'Fortaleza', state: 'CE' },
    { name: 'Joaquim Távora', city: 'Fortaleza', state: 'CE' },
    { name: 'Varjota', city: 'Fortaleza', state: 'CE' },
    { name: 'Mucuripe', city: 'Fortaleza', state: 'CE' },
    { name: 'Praia do Futuro', city: 'Fortaleza', state: 'CE' },
    { name: 'Água Fria', city: 'Fortaleza', state: 'CE' },
    { name: 'De Lourdes', city: 'Fortaleza', state: 'CE' },
    { name: 'Montese', city: 'Fortaleza', state: 'CE' },
    { name: 'Damas', city: 'Fortaleza', state: 'CE' },
    { name: 'Parangaba', city: 'Fortaleza', state: 'CE' },
    { name: 'Maraponga', city: 'Fortaleza', state: 'CE' },
    { name: 'Messejana', city: 'Fortaleza', state: 'CE' }
  ],

  'Recife': [
    { name: 'Boa Viagem', city: 'Recife', state: 'PE' },
    { name: 'Pina', city: 'Recife', state: 'PE' },
    { name: 'Piedade', city: 'Recife', state: 'PE' },
    { name: 'Centro', city: 'Recife', state: 'PE' },
    { name: 'Boa Vista', city: 'Recife', state: 'PE' },
    { name: 'Espinheiro', city: 'Recife', state: 'PE' },
    { name: 'Graças', city: 'Recife', state: 'PE' },
    { name: 'Casa Forte', city: 'Recife', state: 'PE' },
    { name: 'Parnamirim', city: 'Recife', state: 'PE' },
    { name: 'Casa Amarela', city: 'Recife', state: 'PE' },
    { name: 'Aflitos', city: 'Recife', state: 'PE' },
    { name: 'Derby', city: 'Recife', state: 'PE' },
    { name: 'Ilha do Leite', city: 'Recife', state: 'PE' },
    { name: 'Paissandu', city: 'Recife', state: 'PE' },
    { name: 'Santo Antônio', city: 'Recife', state: 'PE' },
    { name: 'São José', city: 'Recife', state: 'PE' },
    { name: 'Santo Amaro', city: 'Recife', state: 'PE' },
    { name: 'Cabanga', city: 'Recife', state: 'PE' },
    { name: 'Ilha Joana Bezerra', city: 'Recife', state: 'PE' },
    { name: 'Imbiribeira', city: 'Recife', state: 'PE' }
  ],

  'Recife RMR': [
    { name: 'Boa Viagem', city: 'Recife', state: 'PE' },
    { name: 'Pina', city: 'Recife', state: 'PE' },
    { name: 'Setúbal', city: 'Recife', state: 'PE' },
    { name: 'Ibura', city: 'Recife', state: 'PE' },
    { name: 'Jordão', city: 'Recife', state: 'PE' },
    { name: 'Imbiribeira', city: 'Recife', state: 'PE' },
    { name: 'Casa Amarela', city: 'Recife', state: 'PE' },
    { name: 'Casa Forte', city: 'Recife', state: 'PE' },
    { name: 'Aflitos', city: 'Recife', state: 'PE' },
    { name: 'Graças', city: 'Recife', state: 'PE' },
    { name: 'Rosarinho', city: 'Recife', state: 'PE' },
    { name: 'Arruda', city: 'Recife', state: 'PE' },
    { name: 'Apipucos', city: 'Recife', state: 'PE' },
    { name: 'Dois Irmãos', city: 'Recife', state: 'PE' },
    { name: 'Várzea', city: 'Recife', state: 'PE' },
    { name: 'Iputinga', city: 'Recife', state: 'PE' },
    { name: 'Cordeiro', city: 'Recife', state: 'PE' },
    { name: 'Madalena', city: 'Recife', state: 'PE' },
    { name: 'Derby', city: 'Recife', state: 'PE' },
    { name: 'Boa Vista', city: 'Recife', state: 'PE' },
    { name: 'São José', city: 'Recife', state: 'PE' },
    { name: 'Recife Antigo', city: 'Recife', state: 'PE' },
    { name: 'Torre', city: 'Recife', state: 'PE' },
    { name: 'Espinheiro', city: 'Recife', state: 'PE' },
    { name: 'Ilha do Leite', city: 'Recife', state: 'PE' },
    { name: 'Guabiraba', city: 'Recife', state: 'PE' },
    { name: 'Bairro Novo', city: 'Olinda', state: 'PE' },
    { name: 'Casa Caiada', city: 'Olinda', state: 'PE' },
    { name: 'Rio Doce', city: 'Olinda', state: 'PE' },
    { name: 'Sítio Histórico', city: 'Olinda', state: 'PE' },
    { name: 'Carmo', city: 'Olinda', state: 'PE' },
    { name: 'Varadouro', city: 'Olinda', state: 'PE' },
    { name: 'Piedade', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Candeias', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Paiva', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Jaboatão Centro', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Cavaleiro', city: 'Jaboatão dos Guararapes', state: 'PE' },
    { name: 'Janga', city: 'Paulista', state: 'PE' },
    { name: 'Pau Amarelo', city: 'Paulista', state: 'PE' },
    { name: 'Maria Farinha', city: 'Paulista', state: 'PE' },
    { name: 'Centro', city: 'Cabo de Santo Agostinho', state: 'PE' },
    { name: 'Gaibu', city: 'Cabo de Santo Agostinho', state: 'PE' },
    { name: 'Enseada dos Corais', city: 'Cabo de Santo Agostinho', state: 'PE' },
    { name: 'Centro', city: 'Camaragibe', state: 'PE' },
    { name: 'Aldeia', city: 'Camaragibe', state: 'PE' }
  ],

  'Porto Alegre': [
    { name: 'Moinhos de Vento', city: 'Porto Alegre', state: 'RS' },
    { name: 'Auxiliadora', city: 'Porto Alegre', state: 'RS' },
    { name: 'Bela Vista', city: 'Porto Alegre', state: 'RS' },
    { name: 'Centro', city: 'Porto Alegre', state: 'RS' },
    { name: 'Cidade Baixa', city: 'Porto Alegre', state: 'RS' },
    { name: 'Menino Deus', city: 'Porto Alegre', state: 'RS' },
    { name: 'Praia de Belas', city: 'Porto Alegre', state: 'RS' },
    { name: 'Tristeza', city: 'Porto Alegre', state: 'RS' },
    { name: 'Ipanema', city: 'Porto Alegre', state: 'RS' },
    { name: 'Petrópolis', city: 'Porto Alegre', state: 'RS' },
    { name: 'Rio Branco', city: 'Porto Alegre', state: 'RS' },
    { name: 'Santana', city: 'Porto Alegre', state: 'RS' },
    { name: 'Floresta', city: 'Porto Alegre', state: 'RS' },
    { name: 'São Geraldo', city: 'Porto Alegre', state: 'RS' },
    { name: 'Independência', city: 'Porto Alegre', state: 'RS' },
    { name: 'Bom Fim', city: 'Porto Alegre', state: 'RS' },
    { name: 'Farroupilha', city: 'Porto Alegre', state: 'RS' },
    { name: 'Mont Serrat', city: 'Porto Alegre', state: 'RS' },
    { name: 'Higienópolis', city: 'Porto Alegre', state: 'RS' },
    { name: 'Azenha', city: 'Porto Alegre', state: 'RS' }
  ],

  'Curitiba': [
    { name: 'Batel', city: 'Curitiba', state: 'PR' },
    { name: 'Água Verde', city: 'Curitiba', state: 'PR' },
    { name: 'Bigorrilho', city: 'Curitiba', state: 'PR' },
    { name: 'Centro', city: 'Curitiba', state: 'PR' },
    { name: 'Centro Cívico', city: 'Curitiba', state: 'PR' },
    { name: 'Cabral', city: 'Curitiba', state: 'PR' },
    { name: 'Hugo Lange', city: 'Curitiba', state: 'PR' },
    { name: 'Juvevê', city: 'Curitiba', state: 'PR' },
    { name: 'Mercês', city: 'Curitiba', state: 'PR' },
    { name: 'São Francisco', city: 'Curitiba', state: 'PR' },
    { name: 'Champagnat', city: 'Curitiba', state: 'PR' },
    { name: 'Jardim Social', city: 'Curitiba', state: 'PR' },
    { name: 'Rebouças', city: 'Curitiba', state: 'PR' },
    { name: 'Prado Velho', city: 'Curitiba', state: 'PR' },
    { name: 'Portão', city: 'Curitiba', state: 'PR' },
    { name: 'Jardim Botânico', city: 'Curitiba', state: 'PR' },
    { name: 'Alto da Glória', city: 'Curitiba', state: 'PR' },
    { name: 'Cristo Rei', city: 'Curitiba', state: 'PR' },
    { name: 'Jardim das Américas', city: 'Curitiba', state: 'PR' },
    { name: 'Santa Felicidade', city: 'Curitiba', state: 'PR' }
  ],

  // Adicionando bairros para outras cidades principais
  'Goiânia': [
    { name: 'Setor Central', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Oeste', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Sul', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Bueno', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Marista', city: 'Goiânia', state: 'GO' },
    { name: 'Jardim Goiás', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Pedro Ludovico', city: 'Goiânia', state: 'GO' },
    { name: 'Vila Nova', city: 'Goiânia', state: 'GO' },
    { name: 'Setor Campinas', city: 'Goiânia', state: 'GO' },
    { name: 'Parque Amazônia', city: 'Goiânia', state: 'GO' }
  ],

  'Manaus': [
    { name: 'Centro', city: 'Manaus', state: 'AM' },
    { name: 'Adrianópolis', city: 'Manaus', state: 'AM' },
    { name: 'Nossa Senhora das Graças', city: 'Manaus', state: 'AM' },
    { name: 'Chapada', city: 'Manaus', state: 'AM' },
    { name: 'Vieiralves', city: 'Manaus', state: 'AM' },
    { name: 'Flores', city: 'Manaus', state: 'AM' },
    { name: 'Parque 10 de Novembro', city: 'Manaus', state: 'AM' },
    { name: 'Aleixo', city: 'Manaus', state: 'AM' },
    { name: 'Petrópolis', city: 'Manaus', state: 'AM' },
    { name: 'São Francisco', city: 'Manaus', state: 'AM' }
  ],

  'Belém': [
    { name: 'Nazaré', city: 'Belém', state: 'PA' },
    { name: 'Batista Campos', city: 'Belém', state: 'PA' },
    { name: 'Cidade Velha', city: 'Belém', state: 'PA' },
    { name: 'Campina', city: 'Belém', state: 'PA' },
    { name: 'Reduto', city: 'Belém', state: 'PA' },
    { name: 'Umarizal', city: 'Belém', state: 'PA' },
    { name: 'Marco', city: 'Belém', state: 'PA' },
    { name: 'Pedreira', city: 'Belém', state: 'PA' },
    { name: 'São Brás', city: 'Belém', state: 'PA' },
    { name: 'Jurunas', city: 'Belém', state: 'PA' }
  ],

  'Vitória': [
    { name: 'Centro', city: 'Vitória', state: 'ES' },
    { name: 'Praia do Canto', city: 'Vitória', state: 'ES' },
    { name: 'Bento Ferreira', city: 'Vitória', state: 'ES' },
    { name: 'Jardim da Penha', city: 'Vitória', state: 'ES' },
    { name: 'Mata da Praia', city: 'Vitória', state: 'ES' },
    { name: 'Jardim Camburi', city: 'Vitória', state: 'ES' },
    { name: 'Santa Lúcia', city: 'Vitória', state: 'ES' },
    { name: 'Enseada do Suá', city: 'Vitória', state: 'ES' },
    { name: 'Ilha do Boi', city: 'Vitória', state: 'ES' },
    { name: 'Ilha do Frade', city: 'Vitória', state: 'ES' }
  ],

  'Florianópolis': [
    { name: 'Centro', city: 'Florianópolis', state: 'SC' },
    { name: 'Lagoa da Conceição', city: 'Florianópolis', state: 'SC' },
    { name: 'Canasvieiras', city: 'Florianópolis', state: 'SC' },
    { name: 'Jurerê', city: 'Florianópolis', state: 'SC' },
    { name: 'Ingleses', city: 'Florianópolis', state: 'SC' },
    { name: 'Campeche', city: 'Florianópolis', state: 'SC' },
    { name: 'Trindade', city: 'Florianópolis', state: 'SC' },
    { name: 'Agronômica', city: 'Florianópolis', state: 'SC' },
    { name: 'Pantanal', city: 'Florianópolis', state: 'SC' },
    { name: 'Córrego Grande', city: 'Florianópolis', state: 'SC' }
  ],

  'Campo Grande': [
    { name: 'Centro', city: 'Campo Grande', state: 'MS' },
    { name: 'Vila Olinda', city: 'Campo Grande', state: 'MS' },
    { name: 'Jardim dos Estados', city: 'Campo Grande', state: 'MS' },
    { name: 'Centro-Oeste', city: 'Campo Grande', state: 'MS' },
    { name: 'Vila Rosa Pires', city: 'Campo Grande', state: 'MS' },
    { name: 'Chácara Cachoeira', city: 'Campo Grande', state: 'MS' },
    { name: 'Vila Carvalho', city: 'Campo Grande', state: 'MS' },
    { name: 'Amambaí', city: 'Campo Grande', state: 'MS' },
    { name: 'Vila Alba', city: 'Campo Grande', state: 'MS' },
    { name: 'Monte Castelo', city: 'Campo Grande', state: 'MS' }
  ],

  // Adicionar todas as outras cidades da lista principal
  'João Pessoa': [
    { name: 'Centro', city: 'João Pessoa', state: 'PB' },
    { name: 'Tambaú', city: 'João Pessoa', state: 'PB' },
    { name: 'Manaíra', city: 'João Pessoa', state: 'PB' },
    { name: 'Cabo Branco', city: 'João Pessoa', state: 'PB' },
    { name: 'Bessa', city: 'João Pessoa', state: 'PB' },
    { name: 'Bancários', city: 'João Pessoa', state: 'PB' },
    { name: 'Mangabeira', city: 'João Pessoa', state: 'PB' },
    { name: 'Cristo Redentor', city: 'João Pessoa', state: 'PB' },
    { name: 'Torre', city: 'João Pessoa', state: 'PB' },
    { name: 'Jaguaribe', city: 'João Pessoa', state: 'PB' }
  ],

  'Natal': [
    { name: 'Ponta Negra', city: 'Natal', state: 'RN' },
    { name: 'Zona Sul', city: 'Natal', state: 'RN' },
    { name: 'Petrópolis', city: 'Natal', state: 'RN' },
    { name: 'Tirol', city: 'Natal', state: 'RN' },
    { name: 'Lagoa Nova', city: 'Natal', state: 'RN' },
    { name: 'Capim Macio', city: 'Natal', state: 'RN' },
    { name: 'Neópolis', city: 'Natal', state: 'RN' },
    { name: 'Centro', city: 'Natal', state: 'RN' },
    { name: 'Cidade Alta', city: 'Natal', state: 'RN' },
    { name: 'Alecrim', city: 'Natal', state: 'RN' }
  ],

  'Maceió': [
    { name: 'Pajuçara', city: 'Maceió', state: 'AL' },
    { name: 'Ponta Verde', city: 'Maceió', state: 'AL' },
    { name: 'Jatiúca', city: 'Maceió', state: 'AL' },
    { name: 'Mangabeiras', city: 'Maceió', state: 'AL' },
    { name: 'Farol', city: 'Maceió', state: 'AL' },
    { name: 'Centro', city: 'Maceió', state: 'AL' },
    { name: 'Gruta de Lourdes', city: 'Maceió', state: 'AL' },
    { name: 'Poço', city: 'Maceió', state: 'AL' },
    { name: 'Prado', city: 'Maceió', state: 'AL' },
    { name: 'Serraria', city: 'Maceió', state: 'AL' }
  ],

  'Aracaju': [
    { name: 'Centro', city: 'Aracaju', state: 'SE' },
    { name: 'Atalaia', city: 'Aracaju', state: 'SE' },
    { name: 'Treze de Julho', city: 'Aracaju', state: 'SE' },
    { name: 'São José', city: 'Aracaju', state: 'SE' },
    { name: 'Jardins', city: 'Aracaju', state: 'SE' },
    { name: 'Grageru', city: 'Aracaju', state: 'SE' },
    { name: 'Farolândia', city: 'Aracaju', state: 'SE' },
    { name: 'Inacio Barbosa', city: 'Aracaju', state: 'SE' },
    { name: 'Coroa do Meio', city: 'Aracaju', state: 'SE' },
    { name: 'Salgado Filho', city: 'Aracaju', state: 'SE' }
  ],

  'Teresina': [
    { name: 'Centro', city: 'Teresina', state: 'PI' },
    { name: 'Fátima', city: 'Teresina', state: 'PI' },
    { name: 'Jóquei', city: 'Teresina', state: 'PI' },
    { name: 'Ininga', city: 'Teresina', state: 'PI' },
    { name: 'São Cristóvão', city: 'Teresina', state: 'PI' },
    { name: 'Horto', city: 'Teresina', state: 'PI' },
    { name: 'Ilhotas', city: 'Teresina', state: 'PI' },
    { name: 'Noivos', city: 'Teresina', state: 'PI' },
    { name: 'Mocambinho', city: 'Teresina', state: 'PI' },
    { name: 'Cabral', city: 'Teresina', state: 'PI' }
  ],

  'São Luís': [
    { name: 'Centro', city: 'São Luís', state: 'MA' },
    { name: 'Calhau', city: 'São Luís', state: 'MA' },
    { name: 'Ponta da Areia', city: 'São Luís', state: 'MA' },
    { name: 'São Francisco', city: 'São Luís', state: 'MA' },
    { name: 'Renascença', city: 'São Luís', state: 'MA' },
    { name: 'Jardim Eldorado', city: 'São Luís', state: 'MA' },
    { name: 'Cohama', city: 'São Luís', state: 'MA' },
    { name: 'Turu', city: 'São Luís', state: 'MA' },
    { name: 'Vinhais', city: 'São Luís', state: 'MA' },
    { name: 'João Paulo', city: 'São Luís', state: 'MA' }
  ],

  'Campinas': [
    { name: 'Centro', city: 'Campinas', state: 'SP' },
    { name: 'Cambuí', city: 'Campinas', state: 'SP' },
    { name: 'Guanabara', city: 'Campinas', state: 'SP' },
    { name: 'Nova Campinas', city: 'Campinas', state: 'SP' },
    { name: 'Jardim das Paineiras', city: 'Campinas', state: 'SP' },
    { name: 'Botafogo', city: 'Campinas', state: 'SP' },
    { name: 'Vila Industrial', city: 'Campinas', state: 'SP' },
    { name: 'Barão Geraldo', city: 'Campinas', state: 'SP' },
    { name: 'Jardim Chapadão', city: 'Campinas', state: 'SP' },
    { name: 'Taquaral', city: 'Campinas', state: 'SP' }
  ],

  'Santos': [
    { name: 'Centro', city: 'Santos', state: 'SP' },
    { name: 'Gonzaga', city: 'Santos', state: 'SP' },
    { name: 'Boqueirão', city: 'Santos', state: 'SP' },
    { name: 'Embaré', city: 'Santos', state: 'SP' },
    { name: 'José Menino', city: 'Santos', state: 'SP' },
    { name: 'Aparecida', city: 'Santos', state: 'SP' },
    { name: 'Ponta da Praia', city: 'Santos', state: 'SP' },
    { name: 'Vila Belmiro', city: 'Santos', state: 'SP' },
    { name: 'Campo Grande', city: 'Santos', state: 'SP' },
    { name: 'Macuco', city: 'Santos', state: 'SP' }
  ],

  'Ribeirão Preto': [
    { name: 'Centro', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Jardim Irajá', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Jardim Botânico', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Vila do Golf', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Jardim Sumaré', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Alto da Boa Vista', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Jardim Canadá', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Vila Tibério', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Campos Elíseos', city: 'Ribeirão Preto', state: 'SP' },
    { name: 'Jardim América', city: 'Ribeirão Preto', state: 'SP' }
  ],

  'Sorocaba': [
    { name: 'Centro', city: 'Sorocaba', state: 'SP' },
    { name: 'Vila Carvalho', city: 'Sorocaba', state: 'SP' },
    { name: 'Jardim Vergueiro', city: 'Sorocaba', state: 'SP' },
    { name: 'Vila Hortência', city: 'Sorocaba', state: 'SP' },
    { name: 'Além Ponte', city: 'Sorocaba', state: 'SP' },
    { name: 'Jardim Paulistano', city: 'Sorocaba', state: 'SP' },
    { name: 'Vila Independência', city: 'Sorocaba', state: 'SP' },
    { name: 'Jardim Europa', city: 'Sorocaba', state: 'SP' },
    { name: 'Alto da Boa Vista', city: 'Sorocaba', state: 'SP' },
    { name: 'Wanel Ville', city: 'Sorocaba', state: 'SP' }
  ],

  'Uberlândia': [
    { name: 'Centro', city: 'Uberlândia', state: 'MG' },
    { name: 'Martins', city: 'Uberlândia', state: 'MG' },
    { name: 'Jardim Brasília', city: 'Uberlândia', state: 'MG' },
    { name: 'Saraiva', city: 'Uberlândia', state: 'MG' },
    { name: 'Santa Mônica', city: 'Uberlândia', state: 'MG' },
    { name: 'Morada da Colina', city: 'Uberlândia', state: 'MG' },
    { name: 'Vigilato Pereira', city: 'Uberlândia', state: 'MG' },
    { name: 'Patrimônio', city: 'Uberlândia', state: 'MG' },
    { name: 'Nova Uberlândia', city: 'Uberlândia', state: 'MG' },
    { name: 'Tibery', city: 'Uberlândia', state: 'MG' }
  ],

  'Juiz de Fora': [
    { name: 'Centro', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Bom Pastor', city: 'Juiz de Fora', state: 'MG' },
    { name: 'São Mateus', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Passos', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Granbery', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Cascatinha', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Santa Luzia', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Alto dos Passos', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Manoel Honório', city: 'Juiz de Fora', state: 'MG' },
    { name: 'Santa Cruz', city: 'Juiz de Fora', state: 'MG' }
  ],

  'Joinville': [
    { name: 'Centro', city: 'Joinville', state: 'SC' },
    { name: 'América', city: 'Joinville', state: 'SC' },
    { name: 'Anita Garibaldi', city: 'Joinville', state: 'SC' },
    { name: 'Atiradores', city: 'Joinville', state: 'SC' },
    { name: 'Boa Vista', city: 'Joinville', state: 'SC' },
    { name: 'Bucarein', city: 'Joinville', state: 'SC' },
    { name: 'Glória', city: 'Joinville', state: 'SC' },
    { name: 'Itaum', city: 'Joinville', state: 'SC' },
    { name: 'Jardim Iririú', city: 'Joinville', state: 'SC' },
    { name: 'Saguaçu', city: 'Joinville', state: 'SC' }
  ],

  'Londrina': [
    { name: 'Centro', city: 'Londrina', state: 'PR' },
    { name: 'Jardim Higienópolis', city: 'Londrina', state: 'PR' },
    { name: 'Gleba Palhano', city: 'Londrina', state: 'PR' },
    { name: 'Jardim Shangri-lá', city: 'Londrina', state: 'PR' },
    { name: 'Vila Brasil', city: 'Londrina', state: 'PR' },
    { name: 'Jardim Petrópolis', city: 'Londrina', state: 'PR' },
    { name: 'Jardim Ipê', city: 'Londrina', state: 'PR' },
    { name: 'Vila Nova', city: 'Londrina', state: 'PR' },
    { name: 'Jardim Bandeirantes', city: 'Londrina', state: 'PR' },
    { name: 'Jardim do Sol', city: 'Londrina', state: 'PR' }
  ],

  'Maringá': [
    { name: 'Centro', city: 'Maringá', state: 'PR' },
    { name: 'Zona 01', city: 'Maringá', state: 'PR' },
    { name: 'Zona 02', city: 'Maringá', state: 'PR' },
    { name: 'Zona 03', city: 'Maringá', state: 'PR' },
    { name: 'Zona 04', city: 'Maringá', state: 'PR' },
    { name: 'Zona 05', city: 'Maringá', state: 'PR' },
    { name: 'Zona 06', city: 'Maringá', state: 'PR' },
    { name: 'Zona 07', city: 'Maringá', state: 'PR' },
    { name: 'Jardim Alvorada', city: 'Maringá', state: 'PR' },
    { name: 'Vila Operária', city: 'Maringá', state: 'PR' }
  ],

  'Caxias do Sul': [
    { name: 'Centro', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Rio Branco', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Madureira', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Petrópolis', city: 'Caxias do Sul', state: 'RS' },
    { name: 'São Pelegrino', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Exposição', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Jardim América', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Cinquentenário', city: 'Caxias do Sul', state: 'RS' },
    { name: 'De Lourdes', city: 'Caxias do Sul', state: 'RS' },
    { name: 'Pioneiro', city: 'Caxias do Sul', state: 'RS' }
  ],

  'Cuiabá': [
    { name: 'Centro', city: 'Cuiabá', state: 'MT' },
    { name: 'Jardim das Américas', city: 'Cuiabá', state: 'MT' },
    { name: 'Bosque da Saúde', city: 'Cuiabá', state: 'MT' },
    { name: 'Jardim Aclimação', city: 'Cuiabá', state: 'MT' },
    { name: 'Consil', city: 'Cuiabá', state: 'MT' },
    { name: 'Duque de Caxias', city: 'Cuiabá', state: 'MT' },
    { name: 'Goiabeiras', city: 'Cuiabá', state: 'MT' },
    { name: 'Jardim Califórnia', city: 'Cuiabá', state: 'MT' },
    { name: 'Lixeira', city: 'Cuiabá', state: 'MT' },
    { name: 'Quilombo', city: 'Cuiabá', state: 'MT' }
  ],

  'Porto Velho': [
    { name: 'Centro', city: 'Porto Velho', state: 'RO' },
    { name: 'Arigolândia', city: 'Porto Velho', state: 'RO' },
    { name: 'Costa e Silva', city: 'Porto Velho', state: 'RO' },
    { name: 'Embratel', city: 'Porto Velho', state: 'RO' },
    { name: 'Flodoaldo Pontes Pinto', city: 'Porto Velho', state: 'RO' },
    { name: 'Industrial', city: 'Porto Velho', state: 'RO' },
    { name: 'Liberdade', city: 'Porto Velho', state: 'RO' },
    { name: 'Nacional', city: 'Porto Velho', state: 'RO' },
    { name: 'Nova Porto Velho', city: 'Porto Velho', state: 'RO' },
    { name: 'Panair', city: 'Porto Velho', state: 'RO' }
  ],

  'Rio Branco': [
    { name: 'Centro', city: 'Rio Branco', state: 'AC' },
    { name: 'Bosque', city: 'Rio Branco', state: 'AC' },
    { name: 'Cadeia Velha', city: 'Rio Branco', state: 'AC' },
    { name: 'Cidade Nova', city: 'Rio Branco', state: 'AC' },
    { name: 'Conjunto Habitacional Cidade do Povo', city: 'Rio Branco', state: 'AC' },
    { name: 'Estação Experimental', city: 'Rio Branco', state: 'AC' },
    { name: 'Floresta Sul', city: 'Rio Branco', state: 'AC' },
    { name: 'Ipase', city: 'Rio Branco', state: 'AC' },
    { name: 'Isaura Parente', city: 'Rio Branco', state: 'AC' },
    { name: 'Placas', city: 'Rio Branco', state: 'AC' }
  ],

  'Macapá': [
    { name: 'Centro', city: 'Macapá', state: 'AP' },
    { name: 'Beirol', city: 'Macapá', state: 'AP' },
    { name: 'Buritizal', city: 'Macapá', state: 'AP' },
    { name: 'Central', city: 'Macapá', state: 'AP' },
    { name: 'Cidade Nova', city: 'Macapá', state: 'AP' },
    { name: 'Jesus de Nazaré', city: 'Macapá', state: 'AP' },
    { name: 'Laguinho', city: 'Macapá', state: 'AP' },
    { name: 'Marco Zero', city: 'Macapá', state: 'AP' },
    { name: 'Perpétuo Socorro', city: 'Macapá', state: 'AP' },
    { name: 'Santa Rita', city: 'Macapá', state: 'AP' }
  ],

  'Boa Vista': [
    { name: 'Centro', city: 'Boa Vista', state: 'RR' },
    { name: 'Aparecida', city: 'Boa Vista', state: 'RR' },
    { name: 'Bairro dos Estados', city: 'Boa Vista', state: 'RR' },
    { name: 'Caçari', city: 'Boa Vista', state: 'RR' },
    { name: 'Caimbé', city: 'Boa Vista', state: 'RR' },
    { name: 'Cidade Satélite', city: 'Boa Vista', state: 'RR' },
    { name: 'Jardim Caranã', city: 'Boa Vista', state: 'RR' },
    { name: 'Liberdade', city: 'Boa Vista', state: 'RR' },
    { name: 'Mecejana', city: 'Boa Vista', state: 'RR' },
    { name: 'Paraviana', city: 'Boa Vista', state: 'RR' }
  ],

  'Palmas': [
    { name: 'Centro', city: 'Palmas', state: 'TO' },
    { name: 'Plano Diretor Norte', city: 'Palmas', state: 'TO' },
    { name: 'Plano Diretor Sul', city: 'Palmas', state: 'TO' },
    { name: 'Arse 14', city: 'Palmas', state: 'TO' },
    { name: 'Arse 72', city: 'Palmas', state: 'TO' },
    { name: 'Jardim Aureny III', city: 'Palmas', state: 'TO' },
    { name: 'Setor Universitário', city: 'Palmas', state: 'TO' },
    { name: 'Arso 14', city: 'Palmas', state: 'TO' },
    { name: 'Quadra 104 Norte', city: 'Palmas', state: 'TO' },
    { name: 'Quadra 206 Sul', city: 'Palmas', state: 'TO' }
  ]
};

// Função para normalizar texto (remover acentos e padronizar)
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim();
};

// Bairros genéricos para qualquer cidade brasileira
const generateGenericNeighborhoods = (cityName: string, state: string): Neighborhood[] => {
  const genericNeighborhoods = [
    'Centro',
    'Vila Nova',
    'Jardim Primavera',
    'Bela Vista',
    'Santa Rita',
    'São José',
    'Vila Brasil',
    'Alto da Boa Vista',
    'Jardim América',
    'Vila Industrial',
    'Centro-Norte',
    'Vila São João',
    'Jardim Esperança',
    'Parque das Flores',
    'Vila Santa Maria',
    'Conjunto Habitacional',
    'Jardim das Acácias',
    'Vila São Pedro',
    'Santa Terezinha',
    'Jardim Botânico',
    'Vila São Paulo',
    'Cidade Nova',
    'Jardim das Rosas',
    'Vila dos Trabalhadores',
    'Parque Central'
  ];

  return genericNeighborhoods.map(name => ({
    name,
    city: cityName,
    state
  }));
};

// Função para buscar bairros por cidade (com busca flexível e geração automática)
export const getNeighborhoodsByCity = (cityName: string, state?: string): Neighborhood[] => {
  // Primeiro, tenta busca exata
  let neighborhoods = neighborhoodsByCity[cityName];

  if (!neighborhoods) {
    // Se não encontrou, tenta busca normalizada
    const normalizedSearch = normalizeText(cityName);

    // Procura por uma cidade que tenha o nome similar (normalizado)
    const foundCity = Object.keys(neighborhoodsByCity).find(city =>
      normalizeText(city) === normalizedSearch
    );

    if (foundCity) {
      neighborhoods = neighborhoodsByCity[foundCity];
    }
  }

  // Se ainda não encontrou, gera bairros genéricos
  if (!neighborhoods) {
    console.log(`🏘️ Gerando bairros genéricos para: ${cityName} - ${state || ''}`);
    neighborhoods = generateGenericNeighborhoods(cityName, state || '');
  }

  return neighborhoods;
};

// Função para buscar bairros com filtro de texto
export const searchNeighborhoods = (cityName: string, searchTerm: string): Neighborhood[] => {
  const neighborhoods = getNeighborhoodsByCity(cityName);
  if (!searchTerm) return neighborhoods;

  return neighborhoods.filter(neighborhood =>
    neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
