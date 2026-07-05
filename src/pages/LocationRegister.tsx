import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { recifeNeighborhoods, recifeNeighborhoodsByRegion } from '../lib/recife-neighborhoods';

export default function LocationRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: 'Recife',
    neighborhood: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSuccess, setLocationSuccess] = useState('');

  // Filtrar bairros por região baseado na busca
  const filteredRegions = recifeNeighborhoodsByRegion
    .map(region => ({
      ...region,
      neighborhoods: region.neighborhoods.filter(nb =>
        nb.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(region => region.neighborhoods.length > 0);

  const handleNeighborhoodSelect = (neighborhood: string) => {
    setFormData(prev => ({ ...prev, neighborhood }));
    setSearchTerm('');
    setLocationSuccess(''); // Limpar mensagem de sucesso ao selecionar
  };

  const handleUseMyLocation = () => {
    setError('');
    setLocationSuccess('');
    setIsDetectingLocation(true);

    if (!navigator.geolocation) {
      setError('Seu navegador não suporta geolocalização');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Validar se está dentro da RMR (~60km de Recife)
        const recifeCenter = { lat: -8.0476, lng: -34.8770 };
        const distance = Math.sqrt(
          Math.pow(latitude - recifeCenter.lat, 2) +
          Math.pow(longitude - recifeCenter.lng, 2)
        );

        if (distance > 0.8) {
          setError('Você não está na Região Metropolitana do Recife. Atualmente cadastramos apenas acompanhantes da RMR.');
          setIsDetectingLocation(false);
          return;
        }

        try {
          // Reverse geocoding via Nominatim (OpenStreetMap) — gratuito, sem chave
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=pt-BR`,
            { headers: { 'User-Agent': 'PinkHouse/1.0' } }
          );
          const data = await res.json();

          const addr = data.address || {};
          // Nominatim retorna o bairro em suburb, quarter, neighbourhood ou city_district
          const rawNeighborhood =
            addr.suburb || addr.quarter || addr.neighbourhood || addr.city_district || '';

          if (!rawNeighborhood) {
            setLocationSuccess('✓ Localização detectada em Recife! Selecione seu bairro abaixo.');
            setIsDetectingLocation(false);
            return;
          }

          // Tentar encontrar correspondência na lista de bairros
          const normalized = rawNeighborhood.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const match = recifeNeighborhoods.find(nb => {
            const nbNorm = nb.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return nbNorm === normalized || nbNorm.includes(normalized) || normalized.includes(nbNorm);
          });

          if (match) {
            setFormData(prev => ({ ...prev, neighborhood: match }));
            setLocationSuccess(`✓ Bairro detectado: ${match}`);
          } else {
            // Usar o nome retornado pela API diretamente no campo
            setFormData(prev => ({ ...prev, neighborhood: rawNeighborhood }));
            setLocationSuccess(`✓ Bairro detectado: ${rawNeighborhood}`);
          }
        } catch {
          setLocationSuccess('✓ Localização detectada em Recife! Selecione seu bairro abaixo.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.error('Erro ao detectar localização:', err);
        setError('Não foi possível detectar sua localização. Por favor, selecione manualmente.');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!formData.neighborhood.trim()) {
      setError('Selecione um bairro');
      return;
    }

    setIsLoading(true);

    try {
      // Pegar dados do localStorage (fonte primária durante o cadastro)
      const tempAuthData = localStorage.getItem('tempAuthData');
      console.log('🔍 tempAuthData do localStorage:', tempAuthData);

      if (!tempAuthData) {
        console.error('❌ tempAuthData não encontrado no localStorage');
        console.log('📦 localStorage completo:', { ...localStorage });
        throw new Error('Erro no fluxo de cadastro. Por favor, comece o cadastro novamente.');
      }

      const authData = JSON.parse(tempAuthData);
      console.log('✅ authData parseado:', authData);

      // Verificar se tem todos os campos necessários
      if (!authData.artisticName || !authData.email || !authData.phone || !authData.age || !authData.userId) {
        console.error('❌ Dados incompletos:', authData);
        throw new Error('Dados de cadastro incompletos. Por favor, comece o cadastro novamente.');
      }

      // Sessão é opcional aqui: se "Confirm email" estiver ativo no Supabase,
      // a usuária ainda não tem sessão (precisa clicar no link do email).
      // Continuamos com o userId do tempAuthData — a RLS das tabelas relevantes
      // deve permitir o insert/update durante o cadastro.
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Sessão do Supabase (opcional):', session);

      // Se tiver uma sessão de OUTRO usuário (ex: cliente logado antes), limpar
      // para evitar confusão de identidades. NÃO bloqueia o cadastro —
      // tempAuthData é a fonte de verdade durante o wizard de cadastro.
      if (session && session.user.id !== authData.userId) {
        console.warn('⚠️ Sessão ativa pertence a outro userId. Deslogando para usar tempAuthData.');
        try {
          await supabase.auth.signOut();
        } catch (signOutErr) {
          console.warn('Falha ao fazer signOut da sessão antiga:', signOutErr);
        }
      }

      // Email NÃO é verificado no momento do cadastro — a verificação ocorre
      // apenas quando a acompanhante clica no link de magic link enviado
      // explicitamente (handleEmailVerificationCallback em verificationService.ts).
      // Não usar email_confirmed_at: com mailer_autoconfirm ativo, esse campo
      // é auto-setado no signup para todos os usuários, não representa verificação real.
      const isEmailVerified = false;
      const initialReliabilityScore = 0;

      // Verificar se já existe um perfil com este auth_user_id ou email
      const { data: existingRows, error: existingError } = await supabase
        .from('acompanhantes')
        .select('id')
        .or(`auth_user_id.eq.${authData.userId},email.eq.${authData.email}`)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingError) {
        throw new Error(`Erro ao buscar perfil existente: ${existingError.message}`);
      }

      const existing = existingRows?.[0] || null;

      let companionData: { id: string } | null = null;

      if (existing) {
        // Perfil já existe — apenas atualizar localização e garantir auth_user_id.
        // Não usamos .select().single() porque o RETURNING pode ser bloqueado por
        // RLS mesmo quando o UPDATE é bem-sucedido. Como já temos existing.id,
        // basta checar o error.
        const { error: updateError } = await supabase
          .from('acompanhantes')
          .update({
            auth_user_id: authData.userId,
            location: `Recife - ${formData.neighborhood}`,
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
        }
        companionData = { id: existing.id };
      } else {
        // Criar perfil completo na tabela acompanhantes
        const { data: inserted, error: companionError } = await supabase
          .from('acompanhantes')
          .insert({
            auth_user_id: authData.userId,
            name: authData.artisticName,
            email: authData.email,
            phone: authData.phone,
            age: parseInt(authData.age),
            gender: authData.gender || null,
            location: `Recife - ${formData.neighborhood}`,
            image: '/default-profile.png',
            description: `Olá! Sou ${authData.artisticName}, uma acompanhante de Recife. Entre em contato para mais informações.`,
            display_name: authData.artisticName,
            cities_served: ['Recife'],
            tags: [],
            services: [],
            gallery: [],
            videos: [],
            is_active: true,
            is_verified: true,
            is_available: true,
            is_featured: false,
            rating: 0.0,
            hasownlocation: false,
            acceptsclientlocation: true,
            acceptsmotel: true
          })
          .select()
          .single();

        if (companionError) {
          console.error('Erro ao criar perfil:', companionError);
          if (companionError.message?.includes('row-level security')) {
            throw new Error(
              'Erro de permissão ao criar perfil. Por favor, execute o SQL de correção de políticas no Supabase (arquivo: sql/CORRIGIR_POLICY_INSERT_CADASTRO.sql).'
            );
          }
          throw new Error(`Erro ao criar perfil: ${companionError.message}`);
        }
        companionData = inserted;
      }

      // Resetar/criar registro de verificação com tudo falso (novo cadastro)
      const { data: existingVerificationRows, error: existingVerificationError } = await supabase
        .from('companion_verifications')
        .select('id')
        .eq('companion_id', companionData.id)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingVerificationError) {
        throw new Error(`Erro ao buscar registro de verificacao: ${existingVerificationError.message}`);
      }

      const existingVerification = existingVerificationRows?.[0] || null;

      if (existingVerification) {
        await supabase
          .from('companion_verifications')
          .update({
            email_verified: isEmailVerified,
            email_verified_at: emailVerifiedAt,
            profile_completed: false,
            profile_completed_at: null,
            phone_verified: false,
            phone_verified_at: null,
            phone_number: null,
            document_verified: false,
            document_verified_at: null,
            document_status: null,
            document_type: null,
            document_front_url: null,
            document_back_url: null,
            photo_verified: false,
            photo_verified_at: null,
            photo_status: null,
            verification_photos: null,
            video_verified: false,
            video_verified_at: null,
            video_status: null,
            verification_video_url: null,
            reliability_score: initialReliabilityScore,
            updated_at: new Date().toISOString(),
          })
          .eq('companion_id', companionData.id);
      } else {
        await supabase
          .from('companion_verifications')
          .insert({
            companion_id: companionData.id,
            email_verified: isEmailVerified,
            email_verified_at: emailVerifiedAt,
            profile_completed: false,
            phone_verified: false,
            document_verified: false,
            photo_verified: false,
            video_verified: false,
            reliability_score: initialReliabilityScore,
          });
      }

      // Salvar no localStorage que o usuário está logado
      localStorage.setItem('user', JSON.stringify({
        id: authData.userId,
        email: authData.email,
        name: authData.artisticName,
        location: `Recife - ${formData.neighborhood}`,
        type: 'companion',
        isLoggedIn: true,
        companionId: companionData.id
      }));

      // Limpar dados temporários
      localStorage.removeItem('tempAuthData');

      // Navegar para o upload de foto (próxima etapa do cadastro)
      navigate(`/photo-upload?companionId=${companionData.id}`);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen bg-white flex flex-col font-sans max-w-md mx-auto overflow-hidden lg:max-w-4xl">
      {/* Header */}
      <header className="flex items-center p-4 sticky top-0 bg-white z-10">
        <button
          className="p-2 -ml-2 text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2" style={{ }}>
          Onde você está localizada
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-56 overflow-y-auto lg:px-10 lg:pb-10">
        {/* Cidade (Fixa - Apenas exibição) */}
        <div className="mb-6 lg:max-w-2xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cidade
          </label>
          <div className="flex items-center gap-2 px-4 py-3.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-600">
            <MapPin className="w-5 h-5 text-pink-500" />
            <span className="font-medium">Recife RMR - PE</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Atualmente cadastramos acompanhantes da Região Metropolitana do Recife
          </p>
        </div>

        {/* Botão Usar Minha Localização */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isDetectingLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border-2 border-pink-500 text-pink-500 rounded-xl font-semibold hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetectingLocation ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Detectando localização...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Usar minha localização
              </>
            )}
          </button>
        </div>

        {/* Mensagem de sucesso da localização */}
        {locationSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-green-700 text-sm font-medium">{locationSuccess}</p>
          </div>
        )}

        {/* Bairro */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bairro *
          </label>

          {/* Bairro Selecionado */}
          {formData.neighborhood ? (
            <div className="mb-3 px-4 py-3.5 bg-pink-50 border-2 border-pink-500 rounded-xl flex items-center justify-between">
              <span className="text-gray-900 font-medium">{formData.neighborhood}</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, neighborhood: '' }))}
                className="text-pink-500 hover:text-pink-600 text-sm font-semibold"
              >
                Alterar
              </button>
            </div>
          ) : (
            <>
              {/* Campo de Busca */}
              <input
                type="text"
                placeholder="Digite para buscar um bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:border-pink-500 focus:outline-none transition-colors mb-2"
              />

              {/* Lista de Bairros por Região */}
              <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-xl bg-white lg:max-h-[56vh]">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => (
                    <div key={region.region}>
                      {/* Header da Região */}
                      <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {region.region}
                        </span>
                      </div>
                      {/* Bairros da Região */}
                      {region.neighborhoods.map((neighborhood) => (
                        <button
                          key={neighborhood}
                          type="button"
                          onClick={() => handleNeighborhoodSelect(neighborhood)}
                          className="w-full text-left px-4 py-3 hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-800">{neighborhood}</span>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Nenhum bairro encontrado
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </main>

      {/* Footer Area (Sticky Bottom) */}
      <footer className="fixed bottom-24 left-0 right-0 bg-white px-6 pt-4 pb-8 border-t border-transparent max-w-md mx-auto w-full lg:static lg:bottom-auto lg:max-w-none lg:border-t lg:border-gray-100 lg:px-10 lg:pb-10">
        {/* Privacy Text */}
        <p className="text-xs text-gray-500 leading-tight mb-6 text-justify">
          Privacidade: Suas informações de localização são usadas apenas para conectar você com clientes da sua região. Você pode ajustar a precisão das informações exibidas no seu perfil.
        </p>

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !formData.neighborhood}
          className={`w-full bg-[#ff4081] text-white font-bold py-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors active:scale-[0.98] ${
            isLoading || !formData.neighborhood ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              Criando conta...
            </div>
          ) : (
            'Continuar'
          )}
        </button>
      </footer>
    </div>
  );
}
