import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const items = [
  { to: '/', label: 'ホーム' },
  { to: '/feed', label: 'エサ生成' },
  { to: '/feeding', label: '給餌' },
  { to: '/observe', label: '観察' },
  { to: '/logs', label: '記録' }
];

const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="スマホナビゲーション">
      {items.map(item => (
        <Link key={item.to} to={item.to} className={location.pathname === item.to ? 'active' : ''}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
