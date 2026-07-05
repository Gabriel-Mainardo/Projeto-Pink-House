import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageUpload from '../components/ImageUpload';
import MediaUpload from '../components/MediaUpload';
import { User, Mail, Phone, MapPin, Calendar, Upload, Tag, Check, Camera, Link2, Mic, MicOff, Play, Square, ArrowLeft, ArrowRight, DollarSign, MapPin as Location, Users, FileText, Image, Video } from 'lucide-react';
import { cadastrosService } from '../lib/supabase';

// Interface para arquivos de mídia
interface MediaFile {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

const ModelRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para gravação de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);

  const [formData, setFormData] = useState({
    // Informações Pessoais
    real_name: '', // Nome verdadeiro (privado)
    display_name: '', // Nome para exibição
    email: '',
    phone: '',
    age: '',
    location: '',
    height: '',

    // Valores e Atendimento
    price_per_hour: '',
    period_type: 'hour', // 'hour' | '30min' | 'night'
    cities_served: [] as string[], // Cidades que atende

    // Galeria e Mídia
    images: [] as string[],
    videos: [] as string[],
    media: [] as MediaFile[],

    // Apresentação em Áudio
    audio_presentation: '',

    // Especialidades/Serviços
    services: [] as string[],

    // Sobre Você
    description: '',

    // Termos
    terms_accepted: false
  });

  // Validação de email em tempo real
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    message: string;
    isChecking: boolean;
  }>({
    isValid: true,
    message: '',
    isChecking: false
  });

  // Lista de especialidades/serviços disponíveis
  const availableServices = [
    'Loira',
    'Morena',
    'Ruiva',
    'Mulata',
    'Negra',
    'Baixinha',
    'Cavalona',
    'Magra',
    'Gostosa',
    'Novinha',
    'Coroa',
    'Rapidinha',
    'Pernoite',
    'Acompanhante Social',
    'Eventos',
    'Viagens',
    'Massagem',
    'Oral',
    'Anal',
    'Beijo na Boca',
    'Sem Frescura'
  ];

  // Lista de cidades disponíveis (região metropolitana de Recife como exemplo)
  const availableCities = [
    'Recife',
    'Olinda',
    'Jaboatão dos Guararapes',
    'Paulista',
    'Caruaru',
    'Petrolina',
    'Cabo de Santo Agostinho',
    'Camaragibe',
    'Garanhuns',
    'Vitória de Santo Antão',
    'Igarassu',
    'Abreu e Lima',
    'São Lourenço da Mata',
    'Araripina',
    'Ipojuca'
  ];

  const totalSteps = 6;

  const stepTitles = [
    'Informações Pessoais',
    'Valores e Atendimento',
    'Especialidades',
    'Sobre Você',
    'Galeria e Mídia',
    'Apresentação em Áudio'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Validar email em tempo real
    if (name === 'email' && value.includes('@')) {
      validateEmailInRealTime(value);
    }
  };

  // Função para validar email em tempo real
  const validateEmailInRealTime = async (email: string) => {
    setEmailValidation({
      isValid: true,
      message: '',
      isChecking: false
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({
        isValid: false,
        message: 'Formato de email inválido',
        isChecking: false
      });
      return;
    }

    if (!email.trim()) return;

    setEmailValidation(prev => ({
      ...prev,
      isChecking: true
    }));

    try {
      // Aqui você faria a verificação no banco de dados
      // Por simplicidade, simulamos uma verificação
      await new Promise(resolve => setTimeout(resolve, 500));

      setEmailValidation({
        isValid: true,
        message: 'Email disponível',
        isChecking: false
      });

    } catch (error) {
      console.error('Erro ao validar email:', error);
      setEmailValidation({
        isValid: false,
        message: 'Erro ao verificar email',
        isChecking: false
      });
    }
  };

  const toggleService = (service: string) => {
    setFormData(prev => {
      if (prev.services.includes(service)) {
        return {
          ...prev,
          services: prev.services.filter(s => s !== service)
        };
      } else {
        return {
          ...prev,
          services: [...prev.services, service]
        };
      }
    });
  };

  const toggleCity = (city: string) => {
    setFormData(prev => {
      if (prev.cities_served.includes(city)) {
        return {
          ...prev,
          cities_served: prev.cities_served.filter(c => c !== city)
        };
      } else {
        return {
          ...prev,
          cities_served: [...prev.cities_served, city]
        };
      }
    });
  };

  // Funções de gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Timer para gravação
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      recorder.onstop = () => {
        clearInterval(timer);
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      setError('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
  };

  // Função para lidar com upload de imagens
  const handleImagesUploaded = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: urls
    }));
  };

  // Função para lidar com upload de mídia
  const handleMediaUploaded = (media: MediaFile[]) => {
    setFormData(prev => ({
      ...prev,
      media: media,
      images: media.filter(m => m.type === 'image').map(m => m.url),
      videos: media.filter(m => m.type === 'video').map(m => m.url)
    }));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Informações Pessoais
        return !!(
          formData.real_name &&
          formData.display_name &&
          formData.email &&
          formData.phone &&
          formData.age &&
          formData.location &&
          emailValidation.isValid
        );

      case 2: // Valores e Atendimento
        return !!(
          formData.price_per_hour &&
          formData.cities_served.length > 0
        );

      case 3: // Especialidades
        return formData.services.length > 0;

      case 4: // Sobre Você
        return formData.description.length >= 50;

      case 5: // Galeria e Mídia
        return formData.media.length > 0;

      case 6: // Apresentação em Áudio
        return true; // Opcional

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!validateCurrentStep()) {
      setError('Por favor, preencha todos os campos obrigatórios desta etapa.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validações finais
      if (!formData.terms_accepted) {
        throw new Error('Você deve aceitar os termos de uso.');
      }

      // Preparar dados para envio
      const cadastroData = {
        real_name: formData.real_name,
        display_name: formData.display_name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        location: formData.location,
        height: formData.height || undefined,
        price_per_hour: parseFloat(formData.price_per_hour),
        period_type: formData.period_type,
        cities_served: formData.cities_served,
        images: formData.images,
        videos: formData.videos,
        audio_presentation: formData.audio_presentation,
        services: formData.services,
        description: formData.description
      };

      // Enviar para o Supabase
      await cadastrosService.create(cadastroData);

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Erro ao enviar cadastro:', err);
      setError(err.message || 'Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-50 border border-green-200 p-8 rounded-xl">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
                Cadastro Enviado!
              </h2>
              <p className="text-gray-600 mb-6">
                Seu cadastro foi enviado com sucesso e está sendo analisado pela nossa equipe.
                Entraremos em contato em breve.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 hover:from-velvet-pink-800 hover:to-velvet-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Voltar ao Site
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Informações Pessoais
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-semibold text-gray-800">
                Informações Pessoais
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Dados básicos para seu perfil profissional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Real * <span className="text-xs text-gray-500">(privado)</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    name="real_name"
                    value={formData.real_name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none pl-10"
                    placeholder="Seu nome verdadeiro"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome para Exibição *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none pl-10"
                    placeholder="Como quer aparecer no site"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full bg-white border rounded-lg px-4 py-2 text-gray-800 focus:outline-none pl-10 ${
                      emailValidation.isChecking
                        ? 'border-yellow-400 focus:border-yellow-500'
                        : emailValidation.isValid && formData.email
                          ? 'border-green-400 focus:border-green-500'
                          : formData.email && !emailValidation.isValid
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-gray-300 focus:border-velvet-pink-600'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {emailValidation.isChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                    </div>
                  )}
                  {!emailValidation.isChecking && emailValidation.message && formData.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailValidation.isValid ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Check className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {emailValidation.message && formData.email && (
                  <p className={`mt-1 text-sm ${
                    emailValidation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {emailValidation.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone/WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none pl-10"
                    placeholder="(81) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idade *
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="number"
                    name="age"
                    min="18"
                    max="60"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none pl-10"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização *
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none pl-10"
                    placeholder="Recife - PE"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none"
                  placeholder="1.70m"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Valores e Atendimento
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-semibold text-gray-800">
                Valores e Atendimento
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Defina seus valores e onde você atende
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="number"
                      name="price_per_hour"
                      value={formData.price_per_hour}
                      onChange={handleInputChange}
                      required
                      min="50"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none pl-10"
                      placeholder="150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período *
                  </label>
                  <select
                    name="period_type"
                    value={formData.period_type}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none"
                  >
                    <option value="hour">Por hora</option>
                    <option value="30min">Por 30 minutos</option>
                    <option value="night">Pernoite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidades que Atende * <span className="text-xs text-gray-500">(selecione pelo menos uma)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        formData.cities_served.includes(city)
                          ? 'bg-velvet-pink-600 text-white'
                          : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                {formData.cities_served.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selecionadas: {formData.cities_served.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Especialidades
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-semibold text-gray-800">
                Especialidades/Serviços
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Selecione suas especialidades e serviços oferecidos
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableServices.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    formData.services.includes(service)
                      ? 'bg-velvet-pink-600 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>

            {formData.services.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Selecionadas: {formData.services.length} especialidades
              </p>
            )}
          </div>
        );

      case 4: // Sobre Você
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-semibold text-gray-800">
                Sobre Você
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Conte um pouco sobre você e seus diferenciais
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição Pessoal *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:border-velvet-pink-600 focus:outline-none resize-none"
                placeholder="Descreva seu perfil profissional, especialidades, diferenciais e o que você oferece de especial aos seus clientes..."
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mínimo 50 caracteres. Seja profissional e destacue seus pontos fortes.</span>
                <span className={formData.description.length >= 50 ? 'text-green-600' : 'text-gray-500'}>
                  {formData.description.length}/50
                </span>
              </div>
            </div>
          </div>
        );

      case 5: // Galeria e Mídia
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-semibold text-gray-800">
                Galeria e Mídia
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Adicione fotos e vídeos para seu perfil
              </p>
            </div>

            <MediaUpload
              onMediaUploaded={handleMediaUploaded}
              maxItems={8}
              existingMedia={formData.media}
            />

            <p className="text-xs text-gray-500">
              * A primeira imagem será usada como foto principal do perfil
            </p>
          </div>
        );

      case 6: // Apresentação em Áudio
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-semibold text-gray-800">
                Apresentação em Áudio
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Grave uma apresentação de até 2 minutos (opcional)
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
              {!audioUrl ? (
                <div className="text-center">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <Mic className="w-5 h-5" />
                      <span>Iniciar Gravação</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-red-600">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Gravando... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                      </div>

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        <Square className="w-5 h-5" />
                        <span>Parar Gravação</span>
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-4">
                    Apresente-se de forma profissional e carismática. Fale sobre seus diferenciais e o que oferece.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-700">Sua Apresentação</span>
                      <span className="text-sm text-gray-500">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/wav" />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={deleteRecording}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Excluir Gravação
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        deleteRecording();
                        setTimeout(() => startRecording(), 100);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Gravar Novamente
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              Esta etapa é opcional, mas uma apresentação pessoal pode ajudar muito no seu perfil!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-lg">
            {/* Botão Voltar */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center text-black hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">Voltar</span>
              </button>
            </div>

            {/* Progress Wizard */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                {Array.from({ length: totalSteps }, (_, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;

                  return (
                    <React.Fragment key={stepNumber}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                              ? 'bg-velvet-pink-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                      </div>
                      {stepNumber < totalSteps && (
                        <div className={`w-12 h-0.5 mx-1 ${
                          stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <p className="text-center text-sm text-gray-600 mt-3">
                Etapa {currentStep} de {totalSteps}: {stepTitles[currentStep - 1]}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}

              {/* Terms of Use - apenas na última etapa */}
              {currentStep === totalSteps && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-velvet-pink-600 bg-white border-gray-300 rounded focus:ring-velvet-pink-500 mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      Declaro que sou maior de idade, que todas as informações fornecidas são verdadeiras
                      e que concordo com os termos de uso da plataforma.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`w-full md:w-auto px-6 py-2 border rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    currentStep === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex space-x-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full md:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full md:w-auto bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white px-6 py-2 rounded-lg hover:from-velvet-pink-800 hover:to-velvet-pink-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Próximo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || !validateCurrentStep()}
                      className="w-full md:w-auto bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white px-6 py-2 rounded-lg hover:from-velvet-pink-800 hover:to-velvet-pink-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Enviar Cadastro</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ModelRegister;