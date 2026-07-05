import React from 'react';

type Tipo = "turbo" | "padrao" | "estendida" | "fixado";

interface SubidasGridNeonProps {
  onSelect?: (tipo: Tipo) => void;
}

export function SubidasGridNeon({ onSelect }: SubidasGridNeonProps) {
  const handleSelect = (tipo: Tipo) => {
    if (onSelect) onSelect(tipo);
  };

  return (
    <div
      className="min-h-screen py-6 px-4 sm:px-5"
      style={{
        background: '#b703a0',
        fontFamily: "'Montserrat', sans-serif"
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;500;700;900&display=swap" rel="stylesheet" />
      
      <div className="max-w-[750px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Imagem decorativa */}
          <div className="hidden sm:block absolute right-[50px] -top-16 w-[180px] h-[240px] md:right-[100px] md:-top-20">
            <img
              src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761769741/c34fb101-9351-4b1d-90b3-f46c3cb5d784_dxoooe.png"
              alt="Decoração"
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(183, 3, 160, 0.6))'
              }}
            />
          </div>

          <h1 
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2"
            style={{ 
              letterSpacing: '2px',
              textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
            }}
          >
            ESCOLHA SUAS
          </h1>
          
          <div
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-4"
            style={{
              background: 'linear-gradient(180deg, #ffd1dc 0%, #ffb3c6 50%, #ff9bb3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '4px',
              textShadow: '4px 4px 8px rgba(0,0,0,0.2)',
              filter: 'drop-shadow(3px 3px 5px rgba(0,0,0,0.3))'
            }}
          >
            SUBIDAS
          </div>
          
          <div
            className="text-sm sm:text-base md:text-lg font-bold text-white mt-5"
            style={{ letterSpacing: '2px' }}
          >
            SELECIONE CLICANDO EM CIMA DA OPÇÃO ABAIXO
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 mt-8">
          {/* Card Turbo */}
          <button
            onClick={() => handleSelect('turbo')}
            className="rounded-[25px] p-3 sm:p-6 relative shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            style={{ background: '#ffd6ff' }}
          >
            <div
              className="text-center py-2 sm:py-3 rounded-[15px] font-black text-sm sm:text-2xl mb-4 sm:mb-6"
              style={{
                background: '#ff02de',
                color: '#fdf9fb',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(255,2,222,0.4)',
                marginTop: '-35px',
                marginBottom: '20px'
              }}
            >
              TURBO
            </div>
            <div className="flex items-center justify-start gap-2 sm:gap-4 mb-2 sm:mb-4 pl-2 sm:pl-4">
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761770234/a43bf788-e04f-468d-95ac-c228558bebb6_rmpzu2.png"
                alt="Turbo"
                className="w-12 h-12 sm:w-24 sm:h-24 object-contain"
                style={{ display: 'block' }}
              />
              <div className="flex items-baseline gap-0">
                <div
                  className="text-4xl sm:text-8xl font-bold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  1
                </div>
                <div
                  className="text-4xl sm:text-8xl font-bold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  H
                </div>
                <div
                  className="text-xl sm:text-3xl font-semibold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  r
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span
                className="text-3xl sm:text-5xl"
                style={{ color: '#b703a0', fontWeight: '500' }}
              >
                80
              </span>
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761963965/ChatGPT_Image_31_de_out._de_2025_23_25_18_jp6e34.png"
                alt="Rositas"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <div
              className="text-base sm:text-lg font-bold italic mb-4"
              style={{ color: '#b703a0' }}
            >
              80 ROSITAS
            </div>
            <div
              className="text-[10px] sm:text-sm font-bold uppercase tracking-wider leading-relaxed mt-2 sm:mt-4"
              style={{ color: '#b703a0', letterSpacing: '1px', lineHeight: '1.4' }}
            >
              1 hora no topo por 80 rositas. Ideal para horário de pico
            </div>
          </button>

          {/* Card Padrão */}
          <button
            onClick={() => handleSelect('padrao')}
            className="rounded-[25px] p-3 sm:p-6 relative shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            style={{ background: '#ffd6ff' }}
          >
            <div
              className="text-center py-2 sm:py-3 rounded-[15px] font-black text-sm sm:text-2xl mb-4 sm:mb-6"
              style={{
                background: '#ff02de',
                color: '#fdf9fb',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(255,2,222,0.4)',
                marginTop: '-35px',
                marginBottom: '20px'
              }}
            >
              PADRÃO
            </div>
            <div className="flex items-center justify-start gap-2 sm:gap-4 mb-2 sm:mb-4 pl-2 sm:pl-4">
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761763743/Untitled_design_95_eshzcf.png"
                alt="Padrão"
                className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                style={{ display: 'block' }}
              />
              <div className="flex items-baseline gap-0">
                <div
                  className="text-4xl sm:text-8xl font-bold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  3
                </div>
                <div
                  className="text-4xl sm:text-8xl font-bold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  H
                </div>
                <div
                  className="text-xl sm:text-3xl font-semibold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  rs
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span
                className="text-3xl sm:text-5xl"
                style={{ color: '#b703a0', fontWeight: '500' }}
              >
                180
              </span>
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761963965/ChatGPT_Image_31_de_out._de_2025_23_25_18_jp6e34.png"
                alt="Rositas"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <div
              className="text-sm sm:text-lg font-bold italic mb-2 sm:mb-4"
              style={{ color: '#b703a0' }}
            >
              180 ROSITAS
            </div>
            <div
              className="text-[10px] sm:text-sm font-bold uppercase tracking-wider leading-relaxed mt-2 sm:mt-4"
              style={{ color: '#b703a0', letterSpacing: '1px', lineHeight: '1.4' }}
            >
              Ideal para cobrir o horário de pico inteiro ex: 19:00 às 22:00
            </div>
          </button>

          {/* Card Subida Estendida */}
          <button
            onClick={() => handleSelect('estendida')}
            className="rounded-[25px] p-3 sm:p-6 relative shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            style={{ background: '#ffd6ff' }}
          >
            <div
              className="text-center py-2 sm:py-3 rounded-[15px] font-black text-sm sm:text-2xl mb-4 sm:mb-6"
              style={{
                background: '#ff02de',
                color: '#fdf9fb',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(255,2,222,0.4)',
                marginTop: '-90px',
                marginBottom: '70px'
              }}
            >
              SUBIDA ESTENDIDA
            </div>
            <div className="flex items-center justify-start gap-2 sm:gap-4 mb-2 sm:mb-4 pl-2 sm:pl-4">
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761763744/Untitled_design_94_v6moy8.png"
                alt="Subida Estendida"
                className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                style={{ display: 'block' }}
              />
              <div className="flex items-baseline gap-0">
                <div
                  className="text-4xl sm:text-8xl font-bold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  6
                </div>
                <div
                  className="text-4xl sm:text-8xl font-bold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  H
                </div>
                <div
                  className="text-xl sm:text-3xl font-semibold"
                  style={{ color: '#b703a0', lineHeight: '1' }}
                >
                  rs
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span
                className="text-3xl sm:text-5xl"
                style={{ color: '#b703a0', fontWeight: '500' }}
              >
                250
              </span>
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761963965/ChatGPT_Image_31_de_out._de_2025_23_25_18_jp6e34.png"
                alt="Rositas"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <div
              className="text-sm sm:text-lg font-bold italic mb-2 sm:mb-4"
              style={{ color: '#b703a0' }}
            >
              250 ROSITAS
            </div>
            <div
              className="text-[10px] sm:text-sm font-bold uppercase tracking-wider leading-relaxed mt-2 sm:mt-4"
              style={{ color: '#b703a0', letterSpacing: '1px', lineHeight: '1.4' }}
            >
              Mais tempo no topo para se destacar
            </div>
          </button>

          {/* Card Destaque */}
          <button
            onClick={() => handleSelect('fixado')}
            className="rounded-[25px] p-3 sm:p-6 relative shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2 sm:border-8"
            style={{ background: '#c902c1', borderColor: '#fdf9fb' }}
          >
            <div
              className="text-center py-2 sm:py-3 rounded-[15px] font-black text-sm sm:text-2xl"
              style={{
                background: '#ff02de',
                color: '#fdf9fb',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(255,2,222,0.4)',
                marginTop: '-55px',
                marginBottom: '0px'
              }}
            >
              DESTAQUE
            </div>
            <div className="flex justify-center mb-0">
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761770804/9fe6aec9-758f-42f9-819c-09aacbd7d86e_rym24j.png"
                alt="Fixado 24hrs"
                className="w-32 h-32 sm:w-56 sm:h-56 object-contain"
                style={{ display: 'block' }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4" style={{ marginTop: '-10px' }}>
              <span
                className="text-3xl sm:text-5xl"
                style={{ color: '#ffff00', fontWeight: '500' }}
              >
                1000
              </span>
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1761963965/ChatGPT_Image_31_de_out._de_2025_23_25_18_jp6e34.png"
                alt="Rositas"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <div
              className="text-sm sm:text-lg font-bold italic mb-2 sm:mb-4"
              style={{ color: '#ffff00' }}
            >
              1000 ROSITAS
            </div>
            <div
              className="text-[10px] sm:text-sm font-bold uppercase tracking-wider leading-relaxed mt-2 sm:mt-4"
              style={{ color: '#ffff00', letterSpacing: '1px', lineHeight: '1.4' }}
            >
              Seja o destaque da sua cidade e brilhe um dia inteiro
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubidasGridNeon;