import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Em produção, remover funções de debug

createRoot(document.getElementById("root")!).render(<App />);
