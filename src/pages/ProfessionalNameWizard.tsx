import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { ArrowLeft, ArrowRight, User, Upload, Camera } from 'lucide-react';
import { registrationService } from '../services/registrationService';

const ProfessionalNameWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userEmail = searchParams.get('email') || '';
  const serviceType = searchParams.get('service') || '';
  const city = searchParams.get('city') || '';
  const neighborhood = searchParams.get('neighborhood') || '';
  const artisticNameFromUrl = searchParams.get('artisticName') || '';
  const phoneNumberFromUrl = searchParams.get('phoneNumber') || '';
  const age = searchParams.get('age') || '';

  const [currentStep, setCurrentStep] = useState(() => {
    return artisticNameFromUrl ? 2 : 1;
  });
  const [professionalName, setProfessionalName] = useState(artisticNameFromUrl);
  const [values, setValues] = useState({
    oneHour: searchParams.get('oneHour') || '',
    thirtyMinutes: searchParams.get('thirtyMinutes') || '',
    fifteenMinutes: searchParams.get('fifteenMinutes') || '',
    pernoite: searchParams.get('pernoite') || '',
    viagem: searchParams.get('viagem') || ''
  });
  const [focusedFields, setFocusedFields] = useState({
    oneHour: false,
    thirtyMinutes: false,
    fifteenMinutes: false,
    pernoite: false,
    viagem: false
  });
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedGenitalia, setSelectedGenitalia] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showPlanOffer, setShowPlanOffer] = useState(false);

  // Função para determinar o plano sugerido baseado no valor da 1 hora
  const getSuggestedPlan = (oneHourValue: string) => {
    const value = parseFloat(oneHourValue.replace(/[^\d,]/g, '').replace(',', '.'));

    if (value >= 350) {
      return {
        type: 'black',
        name: 'Plano Black',
        description: 'Para profissionais premium',
        price: 'R$ 350/mês',
        benefits: ['Destaque máximo', 'Stories ilimitados', 'Suporte prioritário', 'Relatórios avançados']
      };
    } else if (value >= 200) {
      return {
        type: 'gold',
        name: 'Plano Gold',
        description: 'Para profissionais estabelecidos',
        price: 'R$ 200/mês',
        benefits: ['Destaque no catálogo', 'Stories em destaque', 'Suporte especializado', 'Estatísticas detalhadas']
      };
    } else if (value >= 100) {
      return {
        type: 'pro',
        name: 'Plano Pro',
        description: 'Para profissionais em crescimento',
        price: 'R$ 100/mês',
        benefits: ['Maior visibilidade', 'Stories personalizados', 'Suporte prioritário', 'Métricas básicas']
      };
    }
    return null;
  };

  const handleAcceptPlan = (planType: string) => {
    setSelectedPlan(planType);
    setShowPlanOffer(false);
    setCurrentStep(4);
  };

  const navigateToProfile = () => {
    const params = new URLSearchParams({
      email: userEmail,
      service: serviceType || 'companion',
      professionalName: professionalName,
      city: city,
      neighborhood: neighborhood,
      age: age,
      oneHour: values.oneHour,
      thirtyMinutes: values.thirtyMinutes,
      fifteenMinutes: values.fifteenMinutes,
      selectedPlan: selectedPlan || 'none'
    });

    navigate(`/professional-name-wizard?${params.toString()}`);
  };

  const handleDeclinePlan = () => {
    setShowPlanOffer(false);
    setCurrentStep(4);
  };

  const saveRegistrationAndFinish = () => {
    registrationService.saveData({
      email: userEmail,
      age,
      city,
      neighborhood,
      professionalName,
      // profilePhoto removido: foto de perfil é definida depois em PhotoUpload
      values: {
        oneHour: values.oneHour,
        thirtyMinutes: values.thirtyMinutes,
        fifteenMinutes: values.fifteenMinutes,
        pernoite: values.pernoite,
        viagem: values.viagem
      },
      gender: selectedGender || undefined,
      genitalia: selectedGenitalia || undefined,
      selectedPlan: selectedPlan || undefined
    });

    navigate('/register-success');
  };

  const handleNext = () => {
    // Se estamos no passo 3 (valores)
    if (currentStep === 3) {
      const suggestedPlan = getSuggestedPlan(values.oneHour);
      if (suggestedPlan) {
        // Valor >= 100 - mostrar oferta de plano
        setShowPlanOffer(true);
        return;
      }

      setCurrentStep(4);
      return;
    }

    // Se estamos no passo 4 (seleção de gênero), mostrar confirmação
    if (currentStep === 4 && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Se confirmou, ir para o dashboard
    if (currentStep === 4 && showConfirmation) {
      saveRegistrationAndFinish();
      return;
    }

    // Continuar normalmente - pular step 2 (foto de perfil acontece depois em PhotoUpload)
    if (currentStep === 1) {
      setCurrentStep(3);
      setShowConfirmation(false);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setShowConfirmation(false);
    }
  };

  const handleConfirmationBack = () => {
    setShowConfirmation(false);
  };

  const handleBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      return;
    }

    // Voltar pulando step 2 (upload de foto foi removido)
    if (currentStep === 3) {
      setCurrentStep(1);
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Qual é o seu nome profissional?</h2>
            <p className="text-gray-600 mb-8">Este será o nome que aparecerá no seu perfil</p>
            <input
              type="text"
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              placeholder="Digite aqui"
              className="w-full max-w-md mx-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent outline-none text-black font-light placeholder:text-black placeholder:font-light"
            />
            <p className="text-xs text-black mt-2">Preencha apenas com o nome artístico. Não adicione cidade, valores ou tipos de atendimento.</p>
          </div>
        );
      case 2:
        // Upload de foto
        return (
          <div className="w-full max-w-4xl mx-auto">

            {/* Título */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Adicione uma foto e veja como ficará seu anúncio</h2>
              <p className="text-sm text-gray-500">Sua primeira impressão é muito importante</p>
            </div>

            {/* Card de pré-visualização MAIOR */}
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-2xl p-8 mb-6 border-2 border-pink-100">
              <div className="flex flex-col md:flex-row items-start md:space-x-6 space-y-4 md:space-y-0">
                {/* Foto maior */}
                <div className="w-full md:w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {uploadedPhoto ? (
                    <img src={uploadedPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Sua foto aqui</p>
                    </div>
                  )}
                </div>

                {/* Informações do anúncio */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-2xl mb-1">{professionalName || 'Seu nome profissional'}</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Online agora</span>
                      </div>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{age ? `${age} anos` : '-- anos'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 italic">
                      {uploadedPhoto ? '"Sua bio personalizada aparecerá aqui..."' : 'Adicione uma foto para ver o preview completo'}
                    </p>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">📍</span>
                      <span className="text-sm text-gray-600">{city || 'Sua cidade'} {neighborhood && `• ${neighborhood}`}</span>
                    </div>
                  </div>

                  {/* Preço em destaque */}
                  <div className="bg-white rounded-lg p-4 shadow-md border border-pink-200">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-pink-600">R$ {values.oneHour || '---'}</span>
                      <span className="text-gray-500 text-sm">/hora</span>
                    </div>
                    {values.thirtyMinutes && (
                      <div className="text-sm text-gray-600 mt-1">
                        30min: R$ {values.thirtyMinutes}
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                      ✓ Verificada
                    </span>
                    <span className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full font-medium">
                      ⭐ Destaque
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const photoUrl = URL.createObjectURL(file);
                    setUploadedPhoto(photoUrl);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const input = document.getElementById('photo-upload') as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md font-medium"
              >
                <Upload className="w-5 h-5" />
                <span>Adicionar foto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  // Pular para o próximo passo sem foto
                  setCurrentStep(3);
                }}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
              >
                <span>Configurar depois</span>
              </button>
            </div>

            {/* Aviso */}
            <p className="text-xs text-gray-500 text-center">
              💡 Dica: Evite nudez explícita na foto de perfil para passar mais credibilidade
            </p>
          </div>
        );
      case 3:
        return (
          <div className="text-center select-text">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 select-text">Adicione o valor do seu atendimento por duração</h2>
            <p className="text-gray-600 mb-4 select-text">Defina seus preços por tempo de atendimento</p>

            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <label className="text-black font-medium select-text">1 hora</label>
                <div className="flex items-center space-x-2">
                  <span className="text-black font-medium select-text">R$</span>
                  <input
                    type="text"
                    value={values.oneHour}
                    onChange={(e) => setValues({...values, oneHour: e.target.value})}
                    onFocus={() => setFocusedFields({...focusedFields, oneHour: true})}
                    onBlur={() => {
                      if (values.oneHour === '') {
                        setFocusedFields({...focusedFields, oneHour: false});
                      }
                    }}
                    placeholder={!focusedFields.oneHour && values.oneHour === '' ? "Obrigatório" : ""}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent outline-none text-black font-light text-right placeholder:text-black placeholder:font-light text-xs placeholder:text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="text-black font-medium select-text">30 minutos</label>
                <div className="flex items-center space-x-2">
                  <span className="text-black font-medium select-text">R$</span>
                  <input
                    type="text"
                    value={values.thirtyMinutes}
                    onChange={(e) => setValues({...values, thirtyMinutes: e.target.value})}
                    onFocus={() => setFocusedFields({...focusedFields, thirtyMinutes: true})}
                    onBlur={() => {
                      if (values.thirtyMinutes === '') {
                        setFocusedFields({...focusedFields, thirtyMinutes: false});
                      }
                    }}
                    placeholder={!focusedFields.thirtyMinutes && values.thirtyMinutes === '' ? "Opcional" : ""}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent outline-none text-black font-light text-right placeholder:text-black placeholder:font-light text-xs placeholder:text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="text-black font-medium select-text">15 minutos</label>
                <div className="flex items-center space-x-2">
                  <span className="text-black font-medium select-text">R$</span>
                  <input
                    type="text"
                    value={values.fifteenMinutes}
                    onChange={(e) => setValues({...values, fifteenMinutes: e.target.value})}
                    onFocus={() => setFocusedFields({...focusedFields, fifteenMinutes: true})}
                    onBlur={() => {
                      if (values.fifteenMinutes === '') {
                        setFocusedFields({...focusedFields, fifteenMinutes: false});
                      }
                    }}
                    placeholder={!focusedFields.fifteenMinutes && values.fifteenMinutes === '' ? "Opcional" : ""}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent outline-none text-black font-light text-right placeholder:text-black placeholder:font-light text-xs placeholder:text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="text-black font-medium select-text">Pernoite</label>
                <div className="flex items-center space-x-2">
                  <span className="text-black font-medium select-text">R$</span>
                  <input
                    type="text"
                    value={values.pernoite}
                    onChange={(e) => setValues({...values, pernoite: e.target.value})}
                    onFocus={() => setFocusedFields({...focusedFields, pernoite: true})}
                    onBlur={() => {
                      if (values.pernoite === '') {
                        setFocusedFields({...focusedFields, pernoite: false});
                      }
                    }}
                    placeholder={!focusedFields.pernoite && values.pernoite === '' ? "Opcional" : ""}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent outline-none text-black font-light text-right placeholder:text-black placeholder:font-light text-xs placeholder:text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="text-black font-medium select-text">Viagem</label>
                <div className="flex items-center space-x-2">
                  <span className="text-black font-medium select-text">R$</span>
                  <input
                    type="text"
                    value={values.viagem}
                    onChange={(e) => setValues({...values, viagem: e.target.value})}
                    onFocus={() => setFocusedFields({...focusedFields, viagem: true})}
                    onBlur={() => {
                      if (values.viagem === '') {
                        setFocusedFields({...focusedFields, viagem: false});
                      }
                    }}
                    placeholder={!focusedFields.viagem && values.viagem === '' ? "Opcional" : ""}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent outline-none text-black font-light text-right placeholder:text-black placeholder:font-light text-xs placeholder:text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 4: {
        const genderOptions = [
          {
            value: 'Sou mulher cis',
            icon: '♀',
            description: 'Pessoa designada feminina ao nascer e se identifica como mulher'
          },
          {
            value: 'Sou homem cis',
            icon: '♂',
            description: 'Pessoa designada masculina ao nascer e se identifica como homem'
          },
          {
            value: 'Sou mulher trans',
            icon: '⚧',
            description: 'Pessoa designada masculina ao nascer e se identifica como mulher',
            showGenitalia: true
          },
          {
            value: 'Sou homem trans',
            icon: '⚧',
            description: 'Pessoa designada feminina ao nascer e se identifica como homem',
            showGenitalia: true
          },
          {
            value: 'Sou pessoa não binária',
            icon: '⚪',
            description: 'Pessoa que não se identifica exclusivamente como homem ou mulher',
            showGenitalia: true
          }
        ];

        return (
          <div>
            <div className="text-left mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Seu gênero: como você se identifica?</h2>
              <p className="text-sm text-gray-400">Selecione uma opção</p>
            </div>

            <div className="max-w-lg mx-auto space-y-4">
              {genderOptions.map((option) => (
                <div key={option.value}>
                  <button
                    onClick={() => {
                      setSelectedGender(option.value);
                      if (!option.showGenitalia) {
                        setSelectedGenitalia('');
                      }
                    }}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 shadow-sm ${
                      selectedGender === option.value
                        ? 'border-2 border-[#d91d83] bg-white'
                        : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl mt-1">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-1">{option.value}</div>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                        selectedGender === option.value
                          ? 'border-[#d91d83] bg-[#d91d83]'
                          : 'border-gray-300'
                      }`}>
                        {selectedGender === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </div>
                  </button>

                  {selectedGender === option.value && option.showGenitalia && (
                    <div className="mt-3 ml-12">
                      <select
                        value={selectedGenitalia}
                        onChange={(e) => setSelectedGenitalia(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-[#d91d83] focus:border-transparent outline-none"
                      >
                        <option value="">Selecione sua genitália</option>
                        <option value="penis">Pênis</option>
                        <option value="vagina">Vagina</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 5:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfeito, {professionalName}!</h2>
            <p className="text-gray-600 mb-8">Agora vamos preencher as demais informações do seu perfil</p>
            <div className="w-20 h-20 bg-velvet-pink-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-velvet-pink-600" />
            </div>
          </div>
        );
      case 6:
        // Início do fluxo específico para mulher cis - Upload de foto
        return (
          <div className="w-full max-w-2xl mx-auto">

            {/* Título */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Adicione uma foto e veja como ficará seu anúncio</h2>
              <p className="text-sm text-gray-500">Sua primeira impressão é muito importante</p>
            </div>

            {/* Card de pré-visualização */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploadedPhoto ? (
                    <img src={uploadedPhoto} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{professionalName}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online agora</span>
                  </div>
                  <p className="text-sm text-gray-500 italic">Sua frase de status aparecerá aqui</p>
                  <div className="mt-2">
                    <span className="text-[#d91d83] font-bold">R$ {values.oneHour || '---'}</span>
                    <span className="text-gray-500 text-sm">/hora</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{city || 'Sua cidade'}</p>
                </div>
              </div>
            </div>

            {/* Botão de upload */}
            <div className="text-center mb-4">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Criar URL local temporária para preview
                    const photoUrl = URL.createObjectURL(file);
                    setUploadedPhoto(photoUrl);

                    // Aqui você pode adicionar o upload para o Supabase
                    // const { data, error } = await supabase.storage
                    //   .from('profile-photos')
                    //   .upload(`${userEmail}-${Date.now()}`, file);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const input = document.getElementById('photo-upload') as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:border-[#d91d83] hover:text-[#d91d83] transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Adicionar foto</span>
              </button>
            </div>

            {/* Aviso */}
            <p className="text-xs text-gray-400 text-center mb-8">
              Evite nudez explícita na sua foto de perfil, assim você passa mais credibilidade no seu anúncio.
            </p>

            {/* Botão continuar */}
            <button
              onClick={() => setCurrentStep(6)}
              className="w-full bg-[#d91d83] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#d81b60] transition-colors"
            >
              Continuar
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = (currentStep === 1 && !professionalName.trim()) ||
                        (currentStep === 3 && !values.oneHour.trim()) ||
                        (currentStep === 4 && (!selectedGender ||
                          ((['Sou mulher trans', 'Sou homem trans', 'Sou pessoa não binária'].includes(selectedGender)) && !selectedGenitalia)));

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Progress bar - ocultar no step 5 */}
          {currentStep !== 5 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Passo {currentStep} de 4</span>
                <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-velvet-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Step content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 min-h-[400px] flex items-start justify-center pt-16 overflow-hidden">
            <div className={`transition-transform duration-500 ease-in-out transform ${currentStep > 1 ? 'translate-x-0' : 'translate-x-0'}`}>
              {renderStep()}
            </div>
          </div>

          {/* Modal de confirmação */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-sm mx-4">
                <h3 className="text-base font-bold text-gray-800 mb-2">Atenção!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Você selecionou "{selectedGender}". Você tem certeza que deseja continuar?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleConfirmationBack}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 px-3 py-2 bg-[#d91d83] text-white rounded-lg hover:bg-[#d81b60] transition-colors text-sm"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                isNextDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-velvet-pink-600 text-white hover:bg-velvet-pink-700'
              }`}
            >
              <span>{currentStep === 4 ? 'Finalizar' : 'Próximo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>

      <Footer />

      {/* Modal de Oferta de Plano */}
      {showPlanOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {(() => {
              const suggestedPlan = getSuggestedPlan(values.oneHour);
              if (!suggestedPlan) return null;

              return (
                <>
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      suggestedPlan.type === 'black' ? 'bg-gray-900' :
                      suggestedPlan.type === 'gold' ? 'bg-yellow-400' :
                      'bg-velvet-pink-600'
                    }`}>
                      <span className="text-white text-2xl font-bold">
                        {suggestedPlan.type === 'black' ? '♛' :
                         suggestedPlan.type === 'gold' ? '♕' : '♔'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Com base no seu valor de R$ {values.oneHour}, recomendamos:
                    </p>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {suggestedPlan.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {suggestedPlan.description}
                    </p>
                    <p className="text-lg font-bold text-velvet-pink-600">
                      {suggestedPlan.price}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">Benefícios inclusos:</h4>
                    <ul className="space-y-2">
                      {suggestedPlan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeclinePlan}
                      className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Agora não
                    </button>
                    <button
                      onClick={() => handleAcceptPlan(suggestedPlan.type)}
                      className="flex-1 px-4 py-2 text-white bg-velvet-pink-600 rounded-lg hover:bg-velvet-pink-700 transition-colors"
                    >
                      Quero este plano
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalNameWizard;
