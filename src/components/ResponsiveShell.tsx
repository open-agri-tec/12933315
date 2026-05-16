import React from 'react';
import Header from './Header';
import SideNav from './SideNav';
import BottomNav from './BottomNav';
import CurrentMonsterBar from './CurrentMonsterBar';

interface ResponsiveShellProps {
  children: React.ReactNode;
}

const ResponsiveShell: React.FC<ResponsiveShellProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <div className="sidebar-title">Local AI Farm</div>
        <SideNav />
      </aside>
      <div className="shell-main">
        <Header />
        <main className="shell-content">
          <CurrentMonsterBar />
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default ResponsiveShell;
