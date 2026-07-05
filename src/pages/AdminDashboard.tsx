import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Search, Plus, Check, X, Users, UserCheck, Clock, Star, LogOut, DollarSign, MapPin, Calendar, Home, Tag, Camera, ShieldCheck, FileText, Images, Video, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { acompanhantesService, cadastrosService, adminService, especialidadesService, adsService, type Acompanhante, type CadastroPendente, type Especialidade, type Advertisement } from '../lib/supabase';
import { EditAcompanhanteModal } from '../components/EditAcompanhanteModal';
import { AcompanhanteDetailsModal } from '../components/AcompanhanteDetailsModal';
import { CadastroPendenteDetailsModal } from '../components/CadastroPendenteDetailsModal';
import ImageUpload from '../components/ImageUpload';
import AdminChat from '../components/AdminChat';
import AdminBoosts from '../components/AdminBoosts';
import { getVerificationQueue, reviewVerificationStep, type VerificationQueueItem } from '../services/verificationService';

// Administração com dados reais do Supabase

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('acompanhantes');
  const [searchTerm, setSearchTerm] = useState('');
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([]);
  const [cadastrosPendentes, setCadastrosPendentes] = useState<CadastroPendente[]>([]);
  const [verificationQueue, setVerificationQueue] = useState<VerificationQueueItem[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_acompanhantes: 0,
    cadastros_pendentes: 0,
    novos_mes: 0,
    rating_medio: 0
  });

  // Estados para gerenciar anúncios
  const [anuncios, setAnuncios] = useState([]);
  const [showAddAnuncio, setShowAddAnuncio] = useState(false);
  const [newAnuncio, setNewAnuncio] = useState({
    title: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
    imageUrl: '',
    displayOrder: 1
  });
  const [useImageUpload, setUseImageUpload] = useState(true);

  // Estados para gerenciar especialidades
  const [showAddEspecialidade, setShowAddEspecialidade] = useState(false);
  const [newEspecialidadeName, setNewEspecialidadeName] = useState('');
  const [editingEspecialidade, setEditingEspecialidade] = useState<Especialidade | null>(null);
  const [editEspecialidadeName, setEditEspecialidadeName] = useState('');

  // Novo estado para editar uma acompanhante
  const [editingAcompanhante, setEditingAcompanhante] = useState<Acompanhante | null>(null);
  const [viewingAcompanhante, setViewingAcompanhante] = useState<Acompanhante | null>(null);
  const [viewingCadastro, setViewingCadastro] = useState<CadastroPendente | null>(null);

  // Função para validar e corrigir URLs de imagem
  const getValidImageUrl = (imageUrl: string | undefined, fallbackUrl?: string): string => {
    // URL padrão para quando não há imagem válida
    const defaultImageUrl = "/default-profile.png";
    
    if (!imageUrl || 
        imageUrl === 'foto/' || 
        imageUrl === 'foto' || 
        imageUrl.length < 10 || 
        (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      return fallbackUrl || defaultImageUrl;
    }
    
    return imageUrl;
  };

  // Função para verificar se é vídeo
  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  // Função para limpar URLs de mídia (similar ao CompanionCard)
  const getCleanMediaUrl = (url: string) => {
    if (!url) return '';
    
    // Aplicar limpeza de caracteres problemáticos se for URL completa
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        let cleanUrl = url;
        
        // Verificar se há caracteres especiais problemáticos na URL
        if (cleanUrl.includes('%20') || cleanUrl.includes('%28') || cleanUrl.includes('%29') || 
            cleanUrl.includes('(') || cleanUrl.includes(')') || cleanUrl.includes(' ')) {
          // Log para debug
          console.log('🔧 AdminDashboard - Limpando URL problemática:', cleanUrl);
          
          // Limpeza robusta de caracteres problemáticos
          cleanUrl = cleanUrl.replace(/%20/g, '_');          // Espaços codificados
          cleanUrl = cleanUrl.replace(/%28/g, '');           // Parênteses esquerdo codificado
          cleanUrl = cleanUrl.replace(/%29/g, '');           // Parênteses direito codificado
          cleanUrl = cleanUrl.replace(/\(/g, '');            // Parênteses esquerdo
          cleanUrl = cleanUrl.replace(/\)/g, '');            // Parênteses direito
          cleanUrl = cleanUrl.replace(/\s+/g, '_');          // Espaços restantes
          cleanUrl = cleanUrl.replace(/__+/g, '_');          // Múltiplos underscores
          cleanUrl = cleanUrl.replace(/_+\./g, '.');         // Underscore antes da extensão
          cleanUrl = cleanUrl.replace(/[^\w\-._~:/?#[\]@!$&'*+,;=]/g, ''); // Remove outros caracteres especiais
          
          console.log('✅ AdminDashboard - URL limpa:', cleanUrl);
        }
        
        return cleanUrl;
      } catch (error) {
        console.error('❌ AdminDashboard - Erro ao processar URL:', url, error);
        return url; // Retorna original se houver erro
      }
    }
    
    return url;
  };

  // Função de logout
  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do painel administrativo?')) {
      localStorage.removeItem('admin');
      navigate('/admin-login');
    }
  };

  // Carregar dados reais do Supabase (seguindo padrão das páginas Index e Catalog)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar acompanhantes (incluindo não verificadas para admin)
        console.log('🔄 AdminDashboard - Carregando acompanhantes...');
        const allAcompanhantes = await acompanhantesService.getAllForAdmin();
        console.log('✅ AdminDashboard - Acompanhantes carregadas:', allAcompanhantes?.length || 0);

        // Carregar cadastros pendentes
        console.log('🔄 AdminDashboard - Carregando cadastros pendentes...');
        const pendingCadastros = await cadastrosService.getPending();
        console.log('✅ AdminDashboard - Cadastros pendentes carregados:', pendingCadastros?.length || 0);

        console.log('🔄 AdminDashboard - Carregando fila de verificacoes...');
        // Usa Netlify function com service role para bypassar RLS
        const verifRes = await fetch('/.netlify/functions/admin-verification-queue');
        const pendingVerifications = verifRes.ok ? await verifRes.json() : await getVerificationQueue();
        console.log('✅ AdminDashboard - Verificacoes pendentes carregadas:', pendingVerifications?.length || 0);

        // Carregar especialidades
        console.log('🔄 AdminDashboard - Carregando especialidades...');
        const allEspecialidades = await especialidadesService.getAll();
        console.log('✅ AdminDashboard - Especialidades carregadas:', allEspecialidades?.length || 0);

        // Carregar anúncios
        console.log('🔄 AdminDashboard - Carregando anúncios...');
        let allAnuncios = [];
        try {
          allAnuncios = await adsService.getAll();
          console.log('✅ AdminDashboard - Anúncios carregados:', allAnuncios?.length || 0);
        } catch (adsError) {
          console.error('❌ AdminDashboard - Erro ao carregar anúncios:', adsError);
          allAnuncios = []; // Continuar sem anúncios em caso de erro
        }

        // Calcular estatísticas manualmente (mais confiável)
        const dashboardStats = {
          total_acompanhantes: allAcompanhantes.length,
          cadastros_pendentes: pendingCadastros.length,
          novos_mes: allAcompanhantes.filter(a => {
            if (!a.created_at) return false;
            const created = new Date(a.created_at);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return created > monthAgo;
          }).length,
          rating_medio: allAcompanhantes.length > 0 
            ? allAcompanhantes.reduce((sum, a) => sum + (a.rating || 0), 0) / allAcompanhantes.length 
            : 0
        };

        setAcompanhantes(allAcompanhantes || []);
        setCadastrosPendentes(pendingCadastros || []);
        setVerificationQueue(pendingVerifications || []);
        setEspecialidades(allEspecialidades || []);
        setAnuncios(allAnuncios || []);
        
        console.log('✅ AdminDashboard - Todos os dados carregados com sucesso');
        setStats(dashboardStats);

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do dashboard. Verifique sua conexão e tente novamente.');
        
        // Definir valores padrão em caso de erro
        setAcompanhantes([]);
        setCadastrosPendentes([]);
        setVerificationQueue([]);
        setEspecialidades([]);
        setAnuncios([]);
        setStats({
          total_acompanhantes: 0,
          cadastros_pendentes: 0,
          novos_mes: 0,
          rating_medio: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Aprovar cadastro (seguindo padrão das páginas Index e Catalog)
  const handleApprove = async (cadastroId: string) => {
    if (!confirm('Tem certeza que deseja aprovar este cadastro? Isso criará um novo perfil de acompanhante.')) {
      return;
    }

    try {
      setLoading(true);
      const newAcompanhante = await cadastrosService.approve(cadastroId);
      
      // Atualizar listas localmente
      setCadastrosPendentes(prev => prev.filter(c => c.id !== cadastroId));
      if (newAcompanhante) {
        setAcompanhantes(prev => [newAcompanhante, ...prev]);
      }
      
      // Recalcular estatísticas
      setStats(prev => ({
        ...prev,
        total_acompanhantes: prev.total_acompanhantes + 1,
        cadastros_pendentes: prev.cadastros_pendentes - 1
      }));

      alert('✅ Cadastro aprovado com sucesso! Nova acompanhante adicionada ao catálogo.');
    } catch (err) {
      console.error('Erro ao aprovar cadastro:', err);
      let errorMessage = 'Erro desconhecido';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Tratar erros do Supabase
        const supabaseError = err as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.code === '23505') {
          errorMessage = 'Email já está em uso por outra acompanhante';
        } else if (supabaseError.code === 'PGRST204') {
          errorMessage = 'Erro de estrutura da tabela. Verifique as colunas no banco de dados.';
        }
      }
      
      alert(`❌ Erro ao aprovar cadastro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Rejeitar cadastro (seguindo padrão das páginas Index e Catalog)
  const handleReject = async (cadastroId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar este cadastro? Esta ação não pode ser desfeita.')) {
      return;
    }

      try {
      setLoading(true);
        await cadastrosService.reject(cadastroId);
      
      // Atualizar lista localmente
        setCadastrosPendentes(prev => prev.filter(c => c.id !== cadastroId));
      
      // Recalcular estatísticas
      setStats(prev => ({
        ...prev,
        cadastros_pendentes: prev.cadastros_pendentes - 1
      }));

      alert('✅ Cadastro rejeitado com sucesso!');
      } catch (err) {
        console.error('Erro ao rejeitar cadastro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`❌ Erro ao rejeitar cadastro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar acompanhante (Supabase)
  const handleUpdateAcompanhante = async (id: string, updates: Partial<Acompanhante>) => {
    try {
      const updatedAcompanhante = await acompanhantesService.update(id, updates);
      setAcompanhantes(prev => prev.map(a => a.id === id ? updatedAcompanhante : a));
      alert('Acompanhante atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar acompanhante:', err);
      alert('Erro ao atualizar acompanhante. Tente novamente.');
    }
  };

  // Deletar acompanhante (Supabase)
  const handleDeleteAcompanhante = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta acompanhante?')) {
      try {
        await acompanhantesService.delete(id);
        setAcompanhantes(prev => prev.filter(a => a.id !== id));
        alert('Acompanhante deletada com sucesso!');
      } catch (err) {
        console.error('Erro ao deletar acompanhante:', err);
        alert('Erro ao deletar acompanhante. Tente novamente.');
      }
    }
  };

  const handleReviewVerification = async (
    companionId: string,
    step: 'document' | 'photo' | 'video' | 'media-comparison',
    decision: 'approved' | 'rejected'
  ) => {
    const actionLabel = decision === 'approved' ? 'aprovar' : 'rejeitar';
    if (!confirm(`Tem certeza que deseja ${actionLabel} esta verificacao de ${step}?`)) {
      return;
    }

    try {
      // Usa Netlify function com service role para bypassar RLS
      const res = await fetch('/.netlify/functions/admin-verification-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId, step, decision }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Nao foi possivel atualizar a verificacao.');
      }

      const verifRes = await fetch('/.netlify/functions/admin-verification-queue');
      const refreshedQueue = verifRes.ok ? await verifRes.json() : await getVerificationQueue();
      setVerificationQueue(refreshedQueue);
      alert(`Verificacao ${decision === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`);
    } catch (err) {
      console.error('Erro ao revisar verificacao:', err);
      alert('Erro ao revisar verificacao. Tente novamente.');
    }
  };

  // Filtrar acompanhantes baseado na busca
  const filteredAcompanhantes = acompanhantes.filter(acompanhante =>
    acompanhante.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acompanhante.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acompanhante.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCadastros = cadastrosPendentes.filter(cadastro =>
    cadastro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadastro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadastro.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVerificationQueue = verificationQueue.filter((item) => {
    const companionName = item.companion?.display_name || item.companion?.name || '';
    const companionEmail = item.companion?.email || '';
    const companionLocation = item.companion?.location || '';

    return (
      companionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companionEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companionLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Funções para gerenciar especialidades
  const handleAddEspecialidade = async () => {
    if (!newEspecialidadeName.trim()) return;
    
    try {
      const newEspecialidade = await especialidadesService.create(newEspecialidadeName);
      setEspecialidades(prev => [...prev, newEspecialidade]);
      setNewEspecialidadeName('');
      setShowAddEspecialidade(false);
    } catch (error) {
      console.error('Erro ao adicionar especialidade:', error);
      alert('Erro ao adicionar especialidade. Tente novamente.');
    }
  };

  const handleEditEspecialidade = async () => {
    if (!editingEspecialidade || !editEspecialidadeName.trim()) return;
    
    try {
      const updatedEspecialidade = await especialidadesService.update(editingEspecialidade.id, editEspecialidadeName);
      setEspecialidades(prev => prev.map(e => e.id === editingEspecialidade.id ? updatedEspecialidade : e));
      setEditingEspecialidade(null);
      setEditEspecialidadeName('');
    } catch (error) {
      console.error('Erro ao atualizar especialidade:', error);
      alert('Erro ao atualizar especialidade. Tente novamente.');
    }
  };

  const handleDeleteEspecialidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta especialidade?')) return;
    
    try {
      await especialidadesService.delete(id);
      setEspecialidades(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Erro ao deletar especialidade:', error);
      alert('Erro ao deletar especialidade. Tente novamente.');
    }
  };

  const startEditEspecialidade = (especialidade: Especialidade) => {
    setEditingEspecialidade(especialidade);
    setEditEspecialidadeName(especialidade.name);
  };

  const cancelEditEspecialidade = () => {
    setEditingEspecialidade(null);
    setEditEspecialidadeName('');
  };

  // Renderizar card compacto do cadastro pendente
  const renderCadastroPendenteCard = (cadastro: CadastroPendente) => {
    return (
      <div key={cadastro.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold truncate">{cadastro.name}</h3>
            <p className="text-gray-600 text-sm truncate">{cadastro.location}</p>
            <p className="text-xs text-gray-500 truncate">{cadastro.email}</p>
          </div>
          <img
            src={getValidImageUrl(cadastro.image)}
            alt={cadastro.name}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => setViewingCadastro(cadastro)}
            className="py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Detalhes</span>
          </button>
          <button
            onClick={() => handleReject(cadastro.id)}
            className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Rejeitar</span>
          </button>
          <button
            onClick={() => handleApprove(cadastro.id)}
            className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Aprovar</span>
          </button>
        </div>
      </div>
    );
  };

  // Renderizar card compacto da acompanhante
  const renderAcompanhanteCard = (acompanhante: Acompanhante) => {
    return (
      <div key={acompanhante.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold truncate">{acompanhante.name}</h3>
            <p className="text-gray-600 text-sm truncate">{acompanhante.location}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {acompanhante.is_verified && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Verificada</span>
              )}
              {acompanhante.is_available && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Disponível</span>
              )}
              {acompanhante.is_featured && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Destaque</span>
              )}
            </div>
          </div>
          <img
            src={getValidImageUrl(acompanhante.image)}
            alt={acompanhante.name}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => setViewingAcompanhante(acompanhante)}
            className="py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Detalhes</span>
          </button>
          <button
            onClick={() => setEditingAcompanhante(acompanhante)}
            className="py-2 bg-velvet-pink-600 text-white rounded-lg hover:bg-velvet-pink-700 flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => handleDeleteAcompanhante(acompanhante.id)}
            className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    );
  };

  const renderVerificationActions = (
    item: VerificationQueueItem,
    step: 'document' | 'photo' | 'video' | 'media-comparison',
    label: string,
    status?: 'pending' | 'approved' | 'rejected',
    previewUrl?: string | null,
    icon?: any
  ) => {
    if (status !== 'pending') {
      return null;
    }

    return (
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              {icon}
              <span>{label}</span>
            </div>
            <p className="text-xs text-orange-600 mt-1">Status: aguardando aprovacao</p>
          </div>
          {previewUrl && (
            previewUrl.includes('.mp4') || previewUrl.includes('.webm') || previewUrl.includes('.mov') ? (
              <video src={previewUrl} className="w-20 h-20 rounded-lg object-cover bg-black" controls />
            ) : (
              <img src={previewUrl} alt={label} className="w-20 h-20 rounded-lg object-cover" />
            )
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleReviewVerification(item.companion_id, step, 'approved')}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Aprovar
          </button>
          <button
            onClick={() => handleReviewVerification(item.companion_id, step, 'rejected')}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Rejeitar
          </button>
        </div>
      </div>
    );
  };

  const renderVerificationQueueCard = (item: VerificationQueueItem) => {
    const companionName = item.companion?.display_name || item.companion?.name || 'Acompanhante';

    return (
      <div key={item.companion_id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold truncate">{companionName}</h3>
            <p className="text-gray-600 text-sm truncate">{item.companion?.location || 'Localizacao nao informada'}</p>
            <p className="text-xs text-gray-500 truncate">{item.companion?.email || 'Email nao informado'}</p>
          </div>
          <img
            src={getValidImageUrl(item.companion?.image || undefined)}
            alt={companionName}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
          />
        </div>

        <div className="space-y-3">
          {renderVerificationActions(
            item,
            'document',
            'Documento',
            item.document_status,
            item.document_front_url,
            <FileText className="w-4 h-4 text-velvet-pink-600" />
          )}
          {renderVerificationActions(
            item,
            'photo',
            'Fotos reais',
            item.photo_status,
            item.verification_photos?.[0],
            <Images className="w-4 h-4 text-velvet-pink-600" />
          )}
          {renderVerificationActions(
            item,
            'video',
            'Video de verificacao',
            item.video_status,
            item.verification_video_url,
            <Video className="w-4 h-4 text-velvet-pink-600" />
          )}
          {renderVerificationActions(
            item,
            'media-comparison',
            'Comparacao de midia',
            item.media_comparison_status,
            item.media_comparison_video_url,
            <ShieldCheck className="w-4 h-4 text-velvet-pink-600" />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-pink-600"></div>
            <p className="text-gray-600 mt-2">Carregando dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-6 sm:mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 mb-2">
              Painel <span className="text-transparent bg-clip-text bg-gradient-to-r from-velvet-pink-500 to-velvet-pink-600">Administrativo</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Gerencie acompanhantes e cadastros pendentes</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        {/* Cards de estatísticas - Grid responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm">Total Acompanhantes</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.total_acompanhantes}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-velvet-pink-600 self-end sm:self-auto" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm">Cadastros Pendentes</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.cadastros_pendentes}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 self-end sm:self-auto" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm">Novos este Mês</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.novos_mes}</p>
              </div>
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 self-end sm:self-auto" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm">Rating Médio</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.rating_medio ? stats.rating_medio.toFixed(1) : '0.0'}</p>
              </div>
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 self-end sm:self-auto" />
            </div>
          </div>
        </div>

        {/* Card de acesso rápido ao painel de Stories */}
        <div className="mb-6 sm:mb-8">
          <Link 
            to="/admin-stories"
            className="block bg-gradient-to-r from-velvet-pink-500 to-velvet-pink-600 border border-velvet-pink-200 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Gerenciar Stories</h3>
                  <p className="text-white/90 text-sm">Aprovar e rejeitar stories criados pelas acompanhantes</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">📱</div>
                <div className="text-xs opacity-90">Clique para acessar</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Tabs e Conteúdo */}
        <div className="mt-8">
        {/* Navegação por abas - Responsiva */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('acompanhantes')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center transition-colors text-sm sm:text-base ${
                activeTab === 'acompanhantes'
                  ? 'bg-velvet-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block sm:inline">Acompanhantes</span>
              <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-1 bg-white/20 rounded-full text-xs block sm:inline">
                {acompanhantes.length}
              </span>
            </button>
            <button
                onClick={() => setActiveTab('cadastros_pendentes')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center transition-colors text-sm sm:text-base ${
                  activeTab === 'cadastros_pendentes'
                  ? 'bg-velvet-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block sm:inline">Cadastros Pendentes</span>
              <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-1 bg-white/20 rounded-full text-xs block sm:inline">
                {cadastrosPendentes.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('verificacoes')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center transition-colors text-sm sm:text-base ${
                activeTab === 'verificacoes'
                  ? 'bg-velvet-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block sm:inline">Verificacoes</span>
              <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-1 bg-white/20 rounded-full text-xs block sm:inline">
                {verificationQueue.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('especialidades')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center transition-colors text-sm sm:text-base ${
                activeTab === 'especialidades'
                  ? 'bg-velvet-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block sm:inline">Especialidades</span>
              <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-1 bg-white/20 rounded-full text-xs block sm:inline">
                {especialidades.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('anuncios')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center transition-colors text-sm sm:text-base ${
                activeTab === 'anuncios'
                  ? 'bg-velvet-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block sm:inline">Anúncios</span>
              <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-1 bg-white/20 rounded-full text-xs block sm:inline">
                {anuncios.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('boosts')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center transition-colors text-sm sm:text-base ${
                activeTab === 'boosts'
                  ? 'bg-velvet-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block sm:inline">Boosts</span>
            </button>
            <button
              onClick={() => setActiveTab('mensagens')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center transition-colors text-sm sm:text-base ${
                activeTab === 'mensagens'
                  ? 'bg-velvet-pink-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block sm:inline">Mensagens</span>
              <MessageSquare className="w-4 h-4 inline ml-1" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* Barra de busca responsiva */}
            <div className="mb-4 sm:mb-6">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                    placeholder={activeTab === 'acompanhantes' ? "Buscar acompanhantes..." : activeTab === 'cadastros_pendentes' ? "Buscar cadastros..." : activeTab === 'especialidades' ? "Buscar especialidades..." : "Buscar anúncios..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:border-velvet-pink-500 focus:outline-none"
                />
              </div>
            </div>

              {/* Conteúdo das Tabs */}
              <div className="mt-6">
                {activeTab === 'cadastros_pendentes' && (
              <div>
                    <h2 className="text-2xl font-bold mb-6">Cadastros Pendentes</h2>
                    {loading ? (
                      <p>Carregando cadastros pendentes...</p>
                    ) : cadastrosPendentes.length === 0 ? (
                      <p>Nenhum cadastro pendente.</p>
                    ) : (
                      cadastrosPendentes.map(cadastro => renderCadastroPendenteCard(cadastro))
                              )}
                            </div>
                )}

                {activeTab === 'verificacoes' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <ShieldCheck className="w-7 h-7 text-velvet-pink-600" />
                      <div>
                        <h2 className="text-2xl font-bold">Verificacoes Pendentes</h2>
                        <p className="text-sm text-gray-500">Aprove ou rejeite documento, fotos reais e video de verificacao.</p>
                      </div>
                    </div>
                    {loading ? (
                      <p>Carregando verificacoes pendentes...</p>
                    ) : filteredVerificationQueue.length === 0 ? (
                      <p>Nenhuma verificacao pendente.</p>
                    ) : (
                      filteredVerificationQueue.map((item) => renderVerificationQueueCard(item))
                    )}
                  </div>
                )}

                {activeTab === 'acompanhantes' && (
                          <div>
                    <h2 className="text-2xl font-bold mb-6">Acompanhantes Cadastradas</h2>
                    {loading ? (
                      <p>Carregando acompanhantes...</p>
                    ) : acompanhantes.length === 0 ? (
                      <p>Nenhuma acompanhante cadastrada.</p>
                    ) : (
                      acompanhantes.map(acompanhante => renderAcompanhanteCard(acompanhante))
                              )}
                            </div>
                )}

                {activeTab === 'anuncios' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Gerenciar Anúncios</h2>
                      <button
                        onClick={() => setShowAddAnuncio(true)}
                        className="bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Anúncio</span>
                      </button>
                    </div>

                    {anuncios.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Nenhum anúncio cadastrado</p>
                        <button
                          onClick={() => setShowAddAnuncio(true)}
                          className="bg-velvet-pink-600 text-white px-6 py-3 rounded-lg hover:bg-velvet-pink-700 transition-colors"
                        >
                          Criar Primeiro Anúncio
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {anuncios.map(anuncio => (
                          <div key={anuncio.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-4">
                              <img
                                src={anuncio.image_url || anuncio.imageUrl || 'https://via.placeholder.com/100x100'}
                                alt={anuncio.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{anuncio.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{anuncio.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>CTA: {anuncio.cta_text || anuncio.ctaText}</span>
                                  <span>URL: {anuncio.cta_url || anuncio.ctaUrl}</span>
                                  <span className="font-medium text-blue-600">Posição: {anuncio.display_order || 1}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    anuncio.is_active || anuncio.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {anuncio.is_active || anuncio.isActive ? 'Ativo' : 'Inativo'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      const isActive = anuncio.is_active || anuncio.isActive;
                                      const updatedAd = await adsService.update(anuncio.id, { is_active: !isActive });
                                      if (updatedAd) {
                                        setAnuncios(prev => prev.map(a => 
                                          a.id === anuncio.id ? { ...a, is_active: !isActive } : a
                                        ));
                                      }
                                    } catch (error) {
                                      console.error('Erro ao atualizar anúncio:', error);
                                      alert('Erro ao atualizar anúncio');
                                    }
                                  }}
                                  className={`px-3 py-1 rounded text-sm ${
                                    anuncio.is_active || anuncio.isActive 
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {anuncio.is_active || anuncio.isActive ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
                                      try {
                                        await adsService.delete(anuncio.id);
                                        setAnuncios(prev => prev.filter(a => a.id !== anuncio.id));
                                        alert('Anúncio excluído com sucesso!');
                                      } catch (error) {
                                        console.error('Erro ao excluir anúncio:', error);
                                        alert('Erro ao excluir anúncio');
                                      }
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Modal para adicionar novo anúncio */}
                    {showAddAnuncio && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                          <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Novo Anúncio</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Título
                                </label>
                                <input
                                  type="text"
                                  value={newAnuncio.title}
                                  onChange={(e) => setNewAnuncio({...newAnuncio, title: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-velvet-pink-500 focus:outline-none"
                                  placeholder="Ex: Clube Premium VIP"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Descrição
                                </label>
                                <textarea
                                  value={newAnuncio.description}
                                  onChange={(e) => setNewAnuncio({...newAnuncio, description: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-velvet-pink-500 focus:outline-none h-20"
                                  placeholder="Descrição do anúncio..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Texto do Botão
                                </label>
                                <input
                                  type="text"
                                  value={newAnuncio.ctaText}
                                  onChange={(e) => setNewAnuncio({...newAnuncio, ctaText: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-velvet-pink-500 focus:outline-none"
                                  placeholder="Ex: Saiba Mais"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  URL do Link
                                </label>
                                <input
                                  type="url"
                                  value={newAnuncio.ctaUrl}
                                  onChange={(e) => setNewAnuncio({...newAnuncio, ctaUrl: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-velvet-pink-500 focus:outline-none"
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Imagem do Anúncio
                                </label>
                                
                                {/* Toggle entre Upload e URL */}
                                <div className="flex space-x-4 mb-4">
                                  <button
                                    type="button"
                                    onClick={() => setUseImageUpload(true)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                      useImageUpload
                                        ? 'bg-velvet-pink-100 text-velvet-pink-700 border border-velvet-pink-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    📤 Fazer Upload
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setUseImageUpload(false)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                      !useImageUpload
                                        ? 'bg-velvet-pink-100 text-velvet-pink-700 border border-velvet-pink-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    🔗 URL Manual
                                  </button>
                                </div>

                                {/* Upload de Imagem */}
                                {useImageUpload ? (
                                  <ImageUpload
                                    onImagesUploaded={(urls) => {
                                      if (urls.length > 0) {
                                        setNewAnuncio({...newAnuncio, imageUrl: urls[0]});
                                      }
                                    }}
                                    maxImages={1}
                                    existingImages={newAnuncio.imageUrl ? [newAnuncio.imageUrl] : []}
                                    className="mb-2"
                                  />
                                ) : (
                                  /* Campo de URL Manual */
                                  <div>
                                    <input
                                      type="url"
                                      value={newAnuncio.imageUrl}
                                      onChange={(e) => setNewAnuncio({...newAnuncio, imageUrl: e.target.value})}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-velvet-pink-500 focus:outline-none"
                                      placeholder="https://exemplo.com/imagem.jpg ou .gif"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Suporta JPG, PNG, WebP e GIF
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Posição/Prioridade
                                </label>
                                <select
                                  value={newAnuncio.displayOrder}
                                  onChange={(e) => setNewAnuncio({...newAnuncio, displayOrder: parseInt(e.target.value)})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-velvet-pink-500 focus:outline-none"
                                >
                                  <option value={1}>1 - Primeira posição (mais prioridade)</option>
                                  <option value={2}>2 - Segunda posição</option>
                                  <option value={3}>3 - Terceira posição</option>
                                  <option value={4}>4 - Quarta posição</option>
                                  <option value={5}>5 - Quinta posição</option>
                                  <option value={10}>10 - Posição baixa</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                  Anúncios com número menor aparecem primeiro
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                              <button
                                onClick={() => {
                                  setShowAddAnuncio(false);
                                  setNewAnuncio({ title: '', description: '', ctaText: '', ctaUrl: '', imageUrl: '', displayOrder: 1 });
                                  setUseImageUpload(true);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={async () => {
                                  if (newAnuncio.title && newAnuncio.description) {
                                    try {
                                      const adData = {
                                        title: newAnuncio.title,
                                        description: newAnuncio.description,
                                        cta_text: newAnuncio.ctaText,
                                        cta_url: newAnuncio.ctaUrl,
                                        image_url: newAnuncio.imageUrl,
                                        display_order: newAnuncio.displayOrder,
                                        is_active: true
                                      };
                                      
                                      const novoAnuncio = await adsService.create(adData);
                                      if (novoAnuncio) {
                                        setAnuncios(prev => [...prev, novoAnuncio].sort((a, b) => a.display_order - b.display_order));
                                        setNewAnuncio({ title: '', description: '', ctaText: '', ctaUrl: '', imageUrl: '', displayOrder: 1 });
                                        setUseImageUpload(true);
                                        setShowAddAnuncio(false);
                                        alert('Anúncio criado com sucesso!');
                                      }
                                    } catch (error) {
                                      console.error('Erro ao criar anúncio:', error);
                                      alert('Erro ao criar anúncio. Tente novamente.');
                                    }
                                  }
                                }}
                                className="bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 transition-colors"
                              >
                                Criar Anúncio
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'especialidades' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Especialidades / Tags</h2>
                      <button
                        onClick={() => setShowAddEspecialidade(true)}
                        className="bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Especialidade</span>
                      </button>
                    </div>

                    {/* Formulário para adicionar nova especialidade */}
                    {showAddEspecialidade && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold mb-3">Nova Especialidade</h3>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newEspecialidadeName}
                            onChange={(e) => setNewEspecialidadeName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEspecialidade()}
                            placeholder="Nome da especialidade..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-velvet-pink-500"
                            autoFocus
                          />
                          <button
                            onClick={handleAddEspecialidade}
                            className="bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 text-sm"
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={() => { setShowAddEspecialidade(false); setNewEspecialidadeName(''); }}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {especialidades.length === 0 ? (
                      <div className="text-center py-12">
                        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">Nenhuma especialidade cadastrada</p>
                        <button
                          onClick={() => setShowAddEspecialidade(true)}
                          className="bg-velvet-pink-600 text-white px-6 py-3 rounded-lg hover:bg-velvet-pink-700"
                        >
                          Criar Primeira Especialidade
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {especialidades
                          .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(especialidade => (
                          <div key={especialidade.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                            {editingEspecialidade?.id === especialidade.id ? (
                              <div className="flex gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editEspecialidadeName}
                                  onChange={(e) => setEditEspecialidadeName(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleEditEspecialidade()}
                                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-velvet-pink-500"
                                  autoFocus
                                />
                                <button onClick={handleEditEspecialidade} className="text-green-600 hover:text-green-800">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={cancelEditEspecialidade} className="text-gray-500 hover:text-gray-700">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm font-medium text-gray-800">{especialidade.name}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => startEditEspecialidade(especialidade)}
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEspecialidade(especialidade.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'boosts' && (
                  <AdminBoosts />
                )}

                {activeTab === 'mensagens' && (
                  <AdminChat />
                )}
                        </div>
                      </div>
                  </div>
                </div>
      </main>

      <Footer />

      {/* Modal de Edição */}
      {editingAcompanhante && (
        <EditAcompanhanteModal
          acompanhante={editingAcompanhante}
          onClose={() => setEditingAcompanhante(null)}
          onSave={async (updates) => {
            await handleUpdateAcompanhante(editingAcompanhante.id, updates);
            setEditingAcompanhante(null);
          }}
        />
      )}

      {/* Modal de Detalhes da Acompanhante */}
      {viewingAcompanhante && (
        <AcompanhanteDetailsModal
          acompanhante={viewingAcompanhante}
          onClose={() => setViewingAcompanhante(null)}
        />
      )}

      {/* Modal de Detalhes do Cadastro Pendente */}
      {viewingCadastro && (
        <CadastroPendenteDetailsModal
          cadastro={viewingCadastro}
          onClose={() => setViewingCadastro(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 
