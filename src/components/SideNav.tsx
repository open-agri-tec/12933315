import React from 'react';
import { NavLink } from 'react-router-dom';

export const navItems = [
  { to: '/', label: 'ホーム' },
  { to: '/egg/new', label: 'タマゴ / 個体' },
  { to: '/feed', label: 'エサ生成' },
  { to: '/', label: '給餌' },
  { to: '/observe', label: '観察' },
  { to: '/logs', label: '記録' },
  { to: '/logs', label: '設定' }
];

const SideNav: React.FC = () => {
  return (
    <nav className="side-nav" aria-label="PCナビゲーション">
      {navItems.map((item, index) => (
        <NavLink
          key={`${item.label}-${index}`}
          to={item.to}
          className={({ isActive }) => isActive && (item.to !== '/' || item.label === 'ホーム') ? 'active' : ''}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default SideNav;
