import { supabase } from '../lib/supabase';
import { metropolitanCities } from '../lib/recife-metropolitan-area';

export interface StoryRequest {
  id: string;
  name: string;
  phone?: string;
  plan_name: string;
  plan_price: number;
  plan_duration: string;
  plan_features: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveStory {
  id: string;
  request_id: string;
  companion_id: string;
  plan_name: string;
  plan_price: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface CreatedStory {
  id: string;
  companion_id: string;
  companion_name?: string;
  companion_image?: string;
  requester_name?: string; // Nome da pessoa que está criando o story
  requester_whatsapp?: string; // WhatsApp da pessoa que está criando o story
  type: 'photo' | 'video' | 'audio' | 'text';
  url: string;
  thumbnail?: string;
  duration?: number; // duração em segundos para vídeo/áudio
  file_size?: number; // tamanho do arquivo em bytes
  mime_type?: string; // tipo MIME do arquivo
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  story_link_url?: string;
  story_link_text?: string;
  link_type?: 'whatsapp' | 'custom';
  likes?: number;
  plan_type?: 'destaque' | 'premium' | 'basic';
  plan_name?: string;
  plan_price?: number;
  companion_city?: string;
}

type CreatedStoryInsert = {
  companion_id: string;
  requester_name?: string;
  requester_whatsapp?: string;
  type: 'photo' | 'video' | 'audio' | 'text';
  url: string;
  thumbnail?: string | null;
  duration?: number;
  file_size?: number;
  mime_type?: string;
  plan_type?: 'destaque' | 'premium' | 'basic';
  plan_name?: string;
  plan_price?: number;
  story_link_url?: string;
  story_link_text?: string;
  link_type?: 'whatsapp' | 'custom';
  companion_city?: string;
  status: 'pending' | 'approved' | 'rejected';
};

async function insertStoryWithSchemaFallback(insertData: CreatedStoryInsert) {
  let payload: Record<string, unknown> = { ...insertData };

  while (true) {
    const { data, error } = await supabase
      .from('created_stories')
      .insert([payload])
      .select()
      .single();

    if (!error) {
      return data;
    }

    const missingColumnMatch = error.message?.match(/Could not find the '([^']+)' column/i);
    const missingColumn = missingColumnMatch?.[1];

    if (!missingColumn || !(missingColumn in payload)) {
      throw error;
    }

    console.warn(`storiesService - Coluna ausente no schema, removendo do insert: ${missingColumn}`);
    const { [missingColumn]: _removed, ...nextPayload } = payload;
    payload = nextPayload;
  }
}

export const storiesService = {
  // Criar nova solicitação de story
  async createRequest(data: {
    name: string;
    phone?: string;
    plan: {
      name: string;
      price: number;
      duration: string;
      features: string[];
    };
  }) {
    const { data: result, error } = await supabase
      .from('story_requests')
      .insert([
        {
          name: data.name,
          phone: data.phone,
          plan_name: data.plan.name,
          plan_price: data.plan.price,
          plan_duration: data.plan.duration,
          plan_features: data.plan.features,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Buscar todas as solicitações (admin)
  async getAllRequests() {
    const { data, error } = await supabase
      .from('story_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as StoryRequest[];
  },

  // Buscar solicitações pendentes
  async getPendingRequests() {
    const { data, error } = await supabase
      .from('story_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as StoryRequest[];
  },

  // Aprovar solicitação
  async approveRequest(requestId: string) {
    const { data, error } = await supabase
      .from('story_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Rejeitar solicitação
  async rejectRequest(requestId: string, reason: string) {
    const { data, error } = await supabase
      .from('story_requests')
      .update({ 
        status: 'rejected',
        rejection_reason: reason 
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload de áudio para o bucket existente
  async uploadAudio(file: File, companionId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `audios/${companionId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Upload de vídeo para o bucket de vídeos
  async uploadVideo(file: File, companionId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${companionId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Upload de imagem para o bucket existente
  async uploadImage(file: File, companionId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `stories/${companionId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Criar story ativo após aprovação
  async createActiveStory(data: {
    requestId: string;
    companionId: string;
    planName: string;
    planPrice: number;
    durationDays: number;
  }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);

    const { data: result, error } = await supabase
      .from('active_stories')
      .insert([
        {
          request_id: data.requestId,
          companion_id: data.companionId,
          plan_name: data.planName,
          plan_price: data.planPrice,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Buscar stories ativos
  async getActiveStories() {
    const { data, error } = await supabase
      .from('active_stories')
      .select(`
        *,
        acompanhantes:companion_id (
          id,
          name,
          image
        )
      `)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Desativar story expirado
  async deactivateExpiredStories() {
    const { data, error } = await supabase
      .from('active_stories')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  // Salvar story criado (pendente de aprovação)
  async saveCreatedStory(data: {
    companionId: string;
    requesterName?: string;
    requesterWhatsapp?: string;
    type: 'photo' | 'video' | 'audio' | 'text';
    url: string;
    thumbnail?: string;
    duration?: number;
    file_size?: number;
    mime_type?: string;
    plan_type?: 'destaque' | 'premium' | 'basic';
    plan_name?: string;
    plan_price?: number;
    story_link_url?: string;
    story_link_text?: string;
    link_type?: 'whatsapp' | 'custom';
    companion_city?: string;
  }) {
    console.log('💾 storiesService - Recebendo dados para salvar:', JSON.stringify(data, null, 2));

    const insertData: CreatedStoryInsert = {
      companion_id: data.companionId,
      requester_name: data.requesterName,
      requester_whatsapp: data.requesterWhatsapp,
      type: data.type,
      url: data.url,
      thumbnail: data.thumbnail,
      duration: data.duration,
      file_size: data.file_size,
      mime_type: data.mime_type,
      plan_type: data.plan_type || 'destaque',
      plan_name: data.plan_name,
      plan_price: data.plan_price,
      story_link_url: data.story_link_url,
      story_link_text: data.story_link_text,
      link_type: data.link_type,
      companion_city: data.companion_city,
      status: 'approved'
    };

    console.log('Dados formatados para inserção:', JSON.stringify(insertData, null, 2));

    try {
      const result = await insertStoryWithSchemaFallback(insertData);

      console.log('💾 storiesService - Story salvo com sucesso:', result);

      return result;
    } catch (error) {
      console.error('❌ storiesService - Erro ao salvar story:', error);
      throw error;
    }
  },

  // Buscar stories criados (com dados da acompanhante)
  async getCreatedStories() {
    console.log('🔍 Buscando stories no banco...');
    
    try {
      // Primeiro tentar consulta simples sem JOIN
      console.log('📡 Executando consulta para created_stories...');
      const { data, error, status, statusText } = await supabase
        .from('created_stories')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Status da resposta:', status);
      console.log('📝 Status text:', statusText);

      if (error) {
        console.error('❌ Erro detalhado ao buscar stories:', {
          error,
          status,
          statusText,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Se a tabela não existe, retornar array vazio em vez de erro
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('table')) {
          console.log('⚠️ Tabela created_stories não existe. Retornando array vazio.');
          return [];
        }
        
        throw error;
      }
      
      console.log('📋 Dados brutos do banco:', data);
      console.log('🔢 Número de registros encontrados:', data?.length || 0);
      
      // Se não há dados, retornar array vazio
      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum story encontrado na tabela');
        return [];
      }
      
      // Formatar dados sem depender da tabela acompanhantes
      const formattedData = data.map((story) => {
        return {
          ...story,
          companion_name: story.requester_name || 'Acompanhante',
          companion_image: null
        };
      });
      
      console.log('✅ Dados formatados:', formattedData);
      return formattedData as CreatedStory[];
      
    } catch (error) {
      console.error('💥 Erro geral na função getCreatedStories:', error);
      // Retornar array vazio em caso de qualquer erro
      return [];
    }
  },

  // Função para incrementar visualizações de um story (+4 por entrada)
  async incrementViews(storyId: string): Promise<void> {
    try {
      console.log('📈 storiesService - Incrementando views do story:', storyId);
      
      // Primeiro buscar o valor atual de views
      const { data: currentData, error: fetchError } = await supabase
        .from('created_stories')
        .select('views')
        .eq('id', storyId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar views atuais:', fetchError);
        throw fetchError;
      }

      // Calcular novo valor (incrementar por 4)
      const currentViews = currentData?.views || 0;
      const newViews = currentViews + 4;

      // Atualizar com o novo valor
      const { error } = await supabase
        .from('created_stories')
        .update({ views: newViews })
        .eq('id', storyId);

      if (error) {
        console.error('❌ Erro ao atualizar views:', error);
        throw error;
      }
      
      console.log(`✅ Views incrementadas: ${currentViews} -> ${newViews} (+4)`);
    } catch (error) {
      console.error('❌ Erro ao incrementar views:', error);
      throw error;
    }
  },

  // Buscar stories aprovados para mostrar no site
  async getApprovedStories(userCity?: string) {
    // console.log('🔍 storiesService - Buscando stories aprovados para o site...');
    // console.log('📍 storiesService - Cidade do usuário para filtro:', userCity);
    
    // Buscar stories aprovados sem JOIN
    const { data, error } = await supabase
      .from('created_stories')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar stories aprovados:', error);
      throw error;
    }
    
    console.log('📋 storiesService - Stories aprovados encontrados:', data?.length || 0);
    
    // Log de TODOS os stories encontrados com suas cidades
    data?.forEach(story => {
      console.log('📍 storiesService - Story encontrado:');
      console.log('  - id:', story.id);
      console.log('  - requester_name:', story.requester_name);
      console.log('  - companion_city:', story.companion_city);
      console.log('  - created_at:', story.created_at);
      console.log('  ---');
    });
    
    if (!data || data.length === 0) {
      return [];
    }

    // Filtrar por cidade se fornecida
    let filteredData = data;
    if (userCity) {
      const normalize = (str: string) => str ? str.normalize('NFD').replace(/[^a-zA-Z0-9\s-]/g, '').toLowerCase() : '';
      
      // Extrair apenas o nome da cidade (remover estado se houver)
      const extractCityName = (cityStr: string) => {
        if (!cityStr) return '';
        // Se tem formato "Cidade - Estado", pegar só a cidade
        const parts = cityStr.split(' - ');
        return parts[0].trim();
      };
      
      const userCityName = extractCityName(userCity);
      const normalizedUserCity = normalize(userCityName);
      const isRmrFilter =
        normalizedUserCity === 'rmr' ||
        normalizedUserCity === 'regiao metropolitana' ||
        normalizedUserCity === 'regiao metropolitana do recife';
      const normalizedMetropolitanCities = metropolitanCities.map((city) => normalize(city));
      
      console.log('🔍 storiesService - Filtro de cidade:');
      console.log('  - userCityOriginal:', userCity);
      console.log('  - userCityName:', userCityName);
      console.log('  - normalizedUserCity:', normalizedUserCity);
      
      filteredData = data.filter(story => {
        const storyCity = story.companion_city;
        const storyCityName = extractCityName(storyCity);
        const normalizedStoryCity = normalize(storyCityName);
        
        // Verificar correspondência exata ou parcial
        if (isRmrFilter) {
          return normalizedMetropolitanCities.some((city) => (
            normalizedStoryCity === city ||
            normalizedStoryCity.includes(city) ||
            city.includes(normalizedStoryCity)
          ));
        }

        const exactMatch = normalizedStoryCity === normalizedUserCity;
        const partialMatch = normalizedStoryCity.includes(normalizedUserCity) || normalizedUserCity.includes(normalizedStoryCity);
        const matches = exactMatch || partialMatch;
        
        console.log('🔍 storiesService - Verificando story:');
        console.log('  - requesterName:', story.requester_name);
        console.log('  - storyCity:', storyCity);
        console.log('  - storyCityName:', storyCityName);
        console.log('  - normalizedStoryCity:', normalizedStoryCity);
        console.log('  - userCityName:', userCityName);
        console.log('  - normalizedUserCity:', normalizedUserCity);
        console.log('  - exactMatch:', exactMatch);
        console.log('  - partialMatch:', partialMatch);
        console.log('  - matches:', matches);
        console.log('  ---');
        
        return matches;
      });
      
      console.log(`📍 storiesService - Filtro de cidade aplicado: ${data.length} -> ${filteredData.length} stories`);
    }
    
    // Função para determinar plano baseado em heurísticas simples
    const getPlanType = (story: any): 'basic' | 'destaque' | 'premium' => {
      // Se tiver campos de plano na tabela, usar eles
      if (story.plan_type) {
        return story.plan_type;
      }
      
      // Padrão: destaque (plano intermediário)
      return 'destaque';
    };
    
    // AGRUPAMENTO POR ACOMPANHANTE (requester_name)
    const storiesByCompanion = filteredData.reduce((acc, story) => {
      const companionKey = story.requester_name || 'Acompanhante';
      
      if (!acc[companionKey]) {
        // Para a preview, priorizar thumbnail para vídeos, senão usar URL
        const previewImage = story.type === 'video' && story.thumbnail ? story.thumbnail : story.url;
        
        const planType = getPlanType(story);
        const durationHours = planType === 'basic' ? 24 : planType === 'premium' ? 15 * 24 : 48;

        acc[companionKey] = {
          companion_id: story.companion_id,
          companion_name: companionKey,
          companion_image: previewImage, // Usar preview inteligente como avatar
          preview_image: previewImage, // Usar preview inteligente
          plan_type: planType,
          expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
          hasNewStory: true,
          stories: []
        };
      }
      
      // Adicionar story individual ao array de stories da acompanhante
      acc[companionKey].stories.push({
        id: story.id,
        type: story.type,
        url: story.url,
        thumbnail: story.thumbnail,
        duration: story.duration,
        created_at: story.created_at,
        storyLinkUrl: story.story_link_url,
        storyLinkText: story.story_link_text,
        linkType: story.link_type,
        companion_city: story.companion_city,
        views: story.views || 0 // Contador de visualizações
      });
      
      return acc;
    }, {} as Record<string, any>);
    
    // Converter objeto para array e ordenar por data mais recente
    const formattedData = Object.values(storiesByCompanion).map((companion: any) => {
      // Ordenar stories da acompanhante por data (mais recente primeiro)
      companion.stories.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // CORREÇÃO: Atualizar preview_image para o story mais recente
      if (companion.stories.length > 0) {
        const mostRecentStory = companion.stories[0];
        const newPreviewImage = mostRecentStory.type === 'video' && mostRecentStory.thumbnail 
          ? mostRecentStory.thumbnail 
          : mostRecentStory.url;
          
        companion.preview_image = newPreviewImage;
        companion.companion_image = newPreviewImage;
      }
      
      // Usar a data do story mais recente para ordenação geral
      const mostRecentStoryDate = companion.stories[0]?.created_at;
      
      return {
        ...companion,
        id: `companion_${companion.companion_id}_${Date.now()}`, // ID único para cada acompanhante
        most_recent_story: mostRecentStoryDate
      };
    });
    
    // Ordenar acompanhantes por story mais recente
    formattedData.sort((a: any, b: any) => 
      new Date(b.most_recent_story).getTime() - new Date(a.most_recent_story).getTime()
    );
    
    console.log('✅ storiesService - Stories agrupados por acompanhante:', formattedData);
    console.log('📊 storiesService - Total de acompanhantes com stories:', formattedData.length);
    
    // Log detalhado de cada acompanhante
    formattedData.forEach((companion: any) => {
      console.log(`👤 storiesService - ${companion.companion_name}: ${companion.stories.length} stories`);
      console.log('   - preview_image:', companion.preview_image);
      console.log('   - plan_type:', companion.plan_type);
    });
    
    if (formattedData.length === 0) {
      console.log('⚠️ storiesService - NENHUM STORY RETORNADO! Verificar:');
      console.log('   - Cidade filtrada:', userCity);
      console.log('   - Stories antes do filtro:', data?.length || 0);
      console.log('   - Stories após filtro:', filteredData.length);
    }
    
    return formattedData;
  },

  // Buscar stories pendentes de aprovação
  async getPendingStories() {
    console.log('🔍 Buscando stories pendentes...');
    
    const { data, error } = await supabase
      .from('created_stories')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar stories pendentes:', error);
      throw error;
    }
    
    console.log('📋 Stories pendentes encontrados:', data?.length || 0);
    
    // Formatar dados sem JOIN problemático
    const formattedData = (data || []).map(story => ({
      ...story,
      companion_name: story.requester_name || 'Acompanhante',
      companion_image: null // Sem imagem por enquanto
    }));
    
    console.log('✅ Stories pendentes formatados:', formattedData);
    return formattedData as CreatedStory[];
  },

  // Aprovar story
  async approveStory(storyId: string) {
    const { data, error } = await supabase
      .from('created_stories')
      .update({ status: 'approved' })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Rejeitar story
  async rejectStory(storyId: string, reason: string) {
    const { data, error } = await supabase
      .from('created_stories')
      .update({ 
        status: 'rejected',
        rejection_reason: reason 
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar story permanentemente (admin)
  async deleteStory(storyId: string) {
    console.log('🗑️ Deletando story:', storyId);
    
    const { data, error } = await supabase
      .from('created_stories')
      .delete()
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao deletar story:', error);
      throw error;
    }
    
    console.log('✅ Story deletado com sucesso:', data);
    return data;
  },

  // Incrementar curtidas de um story
  async likeStory(storyId: string) {
    try {
      const { data, error } = await supabase.rpc('increment_story_likes', {
        story_id: storyId
      });

      if (error) throw error;
      
      console.log(`❤️ Story curtido! ID: ${storyId}, Novas curtidas: ${data}`);
      return data; // Retorna o novo número de curtidas
    } catch (error) {
      console.error('❌ Erro ao curtir story:', error);
      throw error;
    }
  },

  // Decrementar curtidas de um story (descurtir)
  async unlikeStory(storyId: string) {
    try {
      const { data, error } = await supabase.rpc('decrement_story_likes', {
        story_id: storyId
      });

      if (error) throw error;
      
      console.log(`💔 Story descurtido! ID: ${storyId}, Novas curtidas: ${data}`);
      return data; // Retorna o novo número de curtidas
    } catch (error) {
      console.error('❌ Erro ao descurtir story:', error);
      throw error;
    }
  }
}; 
