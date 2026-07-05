export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string; // ID do remetente (cliente ou acompanhante)
  receiver_id: string; // ID do destinatário (cliente ou acompanhante)
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  client_id: string; // ID do cliente
  acompanhante_id: string; // ID da acompanhante
  last_message_at: string;
  created_at: string;
  updated_at: string;
}
