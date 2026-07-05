import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function ModelRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    artisticName: '',
    phoneNumber: '',
    age: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.artisticName.trim() || !formData.phoneNumber.trim() || !formData.age.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Salvar dados no localStorage para usar na próxima tela
    localStorage.setItem('registerFormData', JSON.stringify(formData));

    // Navigate to location register page
    navigate('/location-register');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-sm relative">
      {/* Header Section */}
      <header className="px-6 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={28} strokeWidth={2.5} />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 flex flex-col pb-6">
        <div className="mb-8 text-center mt-2">
          <h1 className="text-2xl text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
            Crie sua conta
          </h1>
          <p className="text-gray-500 text-base tracking-wide font-normal" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
            Bem-vinda a Pink House.
          </p>
        </div>

        <div className="space-y-5">
          <InputField
            label="Nome artístico"
            name="artisticName"
            placeholder="Seu nome artístico"
            value={formData.artisticName}
            onChange={handleChange}
            type="text"
          />

          <InputField
            label="Número de telefone"
            name="phoneNumber"
            placeholder="Seu telefone com DDD"
            value={formData.phoneNumber}
            onChange={handleChange}
            type="tel"
          />

          <InputField
            label="Idade"
            name="age"
            placeholder="Sua idade"
            value={formData.age}
            onChange={handleChange}
            type="number"
          />
        </div>

        <div className="mt-6">
          <Button onClick={handleSubmit}>
            Continuar
          </Button>

          <div className="text-center mt-4">
            <span className="text-gray-500 text-sm font-normal" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
              Já tem uma conta?{' '}
            </span>
            <button
              onClick={() => navigate('/login')}
              className="text-[#ff4d8d] text-sm underline decoration-2"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              Entrar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}




