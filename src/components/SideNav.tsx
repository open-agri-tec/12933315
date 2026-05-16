import React from 'react';
import { NavLink } from 'react-router-dom';

export const navItems = [
  { to: '/', label: 'ホーム' },
  { to: '/feed', label: 'エサ生成' },
  { to: '/feeding', label: '給餌' },
  { to: '/observe', label: '観察' },
  { to: '/logs', label: '記録' },
  { to: '/egg/new', label: '個体切替' }
];

const SideNav: React.FC = () => {
  return (
    <nav className="side-nav" aria-label="PCナビゲーション">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default SideNav;
