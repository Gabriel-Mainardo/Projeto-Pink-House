CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  acompanhante_id UUID NOT NULL REFERENCES acompanhantes(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (client_id, acompanhante_id)
);

CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_acompanhante_id ON conversations(acompanhante_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations" ON conversations
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = acompanhante_id);

CREATE POLICY "Participants can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = acompanhante_id);

CREATE POLICY "Participants can update conversations" ON conversations
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = acompanhante_id) WITH CHECK (auth.uid() = client_id OR auth.uid() = acompanhante_id);


CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages in their conversations" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Participants can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Participants can mark messages as read" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

-- Função para atualizar `updated_at` automaticamente nas conversas
CREATE OR REPLACE FUNCTION update_conversation_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_conversation_updated_at();

-- Função para atualizar `last_message_at` na conversa quando uma nova mensagem é inserida
CREATE OR REPLACE FUNCTION update_last_message_at_on_new_message() RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_at
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_message_at_on_new_message();

