import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import FeedingPage from './pages/FeedingPage';
import ObservePage from './pages/ObservePage';
import LogPage from './pages/LogPage';
import EggCreatePage from './pages/EggCreatePage';
import ResponsiveShell from './components/ResponsiveShell';
import { FarmProvider } from './context/FarmContext';

const App: React.FC = () => {
  return (
    <FarmProvider>
      <Router>
        <ResponsiveShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/egg/new" element={<EggCreatePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/feeding" element={<FeedingPage />} />
            <Route path="/observe" element={<ObservePage />} />
            <Route path="/logs" element={<LogPage />} />
          </Routes>
        </ResponsiveShell>
      </Router>
    </FarmProvider>
  );
};

export default App;
