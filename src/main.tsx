import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Script para hacer redondo el favicon de forma dinámica en el navbar
const setRoundFavicon = (src: string) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    // Para asegurar un circulo perfecto tomamos el lado más pequeño
    const minDim = Math.min(img.width, img.height);
    canvas.width = minDim;
    canvas.height = minDim;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Dibujamos un circulo
    ctx.beginPath();
    ctx.arc(minDim/2, minDim/2, minDim/2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    // Centramos la imagen en caso de no ser cuadrada
    const dx = (minDim - img.width) / 2;
    const dy = (minDim - img.height) / 2;
    ctx.drawImage(img, dx, dy, img.width, img.height);
    
    // Remueve favicons anteriores
    let link = document.querySelector('link[rel~="icon"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = canvas.toDataURL('image/png');
  };
};
setRoundFavicon('/images.png');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
