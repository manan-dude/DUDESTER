// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/features/Dashboard';
import CompetitorAnalysis from './components/features/CompetitorAnalysis';
import VideoPitchAnalyzer from './components/features/VideoPitchAnalyzer';
import AIAnalyzer from './components/features/AIAnalyzer';
import AskYourStartup from './components/features/AskYourStartup';


function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ask-your-startup" element={<AskYourStartup />} />
        <Route path="/competitor-analysis" element={<CompetitorAnalysis />} />
        <Route path="/video-pitch" element={<VideoPitchAnalyzer />} />
        <Route path="/ai-analyzer" element={<AIAnalyzer />} />
      </Routes>
    </Layout>
  );
}

export default App;
