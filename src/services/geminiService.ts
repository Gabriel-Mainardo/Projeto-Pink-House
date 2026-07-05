// Mock do serviço Gemini - retorna mensagens pré-definidas
export const generateSafetyTip = async (location: string, duration: string): Promise<string> => {
  // Simula um pequeno delay como se estivesse chamando uma API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Retorna uma mensagem motivacional baseada no local e duração
  const tips = [
    "Monitoramento ativado! Estaremos de olho no seu tempo de encontro.",
    "Segurança ativada com sucesso! Mantenha seu celular carregado.",
    "Sistema ativo! Você receberá um alerta se ultrapassar o tempo definido.",
    "Proteção ligada! Cuide-se e tenha um ótimo encontro.",
    "Tudo pronto! Estamos monitorando sua segurança durante o encontro."
  ];

  return tips[Math.floor(Math.random() * tips.length)];
};
