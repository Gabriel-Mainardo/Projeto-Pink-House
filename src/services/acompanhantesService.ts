import { supabase } from '../lib/supabase';

export interface Acompanhante {
  id: string;
  name: string;
  real_name?: string;
  display_name?: string;
  email: string;
  phone: string;
  age: number;
  location: string;
  height?: string;
  image: string;
  gallery?: string[];
  videos?: string[];
  videoThumbnails?: string[];
  audioUrl?: string;
  adVideo?: string | null;
  rating: number;
  tags: string[];
  isFeatured?: boolean;
  measurements?: string;
  description?: string;
  pricePerHour?: string;
  hasOwnLocation?: boolean;
  acceptsClientLocation?: boolean;
  acceptsMotel?: boolean;
  citiesServed?: string[];
  is_verified?: boolean;
  is_available?: boolean;
  is_featured?: boolean;
  cities_served?: string[];
  serves_whom?: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
  // Campos de Boost/Subida
  hasBoost?: boolean;
  boostPriority?: number;
  boostBadge?: string;
  boostColor?: string;
  boostExpiresAt?: string;
  boostHoursRemaining?: number;
  boostAmountPaid?: number;
  boostStartedAt?: string;
}

// Função para converter URLs de vídeo para o bucket correto
const convertVideoUrl = (url: string): string => {
  if (!url) return '';
  
  // Lista de extensões de vídeo suportadas
  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.quicktime'];
  const isVideo = videoExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // Se já está no bucket correto, retornar a URL como está
  if (url.includes('/storage/v1/object/public/videos/')) {
    return url;
  }
  
  // Se for vídeo ou estiver no bucket de vídeos, converter para o bucket correto
  if (isVideo || url.includes('/videos/')) {
    // Remover qualquer referência ao bucket de imagens primeiro
    let newUrl = url.replace('/storage/v1/object/public/images/', '/storage/v1/object/public/videos/');
    
    // Se ainda não tem referência ao bucket de vídeos, adicionar
    if (!newUrl.includes('/storage/v1/object/public/videos/')) {
      newUrl = newUrl.replace('/storage/v1/object/public/', '/storage/v1/object/public/videos/');
    }
    
    // Log para debug
    console.log('🎥 acompanhantesService - Convertendo URL de vídeo:', {
      original: url,
      convertida: newUrl
    });
    
    return newUrl;
  }
  
  return url;
};

// Função para converter dados do banco para o frontend
const convertFromDB = (data: any): Acompanhante => {
  console.log('🔄 acompanhantesService - Convertendo dados:', {
    id: data.id,
    name: data.name,
    location: data.location,
    cities_served: data.cities_served,
    citiesServed: data.cities_served
  });
  
  return {
    ...data,
    // Campos de nome
    name: data.display_name || data.name,
    real_name: data.real_name,
    display_name: data.display_name,
    // Campos de preço e atendimento em camelCase
    pricePerHour: data.priceperhour,
    hasOwnLocation: data.hasownlocation,
    acceptsClientLocation: data.acceptsclientlocation,
    acceptsMotel: data.acceptsmotel,
    // Vídeo do anúncio
    adVideo: data.ad_video || null,
    // Converter URLs de vídeo para o bucket correto
    videos: data.videos ? data.videos.map(convertVideoUrl) : [],
    // Garantir que gallery seja um array
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    // Garantir que citiesServed seja um array
    citiesServed: Array.isArray(data.cities_served) ? data.cities_served : []
  };
};

// Função para converter dados do frontend para o banco
const convertToDB = (data: Partial<Acompanhante>): any => {
  const {
    name,
    real_name,
    display_name,
    pricePerHour,
    hasOwnLocation,
    acceptsClientLocation,
    acceptsMotel,
    videos,
    ...rest
  } = data;

  return {
    ...rest,
    // Campos de nome
    name: display_name || name,
    real_name,
    display_name,
    // Campos de preço e atendimento em snake_case
    priceperhour: pricePerHour,
    hasownlocation: hasOwnLocation,
    acceptsclientlocation: acceptsClientLocation,
    acceptsmotel: acceptsMotel,
    // Garantir que videos seja um array válido
    videos: videos && Array.isArray(videos) ? videos.filter(url => url && url.trim() !== '') : []
  };
};

// Client-side fallback: cleanup expired boosts that cron may have missed
const cleanupExpiredBoosts = async () => {
  try {
    const lastCleanup = sessionStorage.getItem('boost_cleanup_ts');
    const now = Date.now();
    // Run max once per 10 minutes per session
    if (lastCleanup && now - parseInt(lastCleanup) < 600000) return;

    const { data: expired } = await supabase
      .from('active_boosts')
      .select('id')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());

    if (expired && expired.length > 0) {
      console.log(`🔧 Limpando ${expired.length} boost(s) expirado(s)...`);
      await supabase
        .from('active_boosts')
        .update({ is_active: false })
        .in('id', expired.map(e => e.id));
    }

    sessionStorage.setItem('boost_cleanup_ts', String(now));
  } catch (err) {
    // Silent fail - cleanup is best-effort
    console.warn('Boost cleanup falhou:', err);
  }
};

export const acompanhantesService = {
  // Buscar todas as acompanhantes COM ORDENAÇÃO POR BOOST
  async getAll(): Promise<Acompanhante[]> {
    try {
      // Client-side expiration cleanup (fallback if cron is not running)
      cleanupExpiredBoosts();

      const [companionsRes, boostsRes] = await Promise.all([
        supabase
          .from('acompanhantes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('active_boosts')
          .select('companion_id, expires_at, is_active, payment_status, plan_id, started_at, amount_paid, boost_plans(name, position_priority, badge_text, highlight_color, price)')
          .eq('is_active', true)
          .eq('payment_status', 'approved')
          .gt('expires_at', new Date().toISOString())
      ]);

      if (companionsRes.error) throw companionsRes.error;

      const companions = companionsRes.data.map(convertFromDB);

      // Mapear boosts ativos por companion_id
      const boostMap = new Map<string, any>();
      if (!boostsRes.error && boostsRes.data) {
        for (const boost of boostsRes.data) {
          const existing = boostMap.get(boost.companion_id);
          const currentAmount = Number(boost.amount_paid ?? (boost.boost_plans as any)?.price ?? 0);
          const existingAmount = Number(existing?.amount_paid ?? (existing?.boost_plans as any)?.price ?? 0);
          const currentStartedAt = new Date(boost.started_at || 0).getTime();
          const existingStartedAt = new Date(existing?.started_at || 0).getTime();

          // Manter o boost mais valioso; em empate, o mais recente
          if (
            !existing ||
            currentAmount > existingAmount ||
            (currentAmount === existingAmount && currentStartedAt > existingStartedAt)
          ) {
            boostMap.set(boost.companion_id, boost);
          }
        }
      }

      // Mesclar dados de boost nas acompanhantes
      for (const companion of companions) {
        const boost = boostMap.get(companion.id);
        if (boost) {
          const plan = boost.boost_plans as any;
          const expiresAt = new Date(boost.expires_at);
          const hoursRemaining = Math.max(0, (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
          const amountPaid = Number(boost.amount_paid ?? plan?.price ?? 0);

          companion.hasBoost = true;
          companion.boostPriority = plan?.position_priority || 1;
          companion.boostBadge = plan?.badge_text || plan?.name || 'Destaque';
          companion.boostColor = plan?.highlight_color || '#d91d83';
          companion.boostExpiresAt = boost.expires_at;
          companion.boostHoursRemaining = hoursRemaining;
          companion.boostAmountPaid = amountPaid;
          companion.boostStartedAt = boost.started_at;
        }
      }

      // Ordenar: com boost primeiro; mais recente primeiro; em empate, quem pagou mais
      companions.sort((a, b) => {
        if (a.hasBoost && !b.hasBoost) return -1;
        if (!a.hasBoost && b.hasBoost) return 1;
        if (a.hasBoost && b.hasBoost) {
          const startedAtDiff =
            new Date(b.boostStartedAt || 0).getTime() - new Date(a.boostStartedAt || 0).getTime();
          if (startedAtDiff !== 0) return startedAtDiff;

          const amountDiff = (b.boostAmountPaid || 0) - (a.boostAmountPaid || 0);
          if (amountDiff !== 0) return amountDiff;

          return (b.boostPriority || 0) - (a.boostPriority || 0);
        }

        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      return companions;
    } catch (err) {
      console.error('Erro fatal ao buscar acompanhantes:', err);
      throw err;
    }
  },

  // Buscar acompanhante por ID
  async getById(id: string): Promise<Acompanhante> {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Acompanhante não encontrada.');
    return convertFromDB(data);
  },

  // Buscar acompanhantes em destaque
  async getFeatured(): Promise<Acompanhante[]> {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(convertFromDB);
  },

  // Buscar acompanhantes por localização
  async getByLocation(location: string): Promise<Acompanhante[]> {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
      .ilike('location', `%${location}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(convertFromDB);
  },

  // Buscar todas as acompanhantes para o admin (incluindo não verificadas)
  async getAllForAdmin(): Promise<Acompanhante[]> {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(convertFromDB);
  },

  // Atualizar acompanhante
  async update(id: string, updates: Partial<Acompanhante>): Promise<Acompanhante> {
    const dbUpdates = convertToDB(updates);

    const { data, error } = await supabase
      .from('acompanhantes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // RLS pode bloquear o RETURNING mesmo com UPDATE bem-sucedido (0 rows retornadas).
    // Nesse caso, refaz o SELECT para retornar o estado atual do registro.
    if (!data) {
      const { data: refetched, error: fetchError } = await supabase
        .from('acompanhantes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!refetched) throw new Error('Registro não encontrado após atualização.');
      return convertFromDB(refetched);
    }

    return convertFromDB(data);
  },

  // Deletar acompanhante
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('acompanhantes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Buscar acompanhantes por termo (busca no banco de dados)
  async search(term: string): Promise<Acompanhante[]> {
    try {
      const searchTerm = `%${term}%`;

      const { data, error } = await supabase
        .from('acompanhantes')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.${searchTerm},location.ilike.${searchTerm},description.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (err) {
      console.error('Erro ao buscar acompanhantes:', err);
      throw err;
    }
  }
}; 
