import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const actions = [
  { to: '/feed', label: 'エサ生成', detail: '作業メモを情報のエサへ', tone: 'growth' },
  { to: '/feeding', label: '給餌', detail: '未給餌エサを与える', tone: 'feed' },
  { to: '/observe', label: '観察', detail: '内部軸と性質を見る', tone: 'growth' },
  { to: '/logs', label: '記録', detail: '反応と経験値を検証', tone: 'neutral' },
  { to: '/logs#tools', label: '設定', detail: '保存・書き出し・初期化', tone: 'neutral' },
  { to: '/egg/new', label: '個体切替', detail: 'タマゴと圃場情報', tone: 'neutral' }
];

const MainActionGrid: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const location = useLocation();
  return (
    <nav className="main-action-grid" aria-label="主要操作">
      {actions.map(action => {
        const isActive = location.pathname === action.to || (action.to.includes('#') && location.pathname === action.to.split('#')[0]);
        const className = `action-card action-${action.tone} ${isActive ? 'active' : ''}`.trim();
        return disabled ? (
          <span key={action.label} className={`${className} disabled-action`}>
            <strong>{action.label}</strong><small>{action.detail}</small>
          </span>
        ) : (
          <Link key={action.label} to={action.to} className={className}>
            <strong>{action.label}</strong><small>{action.detail}</small>
          </Link>
        );
      })}
    </nav>
  );
};

export default MainActionGrid;
