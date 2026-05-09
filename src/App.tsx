import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import ObservePage from './pages/ObservePage';
import LogPage from './pages/LogPage';
import EggCreatePage from './pages/EggCreatePage';
import Navbar from './components/Navbar';
import Header from './components/Header';
import { FarmProvider } from './context/FarmContext';

// Main application component containing the router and navigation.
const App: React.FC = () => {
  return (
    <FarmProvider>
      <Router>
        <div className="app-container">
          {/* アプリ共通ヘッダー */}
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/egg/new" element={<EggCreatePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/observe" element={<ObservePage />} />
            {/* 記録ページは複数件のログを扱うため複数形に */}
            <Route path="/logs" element={<LogPage />} />
          </Routes>
          {/* Persistent bottom navigation bar */}
          <Navbar />
        </div>
      </Router>
    </FarmProvider>
  );
};

export default App;