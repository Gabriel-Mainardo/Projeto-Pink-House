// Serviço para gerenciar dados de cadastro da acompanhante

export interface RegistrationData {
  // Dados básicos
  email: string;
  password?: string;

  // Informações pessoais
  artisticName?: string;
  phoneNumber?: string;
  age?: string;

  // Localização
  city?: string;
  neighborhood?: string;

  // Tipo de serviço
  serviceType?: string;

  // Nome profissional
  professionalName?: string;

  // Dados pessoais (verificação)
  fullName?: string;
  birthDate?: string;
  motherName?: string;
  cpf?: string;

  // Outros dados que podem ser adicionados depois
  description?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  photos?: string[];
  videos?: string[];
  values?: {
    oneHour?: string;
    thirtyMinutes?: string;
    fifteenMinutes?: string;
    pernoite?: string;
    viagem?: string;
  };
  gender?: string;
  genitalia?: string;
  selectedPlan?: string;
}

const STORAGE_KEY = 'registration_data';

export const registrationService = {
  // Salvar dados no localStorage
  saveData(data: Partial<RegistrationData>) {
    const existingData = this.getData();
    const updatedData = { ...existingData, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  },

  // Obter dados do localStorage
  getData(): RegistrationData {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  // Limpar dados do localStorage
  clearData() {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Verificar se há dados salvos
  hasData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
};
