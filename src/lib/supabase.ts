import { createClient } from '@supabase/supabase-js'
import { Client } from '../types/client';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase: variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas no .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('acompanhantes')
      .select('count')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Tipos TypeScript para nossa aplicação
export interface Acompanhante {
  id: string
  name: string
  real_name?: string
  display_name?: string
  email: string
  phone: string
  age: number
  location: string
  height?: string
  image: string
  gallery?: string[] // Array de URLs das imagens da galeria
  audio_url?: string // URL do áudio de apresentação (15 segundos)
  video_url?: string // URL do vídeo de apresentação (10 segundos)
  rating: number
  tags: string[]
  is_featured: boolean
  is_verified: boolean
  is_available: boolean
  description: string
  cities_served?: string[] // Array de cidades atendidas
  // Campos de preços e atendimento - usando camelCase no frontend
  pricePerHour?: string
  hasOwnLocation?: boolean
  acceptsClientLocation?: boolean
  acceptsMotel?: boolean
  created_at: string
  updated_at: string
  videos: string[]
  // Campos de boost/subida
  hasBoost?: boolean
  boostPriority?: number
  boostBadge?: string
  boostColor?: string
  boostExpiresAt?: string
  boostHoursRemaining?: number
}

// Função para converter dados do banco para o formato do frontend
function convertAcompanhanteFromDB(data: any): Acompanhante {
  // Priorizar campo videos se existir, senão usar video_url
  let videos: string[] = [];
  
  if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
    // Se existe campo videos populado, usar ele
    videos = data.videos.filter(url => url && url.trim() !== '');
  } else if (data.video_url) {
    // Se não tem videos mas tem video_url, usar video_url
    videos = [data.video_url];
  }

  const converted = {
    ...data,
    // Campos de nome
    name: data.display_name || data.name,
    real_name: data.real_name,
    display_name: data.display_name,
    // Converter campos de preço e atendimento para camelCase
    pricePerHour: data.priceperhour,
    hasOwnLocation: data.hasownlocation,
    acceptsClientLocation: data.acceptsclientlocation,
    acceptsMotel: data.acceptsmotel,
    // Usar a lógica corrigida para vídeos
    videos: videos,
    // Garantir que gallery seja um array
    gallery: Array.isArray(data.gallery) ? data.gallery : []
  };
  
  return converted;
}

// Função para converter dados do frontend (camelCase) para banco (snake_case)
const convertAcompanhanteToDB = (frontendData: Partial<Acompanhante>): any => {
  const { 
    pricePerHour, 
    hasOwnLocation, 
    acceptsClientLocation, 
    acceptsMotel, 
    videos,
    real_name,
    display_name,
    name,
    ...rest 
  } = frontendData;
  
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
    // Garantir que videos seja sempre um array válido
    videos: videos && Array.isArray(videos) ? videos.filter(url => url && url.trim() !== '') : [],
    // Manter video_url sincronizado com o primeiro vídeo (para compatibilidade)
    video_url: videos && videos.length > 0 ? videos[0] : null
  };
};

export interface CadastroPendente {
  id: string
  name: string
  real_name?: string
  display_name?: string
  email: string
  phone: string
  age: number
  location: string
  height?: string
  image: string
  gallery?: string[]
  audio_url?: string // URL do áudio de apresentação (15 segundos)
  video_url?: string // URL do vídeo de apresentação (10 segundos)
  videos?: string[] // Array de URLs dos vídeos
  services: string[]
  cities_served?: string[] // Array de cidades atendidas
  description: string
  // Campos de preços e atendimento - usando camelCase no frontend
  pricePerHour?: string
  hasOwnLocation?: boolean
  acceptsClientLocation?: boolean
  acceptsMotel?: boolean
  submitted_at: string
}

// Função para converter dados do banco (snake_case) para frontend (camelCase) - CadastroPendente
const convertCadastroFromDB = (dbData: any): CadastroPendente => ({
  ...dbData,
  // Campos de nome
  name: dbData.display_name || dbData.name,
  real_name: dbData.real_name,
  display_name: dbData.display_name,
  // Campos de preço e atendimento em camelCase
  pricePerHour: dbData.priceperhour,
  hasOwnLocation: dbData.hasownlocation,
  acceptsClientLocation: dbData.acceptsclientlocation,
  acceptsMotel: dbData.acceptsmotel
});

// Função para converter dados do frontend (camelCase) para banco (snake_case) - CadastroPendente
const convertCadastroToDB = (frontendData: Omit<CadastroPendente, 'id' | 'submitted_at'>): any => {
  const { 
    pricePerHour, 
    hasOwnLocation, 
    acceptsClientLocation, 
    acceptsMotel,
    real_name,
    display_name,
    name,
    especialidades,
    acceptsTerms,
    ...rest 
  } = frontendData;
  
  // Filtrar campos undefined/null e converter para o formato do banco
  const dbData = {
    ...rest,
    // Campos de nome
    name: display_name || name,
    real_name: real_name || null,
    display_name: display_name || null,
    // Campos de preço e atendimento em snake_case
    priceperhour: pricePerHour || null,
    hasownlocation: hasOwnLocation || false,
    acceptsclientlocation: acceptsClientLocation || false,
    acceptsmotel: acceptsMotel || false,
    // Remover campos que não existem no banco
    especialidades: undefined,
    acceptsTerms: undefined
  };
  
  // Remover campos undefined
  Object.keys(dbData).forEach(key => {
    if (dbData[key] === undefined) {
      delete dbData[key];
    }
  });
  
  return dbData;
};

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  created_at: string
  last_login?: string
}

// Função para converter dados do banco para o formato do frontend para Cliente
const convertClientFromDB = (data: any): Client => ({
  ...data,
  // Nenhum campo especial precisa de conversão de nome para o frontend
});

// Função para converter dados do frontend (camelCase) para banco (snake_case) para Cliente
const convertClientToDB = (frontendData: Partial<Client>): any => {
  const { ...rest } = frontendData;
  return {
    ...rest,
    // Nenhum campo especial precisa de conversão de nome para o banco
  };
};

export const clientService = {
  // Buscar cliente por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return convertClientFromDB(data) as Client;
  },

  // Criar novo cliente
  async create(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    const { id: authId, email: authEmail } = (await supabase.auth.getSession()).data.session?.user || {};
    if (!authId || !authEmail) {
      throw new Error('Usuário não autenticado.');
    }

    const dbData = convertClientToDB({ ...clientData, id: authId, email: authEmail });

    const { data, error } = await supabase
      .from('clientes')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return convertClientFromDB(data) as Client;
  },

  // Atualizar cliente
  async update(id: string, updates: Partial<Omit<Client, 'id' | 'email' | 'created_at' | 'updated_at'>>) {
    const dbUpdates = convertClientToDB(updates);
    const { data, error } = await supabase
      .from('clientes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return convertClientFromDB(data) as Client;
  },

  // Deletar cliente
  async delete(id: string) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

// Interface para especialidades/tags
export interface Especialidade {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// Funções utilitárias
export const acompanhantesService = {
  // Buscar todas as acompanhantes (apenas perfis ativos e verificados)
  async getAll() {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(convertAcompanhanteFromDB) as Acompanhante[] || [];
  },

  // Buscar todas as acompanhantes para admin (incluindo não verificadas)
  async getAllForAdmin() {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(convertAcompanhanteFromDB) as Acompanhante[] || [];
  },

  // Buscar acompanhantes com filtros
  async getFiltered(filters: {
    search?: string
    ageMin?: number
    ageMax?: number
    services?: string[]
    location?: string
  }) {
    let query = supabase
      .from('acompanhantes')
      .select('*')
      .eq('is_verified', true)
      .eq('is_available', true)

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,tags.cs.{${filters.search}}`)
    }

    if (filters.ageMin) {
      query = query.gte('age', filters.ageMin)
    }

    if (filters.ageMax) {
      query = query.lte('age', filters.ageMax)
    }

    if (filters.services && filters.services.length > 0) {
      query = query.overlaps('tags', filters.services)
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    query = query.order('is_featured', { ascending: false })
                 .order('rating', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data?.map(convertAcompanhanteFromDB) as Acompanhante[] || []
  },

  // Buscar por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return convertAcompanhanteFromDB(data) as Acompanhante
  },

  // Atualizar acompanhante
  async update(id: string, updates: Partial<Acompanhante>) {
    const dbUpdates = convertAcompanhanteToDB(updates);
    const { data, error } = await supabase
      .from('acompanhantes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertAcompanhanteFromDB(data) as Acompanhante
  },

  // Deletar acompanhante
  async delete(id: string) {
    const { error } = await supabase
      .from('acompanhantes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const cadastrosService = {
  // Criar novo cadastro pendente
  async create(cadastro: Omit<CadastroPendente, 'id' | 'submitted_at'>) {
    // Converter os dados para o formato do banco
    const dbData = convertCadastroToDB(cadastro);
    
    
    // Verificar se email já existe em acompanhantes aprovadas
    const { data: existingAcompanhantes, error: checkAcompanhantesError } = await supabase
      .from('acompanhantes')
      .select('email')
      .eq('email', dbData.email);
    
    if (checkAcompanhantesError) {
      throw new Error(`Erro ao verificar email: ${checkAcompanhantesError.message}`);
    }
    
    if (existingAcompanhantes && existingAcompanhantes.length > 0) {
      throw new Error(`Email ${dbData.email} já está cadastrado como acompanhante aprovada`);
    }
    
    // Verificar se email já existe em cadastros pendentes
    const { data: existingPendentes, error: checkPendentesError } = await supabase
      .from('cadastros_pendentes')
      .select('email')
      .eq('email', dbData.email);
    
    if (checkPendentesError) {
      throw new Error(`Erro ao verificar cadastros pendentes: ${checkPendentesError.message}`);
    }
    
    if (existingPendentes && existingPendentes.length > 0) {
      throw new Error(`Email ${dbData.email} já possui um cadastro pendente. Aguarde a análise ou entre em contato.`);
    }
    
    const { data, error } = await supabase
      .from('cadastros_pendentes')
      .insert([{
        ...dbData,
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Erro ao criar cadastro: ${error.message}`);
    }
    return data as CadastroPendente
  },

  // Buscar todos os cadastros pendentes
  async getPending() {
    const { data, error } = await supabase
      .from('cadastros_pendentes')
      .select('*')
      .order('submitted_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map(convertCadastroFromDB) as CadastroPendente[]
  },

  // Aprovar cadastro (operação direta seguindo padrão das outras páginas)
  async approve(cadastroId: string) {
    try {
      // 1. Buscar dados do cadastro pendente
      const { data: cadastroData, error: fetchError } = await supabase
        .from('cadastros_pendentes')
        .select('*')
        .eq('id', cadastroId)
        .single();
      
      if (fetchError) {
        throw new Error(`Erro ao buscar cadastro: ${fetchError.message}`)
      }
      if (!cadastroData) {
        throw new Error('Cadastro não encontrado')
      }

      console.log('🔍 Dados do cadastro antes da conversão:', cadastroData);
      console.log('🎥 Vídeos no cadastro:', {
        video_url: cadastroData.video_url,
        videos: cadastroData.videos,
        videos_length: cadastroData.videos ? cadastroData.videos.length : 0
      });

      // 2. Verificar se email já existe
      const { data: existingUsers, error: checkError } = await supabase
        .from('acompanhantes')
        .select('email')
        .eq('email', cadastroData.email);
      
      if (checkError) {
        throw new Error(`Erro ao verificar email: ${checkError.message}`)
      }
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error(`Email ${cadastroData.email} já está cadastrado como acompanhante`)
      }

      // 2b. Tentar encontrar auth_user_id pelo email na tabela auth.users (via busca em clientes/acompanhantes)
      // Se cadastros_pendentes tem auth_user_id, usar diretamente
      let authUserId = cadastroData.auth_user_id || null;

      // Se não tem auth_user_id, tentar encontrar pelo email via Supabase Auth
      if (!authUserId) {
        // Buscar se existe algum usuário auth com esse email (usando a tabela clientes como proxy)
        // Não podemos acessar auth.users diretamente do frontend, mas podemos tentar logar
        console.log('⚠️ cadastrosService.approve - auth_user_id não encontrado no cadastro pendente');
      }

      // 3. Preparar dados apenas com campos obrigatórios e existentes
      const acompanhanteData = {
        name: cadastroData.name,
        email: cadastroData.email,
        phone: cadastroData.phone,
        age: cadastroData.age,
        location: cadastroData.location,
        image: cadastroData.image,
        description: cadastroData.description,
        tags: cadastroData.services || [],
        cities_served: cadastroData.cities_served || [],
        is_verified: true,
        is_available: true,
        is_featured: false,
        rating: 0,
        // Campo crítico para chat e RLS
        ...(authUserId && { auth_user_id: authUserId }),
        // Campos de preços - usando nomes do banco (snake_case)
        priceperhour: cadastroData.priceperhour,
        // Campos de local de atendimento - usando nomes do banco (snake_case)
        hasownlocation: cadastroData.hasownlocation,
        acceptsclientlocation: cadastroData.acceptsclientlocation,
        acceptsmotel: cadastroData.acceptsmotel,
        // Campos opcionais só se existirem
        ...(cadastroData.height && { height: cadastroData.height }),
        ...(cadastroData.gallery && { gallery: cadastroData.gallery }),
        ...(cadastroData.audio_url && { audio_url: cadastroData.audio_url }),
        ...(cadastroData.video_url && { video_url: cadastroData.video_url }),
        // Lógica inteligente para campo videos
        videos: (() => {
          if (cadastroData.videos && Array.isArray(cadastroData.videos) && cadastroData.videos.length > 0) {
            // Se tem array videos populado, usar ele
            const filteredVideos = cadastroData.videos.filter(url => url && url.trim() !== '');
            console.log('🎥 Usando array videos do cadastro:', filteredVideos);
            return filteredVideos;
          } else if (cadastroData.video_url) {
            // Se tem video_url mas não videos, usar video_url
            console.log('🎥 Usando video_url do cadastro:', [cadastroData.video_url]);
            return [cadastroData.video_url];
          } else {
            // Sem vídeos
            console.log('🎥 Nenhum vídeo encontrado no cadastro');
            return [];
          }
        })()
      }

      console.log('📝 Dados preparados para inserção:', acompanhanteData);
      console.log('🎬 Videos que serão inseridos:', acompanhanteData.videos);

      // 4. Inserir na tabela de acompanhantes
      const { data: newAcompanhante, error: insertError } = await supabase
        .from('acompanhantes')
        .insert([acompanhanteData])
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Erro na inserção:', insertError);
        if (insertError.code === '23505') {
          throw new Error('Email já está em uso por outra acompanhante')
        }
        throw new Error(`Erro ao inserir acompanhante: ${insertError.message}`)
      }

      console.log('✅ Dados inseridos no banco:', newAcompanhante);
      console.log('🎬 Videos inseridos no banco:', newAcompanhante.videos);

      // 5. Remover da tabela de cadastros pendentes (já que foi aprovado)
      const { error: deleteError } = await supabase
        .from('cadastros_pendentes')
        .delete()
        .eq('id', cadastroId);
      
      if (deleteError) {
        console.warn('Aviso: Não foi possível remover cadastro pendente:', deleteError.message)
        // Não falha a operação por isso
      }

      const result = convertAcompanhanteFromDB(newAcompanhante);
      console.log('🔄 Dados após conversão:', result);
      
      return result;
    } catch (error) {
      console.error('Erro ao aprovar cadastro:', error)
      throw error
    }
  },

  // Rejeitar cadastro (operação direta seguindo padrão das outras páginas)
  async reject(cadastroId: string) {
    try {
      const { error } = await supabase
        .from('cadastros_pendentes')
        .delete()
        .eq('id', cadastroId)
    
    if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao rejeitar cadastro:', error)
      throw error
    }
  }
}

export const adminService = {
  // Login básico (simplificado para demonstração)
  async login(email: string, password: string) {
    // Em produção, use uma autenticação mais robusta
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error) throw error
    // Em produção, verificar hash da senha aqui
    return data as AdminUser
  },

  // Estatísticas do dashboard
  async getDashboardStats() {
    const { data, error } = await supabase
      .from('v_dashboard_stats')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  }
}

// Funções de upload de imagens
export const imageService = {
  // Upload de imagem para o bucket 'images'
  async uploadImage(file: File, path?: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) throw error

    // Obter URL pública da imagem
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return publicData.publicUrl
  },

  // Upload de múltiplas imagens
  async uploadMultipleImages(files: File[], path?: string): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, path));
    return Promise.all(uploadPromises);
  },

  // Upload de áudio (máximo 10 segundos)
  async uploadAudio(file: File, path?: string): Promise<string> {
    // Validar tipo de arquivo
    if (!file.type.startsWith('audio/')) {
      throw new Error('O arquivo deve ser um áudio válido');
    }

    // Validar tamanho (aproximadamente 15 segundos, máximo 3MB)
    if (file.size > 3 * 1024 * 1024) {
      throw new Error('O áudio deve ter no máximo 15 segundos (3MB)');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : `audios/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  },

  // Upload de vídeo (máximo 10 segundos)
  async uploadVideo(file: File, path?: string): Promise<string> {
    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      throw new Error('O arquivo deve ser um vídeo válido');
    }

    // Validar tamanho (aproximadamente 10 segundos, máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('O vídeo deve ter no máximo 10 segundos (10MB)');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : `videos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  },

  // Deletar imagem do storage
  async deleteImage(url: string): Promise<void> {
    // Extrair o caminho da URL
    const urlParts = url.split('/storage/v1/object/public/images/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]
    
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) throw error
  },

  // Deletar múltiplas imagens
  async deleteMultipleImages(urls: string[]): Promise<void> {
    const deletePromises = urls.map(url => this.deleteImage(url))
    await Promise.all(deletePromises)
  }
}

// Serviço para gerenciar especialidades
export const especialidadesService = {
  // Buscar todas as especialidades
  async getAll() {
    const { data, error } = await supabase
      .from('especialidades')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data as Especialidade[]
  },

  // Criar nova especialidade
  async create(name: string) {
    const { data, error } = await supabase
      .from('especialidades')
      .insert({ name: name.trim() })
      .select()
      .single()
    
    if (error) throw error
    return data as Especialidade
  },

  // Atualizar especialidade
  async update(id: string, name: string) {
    const { data, error } = await supabase
      .from('especialidades')
      .update({ 
        name: name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Especialidade
  },

  // Deletar especialidade
  async delete(id: string) {
    const { error } = await supabase
      .from('especialidades')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Interface para anúncios
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_url: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  click_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Serviço para gerenciar anúncios
export const adsService = {
  // Buscar todos os anúncios (admin)
  async getAll() {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data as Advertisement[]
  },

  // Buscar apenas anúncios ativos (público)
  async getActive() {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data as Advertisement[]
  },

  // Criar novo anúncio
  async create(adData: Omit<Advertisement, 'id' | 'created_at' | 'updated_at' | 'click_count' | 'view_count'>) {
    const { data, error } = await supabase
      .from('advertisements')
      .insert({
        ...adData,
        click_count: 0,
        view_count: 0
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Advertisement
  },

  // Atualizar anúncio
  async update(id: string, adData: Partial<Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('advertisements')
      .update(adData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Advertisement
  },

  // Deletar anúncio
  async delete(id: string) {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Alternar status ativo/inativo
  async toggleActive(id: string) {
    const { data: current } = await supabase
      .from('advertisements')
      .select('is_active')
      .eq('id', id)
      .single()
    
    if (!current) throw new Error('Anúncio não encontrado')
    
    const { data, error } = await supabase
      .from('advertisements')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Advertisement
  },

  // Incrementar visualizações
  async incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_ad_views', { ad_id: id })
    if (error) throw error
  },

  // Incrementar cliques
  async incrementClicks(id: string) {
    const { error } = await supabase.rpc('increment_ad_clicks', { ad_id: id })
    if (error) throw error
  },

  // Reordenar anúncios
  async reorder(adsWithNewOrder: { id: string; display_order: number }[]) {
    const updates = adsWithNewOrder.map(ad => 
      supabase
        .from('advertisements')
        .update({ display_order: ad.display_order })
        .eq('id', ad.id)
    )
    
    const results = await Promise.all(updates)
    
    for (const result of results) {
      if (result.error) throw result.error
    }
    
    return true
  }
}

// messageService removido - usar src/services/messagesService.ts
 
