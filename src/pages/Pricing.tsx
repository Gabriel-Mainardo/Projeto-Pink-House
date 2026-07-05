import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { DollarSign, ArrowLeft, Clock } from 'lucide-react';
import { registrationService } from '../services/registrationService';
import { supabase } from '../lib/supabase';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const [priceData, setPriceData] = useState({
    hourlyRate: '',
    minimumHours: '1',
    additionalInfo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPriceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100;

    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    handleInputChange('hourlyRate', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!priceData.hourlyRate.trim()) {
        throw new Error('Por favor, informe o valor do seu atendimento');
      }

      // Salvar dados no localStorage (backup)
      registrationService.saveData({
        hourlyRate: priceData.hourlyRate,
        minimumHours: priceData.minimumHours,
        additionalInfo: priceData.additionalInfo
      });

      // PERSISTIR o preço na tabela acompanhantes
      const cId = searchParams.get('companionId') || (() => {
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          return u.companionId || u.id || '';
        } catch { return ''; }
      })();

      // Extrair valor numérico do preço formatado (R$ 300,00 → 300)
      const numericPrice = parseFloat(
        priceData.hourlyRate.replace(/[^\d,]/g, '').replace(',', '.')
      ) || 0;

      if (cId) {
        const { error: updateError } = await supabase
          .from('acompanhantes')
          .update({
            priceperhour: numericPrice,
            description: priceData.additionalInfo
              ? `${priceData.additionalInfo}`
              : undefined,
          })
          .eq('id', cId);

        if (updateError) {
          console.error('Erro ao atualizar preço no perfil:', updateError);
        }
      }

      // Cadastro concluído — ir direto para o dashboard
      navigate('/companion-dashboard?newRegistration=true');

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">

            {/* Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Valor do atendimento</h1>
            </div>

            <p className="text-gray-600 mb-6">
              Defina o valor que você cobra por hora de atendimento
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Valor por hora */}
              <div className="space-y-2">
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                  Valor por hora <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="hourlyRate"
                    type="text"
                    value={priceData.hourlyRate}
                    onChange={handlePriceChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-velvet-pink-500 transition-colors pl-10 text-lg font-semibold"
                    placeholder="R$ 0,00"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Este será o valor base exibido no seu perfil
                </p>
              </div>

              {/* Tempo mínimo de atendimento */}
              <div className="space-y-2">
                <label htmlFor="minimumHours" className="block text-sm font-medium text-gray-700">
                  Tempo mínimo de atendimento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="minimumHours"
                    value={priceData.minimumHours}
                    onChange={(e) => handleInputChange('minimumHours', e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-velvet-pink-500 transition-colors pl-10"
                  >
                    <option value="1">1 hora</option>
                    <option value="2">2 horas</option>
                    <option value="3">3 horas</option>
                    <option value="4">4 horas</option>
                    <option value="pernoite">Pernoite</option>
                  </select>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="space-y-2">
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                  Capricha na descrição — essa parte irá aparecer para os clientes
                </label>
                <textarea
                  id="additionalInfo"
                  value={priceData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-velvet-pink-500 transition-colors resize-none"
                  placeholder="Crie uma descrição sobre você, qual seu diferencial e o que vai deixar seus clientes babando..."
                />
                <p className="text-xs text-gray-500">
                  Máximo 500 caracteres
                </p>
              </div>

              {/* Card informativo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Dica profissional</p>
                    <p>
                      Seja transparente sobre seus valores. Clientes valorizam honestidade e clareza nas informações.
                      Você poderá ajustar seus preços a qualquer momento no seu painel.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-colors hover:from-velvet-pink-800 hover:to-velvet-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-velvet-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Finalizar Cadastro'
                )}
              </button>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
