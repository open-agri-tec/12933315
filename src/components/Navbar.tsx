import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

/**
 * スマホ向けの下部ナビゲーションバー。
 * 各ページへのリンクを大きめのボタンとして配置します。
 */
const Navbar: React.FC = () => {
  const location = useLocation();

  // Determine active path for styling
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={isActive('/') ? 'active' : ''}>
        ホーム
      </Link>
      {/* エサ生成ページ。元のラベル「エサ」を具体化 */}
      <Link to="/feed" className={isActive('/feed') ? 'active' : ''}>
        エサ生成
      </Link>
      <Link to="/observe" className={isActive('/observe') ? 'active' : ''}>
        観察
      </Link>
      <Link to="/logs" className={isActive('/logs') ? 'active' : ''}>
        記録
      </Link>
    </nav>
  );
};

export default Navbar;