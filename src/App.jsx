import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './styles/styles.css';
import MainLayout from './layouts/MainLayout.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// App deliberately subscribes to NO Redux state: anything it read here (scroll
// position, search text, progress) would re-render the entire route tree.
// Search lives in <Header>, scroll progress in utils/scrollProgress.js.

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('search-input');
        if (input) {
          input.focus();
          input.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let idx = 0;

    const handleKeyDown = (e) => {
      if (e.key === code[idx]) {
        idx++;
        if (idx === code.length) {
          idx = 0;
          showEasterEgg();
        }
      } else {
        idx = e.key === code[0] ? 1 : 0;
      }
    };

    const showEasterEgg = () => {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%,-50%);
        background: #050507; border: 2px solid #00ffd1;
        border-radius: 16px; padding: 32px 40px;
        z-index: 9999; text-align: center;
        box-shadow: 0 0 60px rgba(0,255,209,0.3);
        font-family: 'Syne', sans-serif;
        animation: fadeUp 0.3s ease both;
      `;
      el.innerHTML = `
        <div style="font-size:3rem;margin-bottom:12px">⚛️🔥</div>
        <div style="font-size:1.2rem;font-weight:800;color:#00ffd1;margin-bottom:8px">You know the Konami Code!</div>
        <div style="font-size:0.85rem;color:#7070a0">Redux + Category Components = Senior Developer! 🚀</div>
        <button onclick="this.closest('div').remove()" style="margin-top:20px;background:#00ffd1;color:#000;border:none;border-radius:8px;padding:8px 24px;font-family:'Space Mono',monospace;font-size:0.8rem;cursor:pointer;font-weight:700">AWESOME</button>
      `;
      document.body.appendChild(el);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Deep links (#s<id>) are scrolled to by the topic page itself
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    console.log('%c⚛ React Universe with Redux loaded', 'color: #00ffd1; font-size: 16px; font-family: monospace;');
    console.log('%cCtrl+K to search, Konami code for a surprise 😉', 'color: #7070a0; font-family: monospace;');
  }, []);

  return (
    <MainLayout>
      <ErrorBoundary resetKey={location.pathname}>
        <AppRoutes />
      </ErrorBoundary>
    </MainLayout>
  );
}
