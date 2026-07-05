/**
 * Retorna o caminho do dashboard correto baseado no tipo de usuário
 */
export const getDashboardRoute = (): string => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return '/'; // Sem usuário, vai pra home
    }

    const user = JSON.parse(userStr);

    // Verificar tipo de usuário
    if (user.type === 'companion' || user.userType === 'companion') {
      return '/companion-dashboard';
    } else if (user.type === 'client' || user.userType === 'client') {
      return '/client-dashboard';
    }

    // Fallback para home se não identificar o tipo
    return '/';
  } catch (error) {
    console.error('Erro ao obter rota do dashboard:', error);
    return '/';
  }
};

/**
 * Redireciona para o dashboard correto baseado no tipo de usuário
 */
export const navigateToDashboard = (navigate: (path: string) => void): void => {
  const dashboardRoute = getDashboardRoute();
  navigate(dashboardRoute);
};
