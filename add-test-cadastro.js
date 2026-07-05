// Script para adicionar cadastro pendente de teste da Gabriela
import { cadastrosService } from './src/lib/supabase.js';

const testCadastro = {
  name: 'Gabriela',
  real_name: 'Gabriela Silva',
  display_name: 'Gabriela',
  email: 'gabriela.recife@exemplo.com',
  phone: '(81) 99999-8888',
  age: 23,
  location: 'Boa Viagem, Recife',
  height: '1,65m',
  image: 'https://images.unsplash.com/photo-1494790108755-2616b332c74c?w=400&h=500&fit=crop&crop=face',
  gallery: [
    'https://images.unsplash.com/photo-1494790108755-2616b332c74c?w=400&h=500&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face'
  ],
  services: ['Acompanhante de luxo', 'Jantar romântico', 'Eventos sociais'],
  cities_served: ['Recife', 'Boa Viagem', 'Olinda'],
  description: 'Acompanhante carinhosa e educada, ideal para eventos sociais e jantares românticos.',
  pricePerHour: '200',
  hasOwnLocation: true,
  acceptsTravel: true,
  professionalName: 'Gabriela',
  status: 'pending'
};

async function addTestCadastro() {
  try {
    console.log('Criando cadastro pendente de teste...');
    const result = await cadastrosService.create(testCadastro);
    console.log('✅ Cadastro criado com sucesso:', result);
  } catch (error) {
    console.error('❌ Erro ao criar cadastro:', error);
  }
}

addTestCadastro();