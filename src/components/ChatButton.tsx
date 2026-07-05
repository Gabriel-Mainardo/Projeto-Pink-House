import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import { AskAnittaButton } from './AskAnittaButton';

const ChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompanion, setIsCompanion] = useState(false);

  // Verificar se é acompanhante
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsCompanion(parsedUser.type === 'companion');
      } catch {
        setIsCompanion(false);
      }
    }
  }, []);

  return (
    <>
      {/* Botão Flutuante de Chat */}
      {!isOpen && (
        <AskAnittaButton onClick={() => setIsOpen(true)} />
      )}

      {/* Janela de Chat */}
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} isCompanion={isCompanion} />
    </>
  );
};

export default ChatButton;
