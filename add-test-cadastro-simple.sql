INSERT INTO cadastros_pendentes (
  name,
  email,
  phone,
  age,
  location,
  image,
  services,
  description,
  price_per_hour,
  status,
  submitted_at
) VALUES (
  'Gabriela',
  'gabriela.recife@exemplo.com',
  '(81) 99999-8888',
  23,
  'Boa Viagem, Recife',
  'https://images.unsplash.com/photo-1494790108755-2616b332c74c?w=400&h=500&fit=crop&crop=face',
  '{"Acompanhante de luxo", "Jantar romântico", "Eventos sociais"}',
  'Acompanhante carinhosa e educada, ideal para eventos sociais e jantares românticos.',
  '200',
  'pending',
  NOW()
);