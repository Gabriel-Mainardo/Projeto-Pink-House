import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, Search, ArrowLeft, RefreshCw, AlertTriangle, Clock, CheckCheck, Filter, Bell, TrendingUp, Users, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

type ConvStatus = 'alert' | 'waiting' | 'active' | 'resolved';
type FilterType = 'all' | 'alert' | 'waiting' | 'active' | 'resolved';

interface ConvSummary {
  id: string;
  client_id: string;
  companion_id: string;
  companion_name: string;
  companion_image: string;
  companion_auth_user_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  last_message_text: string | null;
  last_message_at: string | null;
  last_sender_id: string | null;
  updated_at: string;
  total_messages: number;
  unread_by_companion: number;
  hours_since_last: number;
  status: ConvStatus;
}

interface AdminMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

// ============================================
// HELPERS
// ============================================

const hoursSince = (dateStr: string | null): number => {
  if (!dateStr) return 9999;
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
};

const deriveStatus = (conv: { last_sender_id: string | null; companion_auth_user_id: string | null; companion_id: string; unread_by_companion: number; hours_since_last: number; total_messages: number }): ConvStatus => {
  const lastWasClient = conv.last_sender_id && conv.last_sender_id !== conv.companion_auth_user_id && conv.last_sender_id !== conv.companion_id;

  // Alert: client waiting 6h+ without reply
  if (lastWasClient && conv.hours_since_last >= 6) return 'alert';
  // Waiting: client waiting < 6h
  if (lastWasClient && conv.unread_by_companion > 0) return 'waiting';
  // Active: recent back-and-forth
  if (conv.hours_since_last < 24 && conv.total_messages > 0) return 'active';
  // Resolved: no activity in 24h+
  return 'resolved';
};

const statusConfig: Record<ConvStatus, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  alert:    { label: 'Urgente',   color: 'text-red-600',    bg: 'bg-red-50 border-red-200',     icon: AlertTriangle },
  waiting:  { label: 'Aguardando', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  active:   { label: 'Ativo',     color: 'text-green-600',  bg: 'bg-green-50 border-green-200', icon: CheckCheck },
  resolved: { label: 'Inativo',   color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200',   icon: CheckCheck },
};

const formatTimeAgo = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const h = hoursSince(dateStr);
  if (h < 1) return `${Math.floor(h * 60)}min`;
  if (h < 24) return `${Math.floor(h)}h`;
  if (h < 48) return 'Ontem';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const buildWhatsAppUrl = (phone: string, clientName: string): string | null => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;

  const normalizedPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const text = encodeURIComponent(
    'PinkHouse: Você recebeu \numa mensagem agora 💬\nPode ser um cliente pra hoje 💰\nResponda rápido: https://pinkhouse.com/chat'
  );

  return `https://wa.me/${normalizedPhone}?text=${text}`;
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M19.11 17.33c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.3-.79-.7-1.32-1.56-1.48-1.82-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.01-.22-.54-.45-.47-.61-.48h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.26s.98 2.62 1.12 2.8c.13.18 1.91 2.91 4.62 4.08.65.28 1.15.45 1.54.57.65.21 1.23.18 1.69.11.51-.08 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31Z" />
    <path d="M16.01 3.2c-7.06 0-12.78 5.72-12.78 12.78 0 2.24.58 4.43 1.68 6.36L3 29l6.85-1.8a12.76 12.76 0 0 0 6.16 1.57h.01c7.05 0 12.78-5.73 12.78-12.78 0-3.42-1.33-6.63-3.75-9.04A12.7 12.7 0 0 0 16.01 3.2Zm0 23.41h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.06 1.06 1.08-3.96-.25-.41a10.58 10.58 0 0 1-1.62-5.61c0-5.87 4.78-10.65 10.66-10.65 2.84 0 5.51 1.11 7.52 3.12a10.57 10.57 0 0 1 3.12 7.53c0 5.88-4.78 10.65-10.65 10.65Z" />
  </svg>
);

// ============================================
// COMPONENT
// ============================================

const AdminChat = () => {
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedConvRef = useRef<Set<string>>(new Set());

  const selectedConv = conversations.find(c => c.id === selectedConvId) || null;
  const selectedConvWhatsAppUrl = selectedConv?.client_phone
    ? buildWhatsAppUrl(selectedConv.client_phone, selectedConv.client_name)
    : null;

  // ---- Load summary layer (lightweight) ----
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch conversations with companion join
      const { data: convs, error } = await supabase
        .from('conversations')
        .select(`
          *,
          companion:acompanhantes!companion_id (
            id, name, display_name, image, auth_user_id
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!convs || convs.length === 0) { setConversations([]); setLoading(false); return; }

      // 2. Batch: get all client IDs and fetch once
      const clientIds = [...new Set(convs.map((c: any) => c.client_id))];
      const { data: clients } = await supabase
        .from('clientes')
        .select('id, name, email, phone')
        .in('id', clientIds);
      const clientMap = new Map((clients || []).map(c => [c.id, c]));

      // 3. Batch: count messages + unread per conversation using aggregation
      const convIds = convs.map((c: any) => c.id);
      const [countRes, unreadRes, lastMsgRes] = await Promise.all([
        supabase.from('messages').select('conversation_id', { count: 'exact', head: false }).in('conversation_id', convIds),
        supabase.from('messages').select('conversation_id').in('conversation_id', convIds).eq('read', false),
        supabase.from('messages').select('conversation_id, sender_id, created_at').in('conversation_id', convIds).order('created_at', { ascending: false }),
      ]);

      // Aggregate counts
      const totalMap = new Map<string, number>();
      const unreadMap = new Map<string, number>();
      const lastSenderMap = new Map<string, string>();

      (countRes.data || []).forEach((m: any) => {
        totalMap.set(m.conversation_id, (totalMap.get(m.conversation_id) || 0) + 1);
      });
      (unreadRes.data || []).forEach((m: any) => {
        unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
      });
      (lastMsgRes.data || []).forEach((m: any) => {
        if (!lastSenderMap.has(m.conversation_id)) {
          lastSenderMap.set(m.conversation_id, m.sender_id);
        }
      });

      // 4. Build summaries
      const summaries: ConvSummary[] = convs.map((conv: any) => {
        const client = clientMap.get(conv.client_id);
        const hSince = hoursSince(conv.last_message_at);
        const companionAuthId = conv.companion?.auth_user_id || null;
        const companionTableId = conv.companion?.id || conv.companion_id;
        const lastSender = lastSenderMap.get(conv.id) || null;
        const unread = unreadMap.get(conv.id) || 0;
        const total = totalMap.get(conv.id) || 0;

        const base = {
          id: conv.id,
          client_id: conv.client_id,
          companion_id: conv.companion_id,
          companion_name: conv.companion?.display_name || conv.companion?.name || 'Acompanhante',
          companion_image: conv.companion?.image || '/default-profile.png',
          companion_auth_user_id: companionAuthId,
          client_name: client?.name || 'Cliente',
          client_email: client?.email || '',
          client_phone: (client as any)?.phone || '',
          last_message_text: conv.last_message_text,
          last_message_at: conv.last_message_at,
          last_sender_id: lastSender,
          updated_at: conv.updated_at,
          total_messages: total,
          unread_by_companion: unread,
          hours_since_last: hSince,
          status: 'active' as ConvStatus,
        };
        base.status = deriveStatus({ ...base });
        return base;
      });

      // Sort: alerts first, then waiting, then active, then resolved
      const order: Record<ConvStatus, number> = { alert: 0, waiting: 1, active: 2, resolved: 3 };
      summaries.sort((a, b) => order[a.status] - order[b.status] || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setConversations(summaries);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ---- Lazy load messages only when conversation is opened ----
  const openConversation = useCallback(async (convId: string) => {
    setSelectedConvId(convId);
    setLoadingMessages(true);
    setMessages([]);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      loadedConvRef.current.add(convId);
    }
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ---- Send as companion ----
  const sendAsCompanion = async () => {
    if (!selectedConv || !messageText.trim() || sending) return;
    const senderId = selectedConv.companion_auth_user_id || selectedConv.companion_id;
    setSending(true);

    try {
      const response = await fetch('/.netlify/functions/admin-send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConv.id,
          sender_id: senderId,
          text: messageText.trim(),
          admin_key: 'pinkhouse-admin-2024'
        })
      });
      const result = await response.json();
      if (result.success) {
        const sentText = messageText.trim();
        setMessageText('');
        // Append locally instead of refetching
        setMessages(prev => [...prev, {
          id: result.message?.id || crypto.randomUUID(),
          conversation_id: selectedConv.id,
          sender_id: senderId,
          text: sentText,
          read: false,
          created_at: new Date().toISOString()
        }]);
        // Update summary
        setConversations(prev => prev.map(c =>
          c.id === selectedConv.id
            ? { ...c, last_message_text: sentText, last_message_at: new Date().toISOString(), last_sender_id: senderId, status: 'active' as ConvStatus, hours_since_last: 0 }
            : c
        ));
      } else {
        alert('Erro ao enviar: ' + (result.error || 'Tente novamente'));
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      alert('Erro ao enviar mensagem. Verifique a conexão.');
    }
    setSending(false);
  };

  // ---- Filters ----
  const counts = { all: conversations.length, alert: 0, waiting: 0, active: 0, resolved: 0 };
  conversations.forEach(c => { counts[c.status]++; });

  const filtered = conversations.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.companion_name.toLowerCase().includes(s) || c.client_name.toLowerCase().includes(s) || c.client_email.toLowerCase().includes(s);
    }
    return true;
  });

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-4">
      {/* ====== DASHBOARD SUMMARY CARDS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Users} label="Total Conversas" value={counts.all} color="text-gray-700" bg="bg-gray-50" />
        <SummaryCard icon={AlertTriangle} label="Urgentes" value={counts.alert} color="text-red-600" bg="bg-red-50" pulse={counts.alert > 0} />
        <SummaryCard icon={Clock} label="Aguardando" value={counts.waiting} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard icon={TrendingUp} label="Ativos Hoje" value={counts.active} color="text-green-600" bg="bg-green-50" />
      </div>

      {/* ====== ALERT BANNER ====== */}
      {counts.alert > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl animate-pulse">
          <Bell className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-red-700">
            {counts.alert} conversa{counts.alert > 1 ? 's' : ''} com cliente esperando há mais de 6h sem resposta!
          </span>
          <button onClick={() => setFilter('alert')} className="ml-auto text-xs text-red-600 underline font-medium">Ver urgentes</button>
        </div>
      )}

      {/* ====== FILTER PILLS ====== */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-gray-400" />
        {(['all', 'alert', 'waiting', 'active', 'resolved'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filter === f
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Todos' : statusConfig[f].label} ({counts[f]})
          </button>
        ))}
      </div>

      {/* ====== CHAT AREA ====== */}
      <div className="flex h-[550px] border border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* ---- Sidebar ---- */}
        <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-200`}>
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-bold text-gray-700">Conversas ({filtered.length})</span>
              <button onClick={loadConversations} className="ml-auto text-gray-400 hover:text-pink-500">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300 focus:border-pink-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Carregando resumos...</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Nenhuma conversa</div>
            ) : (
              filtered.map(conv => {
                const cfg = statusConfig[conv.status];
                const StatusIcon = cfg.icon;
                const clientWhatsAppUrl = conv.client_phone ? buildWhatsAppUrl(conv.client_phone, conv.client_name) : null;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`w-full p-3 flex items-start gap-2.5 hover:bg-gray-50 transition-colors text-left border-b border-l-[3px] ${
                      selectedConvId === conv.id ? 'bg-pink-50 border-l-pink-500' : conv.status === 'alert' ? 'border-l-red-500 bg-red-50/30' : conv.status === 'waiting' ? 'border-l-amber-400' : 'border-l-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.companion_image}
                        alt={conv.companion_name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }}
                      />
                      {conv.unread_by_companion > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread_by_companion > 9 ? '9+' : conv.unread_by_companion}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-800 truncate">{conv.companion_name}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatTimeAgo(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-[10px] text-pink-500 font-medium truncate">
                        Cliente: {conv.client_name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {conv.last_message_text || 'Sem mensagens'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold ${cfg.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {cfg.label}
                        </span>
                        <span className="text-[9px] text-gray-400">{conv.total_messages} msgs</span>
                        {clientWhatsAppUrl ? (
                          <a
                            href={clientWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={`WhatsApp de ${conv.client_name}`}
                            className="ml-auto inline-flex items-center gap-1 px-1.5 py-1 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-md text-[8px] font-bold transition-colors flex-shrink-0"
                          >
                            <WhatsAppIcon className="w-2.5 h-2.5" />
                            WhatsApp
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            title={`Cliente ${conv.client_name} sem telefone cadastrado`}
                            className="ml-auto inline-flex items-center gap-1 px-1.5 py-1 bg-gray-200 text-gray-400 rounded-md text-[8px] font-bold cursor-not-allowed flex-shrink-0"
                          >
                            <WhatsAppIcon className="w-2.5 h-2.5" />
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ---- Message Panel (lazy loaded) ---- */}
        <div className={`${selectedConv ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
                <button onClick={() => { setSelectedConvId(null); setMessages([]); }} className="md:hidden text-gray-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={selectedConv.companion_image}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800 truncate">{selectedConv.companion_name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${statusConfig[selectedConv.status].bg} ${statusConfig[selectedConv.status].color}`}>
                      {statusConfig[selectedConv.status].label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Cliente: {selectedConv.client_name} · {selectedConv.total_messages} msgs · Última: {formatTimeAgo(selectedConv.last_message_at)}
                  </p>
                </div>
                {selectedConvWhatsAppUrl ? (
                  <a
                    href={selectedConvWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`WhatsApp de ${selectedConv.client_name}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-lg transition-colors text-[11px] font-semibold flex-shrink-0"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    title={`Cliente ${selectedConv.client_name} sem telefone cadastrado`}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-200 text-gray-400 rounded-lg text-[11px] font-semibold cursor-not-allowed flex-shrink-0"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                )}
                <button
                  onClick={() => openConversation(selectedConv.id)}
                  className="text-gray-400 hover:text-pink-500"
                  title="Recarregar"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Carregando mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Nenhuma mensagem nesta conversa
                  </div>
                ) : (
                  messages.map(msg => {
                    const isCompanion = msg.sender_id === selectedConv.companion_auth_user_id ||
                      msg.sender_id === selectedConv.companion_id;
                    return (
                      <div key={msg.id} className={`flex ${isCompanion ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          isCompanion
                            ? 'bg-pink-500 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}>
                          <p className={`text-[9px] font-bold mb-0.5 ${isCompanion ? 'text-pink-100' : 'text-gray-400'}`}>
                            {isCompanion ? selectedConv.companion_name : selectedConv.client_name}
                          </p>
                          <p>{msg.text}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isCompanion ? 'text-pink-200' : 'text-gray-400'}`}>
                            <span className="text-[9px]">
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isCompanion && msg.read && <CheckCheck className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <p className="text-[10px] text-amber-600 font-medium mb-1.5 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Respondendo como: <strong>{selectedConv.companion_name}</strong>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAsCompanion()}
                    placeholder={`Responder como ${selectedConv.companion_name}...`}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  />
                  <button
                    onClick={sendAsCompanion}
                    disabled={!messageText.trim() || sending}
                    className="w-9 h-9 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Central de Mensagens</p>
              <p className="text-xs mt-1">Selecione uma conversa para visualizar e responder</p>
              <p className="text-[10px] mt-0.5 text-gray-300">Mensagens carregam sob demanda ao abrir</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const SummaryCard = ({ icon: Icon, label, value, color, bg, pulse }: { icon: any; label: string; value: number; color: string; bg: string; pulse?: boolean }) => (
  <div className={`${bg} rounded-xl p-3 border border-gray-100 ${pulse ? 'animate-pulse' : ''}`}>
    <div className="flex items-center justify-between mb-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
  </div>
);

export default AdminChat;


