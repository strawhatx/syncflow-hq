import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSecurity } from './lib/security'

// Initialize security measures
initializeSecurity();

createRoot(document.getElementById("root")!).render(<App />);
