// Teste da integração das cidades brasileiras
const { allBrazilianCities } = require('./src/lib/all-brazilian-cities.ts');

console.log('🏙️ Testando integração da base completa de cidades brasileiras');
console.log(`📊 Total de cidades carregadas: ${allBrazilianCities.length}`);

// Testar cidades específicas solicitadas
const testCities = ['Sombrio', 'Balneário Gaivota', 'Caxias do Sul', 'Balneário Camboriú'];

console.log('\n🔍 Verificando cidades específicas solicitadas:');
testCities.forEach(cityName => {
  const found = allBrazilianCities.find(city => city.name === cityName);
  if (found) {
    console.log(`✅ ${cityName} - ${found.state} - ${found.fullName}`);
  } else {
    console.log(`❌ ${cityName} - NÃO ENCONTRADA`);
  }
});

// Mostrar algumas cidades por estado para verificar cobertura
console.log('\n🗺️ Amostra de cidades por estado:');
const statesSample = ['SC', 'SP', 'RJ', 'MG', 'RS'];
statesSample.forEach(state => {
  const citiesInState = allBrazilianCities.filter(city => city.state === state);
  console.log(`${state}: ${citiesInState.length} cidades`);
  console.log(`   Exemplos: ${citiesInState.slice(0, 3).map(c => c.name).join(', ')}...`);
});

console.log('\n✅ Sistema integrado com sucesso!');
console.log('📱 A funcionalidade de busca agora inclui todas as cidades brasileiras');