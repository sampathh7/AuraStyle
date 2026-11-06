import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (err: unknown) {
    console.error('Fatal initialization error:', err);
    container.innerHTML = `
      <div style="min-height: 100vh; background: #090D14; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; font-family: sans-serif;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Initialization Notice</h2>
        <p style="color: #94A3B8; font-size: 13px; max-width: 400px; margin-bottom: 20px;">${err instanceof Error ? err.message : String(err)}</p>
        <button onclick="window.location.reload()" style="background: #FFFC00; color: #090D14; border: none; padding: 10px 22px; border-radius: 12px; font-weight: 700; cursor: pointer;">
          Refresh Preview
        </button>
      </div>
    `;
  }
}
