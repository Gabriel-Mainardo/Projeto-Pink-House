import React from 'react';
import { Link } from 'react-router-dom';

const SimpleAdminDashboard = () => {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ color: '#d946ef', fontSize: '2.5rem', marginBottom: '10px' }}>
            🌹 Painel Administrativo Faixa Rosa
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Versão Simplificada - Teste de Funcionalidade
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ color: '#d946ef', marginBottom: '15px' }}>📊 Estatísticas</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#333' }}>25</p>
                <p style={{ color: '#666', margin: '0' }}>Total Acompanhantes</p>
              </div>
              <div style={{ fontSize: '2rem' }}>👥</div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ color: '#f59e0b', marginBottom: '15px' }}>⏳ Cadastros Pendentes</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#333' }}>8</p>
                <p style={{ color: '#666', margin: '0' }}>Aguardando Aprovação</p>
              </div>
              <div style={{ fontSize: '2rem' }}>📋</div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ color: '#10b981', marginBottom: '15px' }}>✅ Novos este Mês</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#333' }}>12</p>
                <p style={{ color: '#666', margin: '0' }}>Aprovados em Novembro</p>
              </div>
              <div style={{ fontSize: '2rem' }}>🆕</div>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>🎉 Painel Funcionando!</h2>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
            Esta é uma versão simplificada do painel administrativo. 
            Se você está vendo esta página, significa que o roteamento está funcionando corretamente.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/" 
              style={{ 
                backgroundColor: '#d946ef', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              🏠 Ir para o Site
            </Link>
            
            <Link 
              to="/admin-login" 
              style={{ 
                backgroundColor: '#6b7280', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              🔐 Página de Login
            </Link>
          </div>

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>🔧 Informações de Debug:</h4>
            <p style={{ color: '#666', margin: '5px 0' }}>Rota atual: /admin-dashboard</p>
            <p style={{ color: '#666', margin: '5px 0' }}>Timestamp: {new Date().toLocaleString()}</p>
            <p style={{ color: '#666', margin: '5px 0' }}>Status: ✅ Funcionando</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard; 