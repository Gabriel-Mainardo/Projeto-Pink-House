import React, { useState, useEffect } from 'react';
import { CheckCircle, X, MessageCircle, User, Calendar, DollarSign, Clock, Crown, Star, Zap, Image, Video, Volume2, Type, Eye, Link, Trash2 } from 'lucide-react';
import Footer from '../components/Footer';
import { storiesService, StoryRequest, CreatedStory } from '../services/storiesService';

const AdminStories: React.FC = () => {
  const [requests, setRequests] = useState<StoryRequest[]>([]);
  const [createdStories, setCreatedStories] = useState<CreatedStory[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<StoryRequest | null>(null);
  const [selectedStory, setSelectedStory] = useState<CreatedStory | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'stories'>('payments');
  const [showDetails, setShowDetails] = useState(false);
  const [showStoryDetails, setShowStoryDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados reais do Supabase
  useEffect(() => {
    loadRequests();
    loadCreatedStories();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storiesService.getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error('Erro ao carregar solicitações:', err);
      setError('Erro ao carregar solicitações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadCreatedStories = async () => {
    try {
      console.log('🔄 AdminStories: Iniciando carregamento de stories criados...');
      setError(null);
      
      console.log('🔄 AdminStories: Chamando storiesService.getCreatedStories()...');
      const data = await storiesService.getCreatedStories();
      
      console.log('📱 AdminStories: Stories recebidos:', data);
      console.log('📊 AdminStories: Quantidade de stories:', data?.length || 0);
      
      setCreatedStories(data);
      
      if (!data || data.length === 0) {
        console.log('⚠️ AdminStories: Nenhum story criado encontrado');
      } else {
        console.log('✅ AdminStories: Stories criados carregados com sucesso');
      }
      
    } catch (err) {
      console.error('❌ AdminStories: Erro ao carregar stories criados:', err);
      setError('Erro ao carregar stories criados: ' + (err as Error).message);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return <Zap className="w-4 h-4" />;
      case 'destaque': return <Star className="w-4 h-4" />;
      case 'premium': return <Crown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'destaque': return 'from-yellow-500 to-orange-500';
      case 'premium': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const openWhatsApp = (phone?: string, name?: string, plan?: any) => {
    if (!phone) {
      alert('Número de telefone não informado');
      return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}! 👋\n\nRecebi sua solicitação para o plano *${plan?.plan_name}* (R$ ${plan?.plan_price}).\n\nVamos finalizar seu pagamento? Posso te ajudar com todas as informações! 😊`;
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleApprove = async (requestId: string) => {
    try {
      await storiesService.approveRequest(requestId);
      await loadRequests(); // Recarregar lista
      setShowDetails(false);
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprovar solicitação');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await storiesService.rejectRequest(requestId, rejectionReason);
      await loadRequests(); // Recarregar lista
      setShowRejectModal(false);
      setShowDetails(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar solicitação');
    }
  };

  const handleApproveStory = async (storyId: string) => {
    try {
      await storiesService.approveStory(storyId);
      await loadCreatedStories(); // Recarregar lista
      setShowStoryDetails(false);
      alert('Story aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar story:', error);
      alert('Erro ao aprovar story');
    }
  };

  const handleRejectStory = async (storyId: string) => {
    try {
      await storiesService.rejectStory(storyId, rejectionReason);
      await loadCreatedStories(); // Recarregar lista
      setShowRejectModal(false);
      setShowStoryDetails(false);
      setRejectionReason('');
      alert('Story rejeitado.');
    } catch (error) {
      console.error('Erro ao rejeitar story:', error);
      alert('Erro ao rejeitar story');
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await storiesService.deleteStory(storyId);
      await loadCreatedStories(); // Recarregar lista
      setShowDeleteModal(false);
      setShowStoryDetails(false);
      alert('Story removido com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar story:', error);
      alert('Erro ao remover story');
    }
  };

  const getStoryTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  const getStoryTypeLabel = (type: string) => {
    switch (type) {
      case 'photo': return 'Foto';
      case 'video': return 'Vídeo';
      case 'audio': return 'Áudio';
      case 'text': return 'Texto';
      case 'link': return 'Link';
      default: return 'Desconhecido';
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const pendingStories = createdStories.filter(story => story.status === 'pending');
  const approvedStories = createdStories.filter(story => story.status === 'approved');
  const totalRevenue = requests
    .filter(req => req.status === 'approved')
    .reduce((sum, req) => sum + req.plan_price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            📋 Painel Admin - Stories
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gerencie solicitações de stories e contate clientes via WhatsApp
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('payments')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'payments'
                    ? 'border-velvet-pink-500 text-velvet-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💳 Pagamentos ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('stories')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'stories'
                    ? 'border-velvet-pink-500 text-velvet-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📱 Stories Criados ({pendingStories.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {activeTab === 'payments' ? (
            <>
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{pendingRequests.length}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Solicitações Pendentes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{requests.filter(req => req.status === 'approved').length}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Aprovados</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">R$ {totalRevenue}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Receita Total</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{pendingStories.length}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Stories Pendentes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{approvedStories.length}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Stories Aprovados</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{createdStories.filter(story => story.status === 'rejected').length}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Stories Rejeitados</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aviso importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
            <div className="text-xs sm:text-sm text-blue-800">
              <p className="font-medium mb-1">💬 Processo de Aprovação Simplificado</p>
              <p>Clique em "WhatsApp" para entrar em contato direto com o cliente e finalizar o pagamento de forma segura.</p>
            </div>
          </div>
        </div>

        {/* Lista de Solicitações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {activeTab === 'payments' ? 'Solicitações de Stories' : 'Stories Criados'}
            </h2>
          </div>

          {loading && (
            <div className="p-6 sm:p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-velvet-pink-600"></div>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Carregando...</p>
            </div>
          )}

          {error && (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadRequests}
                className="bg-velvet-pink-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-lg hover:bg-velvet-pink-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {!loading && !error && activeTab === 'payments' && (
            <div className="divide-y divide-gray-100">
              {requests.map((request) => (
                <div key={request.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${getPlanColor(request.plan_name)} text-white`}>
                        {getPlanIcon(request.plan_name)}
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{request.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{request.plan_name}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>R$ {request.plan_price}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{formatDate(request.created_at)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      {request.phone && (
                        <button
                          onClick={() => openWhatsApp(request.phone, request.name, request)}
                          className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>WhatsApp</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                        className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-velvet-pink-100 text-velvet-pink-700 rounded-lg text-xs sm:text-sm hover:bg-velvet-pink-200 transition-colors"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Detalhes</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && activeTab === 'stories' && (
            <div className="divide-y divide-gray-100">
              {createdStories.map((story) => (
                <div key={story.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:justify-between">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                      <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-velvet-pink-500 to-velvet-pink-600 text-white">
                        {getStoryTypeIcon(story.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{story.companion_name || 'Nome não disponível'}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                            {getStatusText(story.status)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            {getStoryTypeIcon(story.type)}
                            <span>{getStoryTypeLabel(story.type)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{formatDate(story.created_at)}</span>
                          </span>
                          {story.requester_whatsapp && (
                            <span className="flex items-center space-x-1 text-green-600">
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="truncate">{story.requester_whatsapp}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Preview da mídia */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {(story.type === 'photo' || story.type === 'text') && (
                          <img 
                            src={story.url} 
                            alt="Story preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {story.type === 'video' && (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200">
                            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                          </div>
                        )}
                        {story.type === 'audio' && (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200">
                            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end mt-3 sm:mt-0">
                      {story.requester_whatsapp && story.status === 'pending' && (
                        <button
                          onClick={() => openWhatsApp(
                            story.requester_whatsapp, 
                            story.requester_name || story.companion_name, 
                            { 
                              plan_name: 'Story', 
                              plan_price: 0 
                            }
                          )}
                          className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>WhatsApp</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => window.open(story.url, '_blank')}
                        className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Ver</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedStory(story);
                          setShowStoryDetails(true);
                        }}
                        className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-velvet-pink-100 text-velvet-pink-700 rounded-lg text-xs sm:text-sm hover:bg-velvet-pink-200 transition-colors"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Detalhes</span>
                      </button>

                      {/* Botão Remover Story */}
                      <button
                        onClick={() => {
                          setSelectedStory(story);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm hover:bg-red-600 transition-colors"
                        title="Remover story permanentemente"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {createdStories.length === 0 && (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Image className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">Nenhum story criado encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Detalhes da Solicitação</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Informações do Cliente</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{selectedRequest.name}</span>
                  </div>
                  {selectedRequest.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-medium">{selectedRequest.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{formatDate(selectedRequest.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Plan Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Plano Selecionado</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(selectedRequest.plan_name)} text-white`}>
                      {getPlanIcon(selectedRequest.plan_name)}
                    </div>
                    <div>
                      <h5 className="font-semibold">{selectedRequest.plan_name}</h5>
                      <p className="text-sm text-gray-600">{selectedRequest.plan_duration}</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-xl font-bold text-velvet-pink-600">R$ {selectedRequest.plan_price}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-1">
                    {selectedRequest.plan_features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              )}

              {/* WhatsApp Contact */}
              {selectedRequest.phone && (
                <button
                  onClick={() => openWhatsApp(selectedRequest.phone, selectedRequest.name, selectedRequest)}
                  className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Entrar em contato via WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Story Details Modal */}
      {showStoryDetails && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Detalhes do Story</h3>
              <button 
                onClick={() => setShowStoryDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Story Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Informações do Story</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acompanhante:</span>
                    <span className="font-medium">{selectedStory.companion_name || 'Nome não disponível'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium flex items-center space-x-1">
                      {getStoryTypeIcon(selectedStory.type)}
                      <span>{getStoryTypeLabel(selectedStory.type)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStory.status)}`}>
                      {getStatusText(selectedStory.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data de criação:</span>
                    <span className="font-medium">{formatDate(selectedStory.created_at)}</span>
                  </div>
                  {selectedStory.rejection_reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Motivo da rejeição:</span>
                      <span className="font-medium text-red-600">{selectedStory.rejection_reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Story Preview */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Preview do Story</h4>
                <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                  {(selectedStory.type === 'photo' || selectedStory.type === 'text') && (
                    <img 
                      src={selectedStory.url} 
                      alt="Story"
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  )}
                  {selectedStory.type === 'video' && (
                    <video 
                      src={selectedStory.url}
                      controls
                      className="max-w-full max-h-96 rounded-lg"
                    />
                  )}
                  {selectedStory.type === 'audio' && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Volume2 className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Áudio Story</p>
                      <audio 
                        src={selectedStory.url}
                        controls
                        className="w-full max-w-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedStory.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproveStory(selectedStory.id)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    ✅ Aprovar Story
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                      setShowStoryDetails(false);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    ❌ Rejeitar Story
                  </button>
                </div>
              )}

              {/* WhatsApp Contact */}
              {selectedStory.requester_whatsapp && selectedStory.status === 'pending' && (
                <button
                  onClick={() => openWhatsApp(
                    selectedStory.requester_whatsapp, 
                    selectedStory.requester_name || selectedStory.companion_name, 
                    { 
                      plan_name: 'Story', 
                      plan_price: 0 
                    }
                  )}
                  className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors mb-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Entrar em contato via WhatsApp</span>
                </button>
              )}

              {/* View Full Size */}
              <button
                onClick={() => window.open(selectedStory.url, '_blank')}
                className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span>Ver em Tamanho Real</span>
              </button>

              {/* Remover Story */}
                  <button
                    onClick={() => {
                  setShowDeleteModal(true);
                      setShowStoryDetails(false);
                    }}
                className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>🗑️ Remover Story Permanentemente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal for Stories */}
      {showRejectModal && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Rejeitar Story</h3>
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setShowStoryDetails(true);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Por que está rejeitando o story de <strong>{selectedStory.companion_name}</strong>?
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Digite o motivo da rejeição..."
              />

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setShowStoryDetails(true);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRejectStory(selectedStory.id)}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-red-800">⚠️ Confirmar Exclusão</h3>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setShowStoryDetails(true);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Remover Story Permanentemente</p>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">
                  <strong>Atenção:</strong> Você está prestes a remover permanentemente o story de{' '}
                  <strong>{selectedStory.companion_name || 'Acompanhante'}</strong>. 
                  Esta ação não pode ser desfeita e o story será completamente excluído do sistema.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setShowStoryDetails(true);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteStory(selectedStory.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remover Definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStories; 