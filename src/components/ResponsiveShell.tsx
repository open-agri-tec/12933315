import React from 'react';
import EnvironmentHeader from './EnvironmentHeader';
import SideNav from './SideNav';
import BottomNav from './BottomNav';

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
        <EnvironmentHeader />
        <main className="shell-content">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default ResponsiveShell;
