import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';

const BasicInfoRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    artisticName: '',
    phone: '',
    age: '',
    gender: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!formData.artisticName.trim() || !formData.phone.trim() || !formData.age.trim() || !formData.gender) {
      setError('Preencha todos os campos');
      return;
    }

    const age = parseInt(formData.age);
    if (age < 18 || age > 99) {
      setError('Idade deve ser entre 18 e 99 anos');
      return;
    }

    setIsLoading(true);

    try {
      // Pegar dados do auth do localStorage
      const tempAuthData = localStorage.getItem('tempAuthData');
      console.log('🔍 BasicInfoRegister - tempAuthData lido:', tempAuthData);

      if (!tempAuthData) {
        console.error('❌ BasicInfoRegister - tempAuthData não encontrado');
        throw new Error('Dados de autenticação não encontrados. Comece o cadastro novamente.');
      }

      const authData = JSON.parse(tempAuthData);
      console.log('📦 BasicInfoRegister - authData parseado:', authData);

      // Atualizar dados temporários com as informações básicas
      const updatedData = {
        ...authData,
        artisticName: formData.artisticName,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender
      };

      console.log('💾 BasicInfoRegister - Salvando updatedData:', updatedData);
      localStorage.setItem('tempAuthData', JSON.stringify(updatedData));

      // Verificar se salvou
      const verificacao = localStorage.getItem('tempAuthData');
      console.log('✅ BasicInfoRegister - Verificação após salvar:', verificacao);

      // Navegar para a tela de localização
      console.log('🚀 BasicInfoRegister - Navegando para /location-register');
      navigate('/location-register');

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-gray-900">
      {/* Mobile container constraint */}
      <div className="w-full max-w-md h-full min-h-screen flex flex-col p-6 relative">

        {/* Header Section */}
        <header className="flex flex-col items-center pt-2 pb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-6 top-8 text-gray-800 hover:text-gray-600 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={28} strokeWidth={2.5} />
          </button>
        </header>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col mt-4">
          <div className="space-y-6">
            <Input
              label="Nome artístico"
              name="artisticName"
              placeholder="Seu nome artístico"
              value={formData.artisticName}
              onChange={handleChange}
              type="text"
            />

            <Input
              label="Número de telefone"
              name="phone"
              placeholder="Seu telefone com DDD"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
            />

            <Input
              label="Idade"
              name="age"
              placeholder="Sua idade"
              value={formData.age}
              onChange={handleChange}
              type="number"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Gênero</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all appearance-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <option value="">Selecione</option>
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
                <option value="trans">Trans</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Footer / Action Section */}
          <div className="mt-8 pb-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#ff4081] hover:bg-[#d91d83] text-white font-bold text-lg py-4 rounded-2xl shadow-md active:scale-[0.98] transition-all duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                'Continuar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicInfoRegister;