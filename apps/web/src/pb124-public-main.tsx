import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import MobileContribute from './pages/MobileContribute';

const root = document.getElementById('root');
if (!root) throw new Error('PB124 public root element not found.');

createRoot(root).render(
  <StrictMode>
    <MobileContribute />
  </StrictMode>,
);
