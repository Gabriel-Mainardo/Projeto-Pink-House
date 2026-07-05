import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Clock } from 'lucide-react';
import Footer from '../components/Footer';
import { supabase, cadastrosService } from '../lib/supabase';
import { registrationService } from '../services/registrationService';

const RegisterSuccess = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Salvar dados na tabela cadastros_pendentes para aprovação admin
  useEffect(() => {
    const saveToSupabase = async () => {
      try {
        const registrationData = registrationService.getData();

        const artisticName = registrationData.artisticName || registrationData.professionalName || '';
        const email = registrationData.email || '';
        const city = registrationData.city || '';
        const age = registrationData.age || '18';

        if (!artisticName || !email) {
          throw new Error('Nome e email são obrigatórios');
        }

        const { data: { session } } = await supabase.auth.getSession();
        const authUserId = session?.user?.id || '';

        // Salvar na tabela cadastros_pendentes (requer aprovação admin)
        const cadastroData: any = {
          name: artisticName,
          display_name: artisticName,
          real_name: registrationData.realName || null,
          email: email,
          phone: registrationData.phoneNumber || registrationData.phone || 'Não informado',
          age: parseInt(age),
          location: `${city} - ${registrationData.neighborhood || ''}`.trim(),
          // Nunca salvar blob URL (URL.createObjectURL) — elas morrem ao recarregar a página.
          // A foto de perfil real é definida depois em PhotoUpload (upload ao Supabase Storage).
          image:
            registrationData.profilePhoto && !registrationData.profilePhoto.startsWith('blob:')
              ? registrationData.profilePhoto
              : '/default-profile.png',
          description: registrationData.description || `Olá! Sou ${artisticName}, uma acompanhante de ${city}. Entre em contato para mais informações.`,
          height: registrationData.height || null,
          gallery: registrationData.photos || [],
          videos: registrationData.videos || [],
          audio_url: registrationData.audioUrl || null,
          video_url: registrationData.videos?.[0] || null,
          priceperhour: registrationData.values?.oneHour || registrationData.oneHour || null,
          services: registrationData.specialties || [],
          cities_served: city ? [city] : [],
          hasownlocation: registrationData.hasOwnPlace || false,
          acceptsclientlocation: registrationData.acceptsClientPlace !== false,
          acceptsmotel: registrationData.acceptsMotel !== false,
          ...(authUserId && { auth_user_id: authUserId }),
        };

        const { data, error } = await supabase
          .from('cadastros_pendentes')
          .insert([{ ...cadastroData, submitted_at: new Date().toISOString() }])
          .select();

        if (error) {
          console.error('Erro ao salvar cadastro pendente:', error);
          throw error;
        }

        // Login automático com status pendente
        localStorage.setItem('user', JSON.stringify({
          id: authUserId,
          email: email,
          name: artisticName,
          isLoggedIn: true,
          type: 'companion',
          isPending: true,
        }));

        registrationService.clearData();
        setIsSaving(false);

      } catch (error: any) {
        console.error('Erro ao processar cadastro:', error);
        setSaveError(error.message || 'Erro ao salvar cadastro. Por favor, tente novamente.');
        setIsSaving(false);
      }
    };

    saveToSupabase();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black">
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-velvet-pink-800 to-velvet-pink-600 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-velvet-white">
            {isSaving ? 'Salvando...' : 'Cadastro'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-velvet-pink-500 to-velvet-pink-600">{isSaving ? '' : 'Enviado!'}</span>
          </h1>

          {saveError && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-300">{saveError}</p>
            </div>
          )}

          <div className="card-velvet p-8 rounded-xl space-y-6">
            {isSaving ? (
              <>
                <div className="flex justify-center">
                  <div className="w-12 h-12 border-4 border-velvet-pink-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-xl text-velvet-white/90 font-light">
                  Estamos salvando suas informações...
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <p className="text-xl text-velvet-white/90 font-light">
                  Seu cadastro foi enviado para análise!
                </p>

                <p className="text-velvet-white/70">
                  Nossa equipe irá revisar seu perfil em até 24 horas. Você receberá uma notificação quando for aprovado.
                </p>
              </>
            )}

            <div className="border-t border-velvet-pink-700/20 pt-6">
              <div className="space-y-4">
                <div className="bg-velvet-pink-900/20 border border-velvet-pink-700/30 rounded-lg p-4 text-left">
                  <h3 className="text-lg font-semibold text-velvet-white mb-2">
                    O que acontece agora:
                  </h3>
                  <ul className="space-y-2 text-velvet-white/80 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-yellow-400 text-xs">1</span>
                      </span>
                      <span>Nosso time revisa seu perfil para garantir qualidade e segurança</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-yellow-400 text-xs">2</span>
                      </span>
                      <span>Após aprovação, seu perfil ficará visível no catálogo</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-yellow-400 text-xs">3</span>
                      </span>
                      <span>Você poderá completar seu perfil e começar a receber contatos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {!isSaving && (
              <div className="flex justify-center">
                <Link
                  to="/"
                  className="btn-velvet px-8 py-3 flex items-center space-x-2"
                >
                  <span>Voltar para o início</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterSuccess; 