import React from 'react';
import { CATEGORIES, Monster } from '../context/FarmContext';

interface MonsterMiniCardProps {
  monster: Monster;
}

const MonsterMiniCard: React.FC<MonsterMiniCardProps> = ({ monster }) => {
  const category = CATEGORIES.find(item => item.key === monster.category)?.label || 'その他';

  return (
    <article className="monster-mini-card">
      <div className="mini-egg" style={{ '--egg-tone': monster.visualProfile.colorTone } as React.CSSProperties} aria-hidden="true" />
      <div>
        <strong>{monster.name}</strong>
        <span>{category} / {monster.crop || '作物未設定'}</span>
      </div>
    </article>
  );
};

export default MonsterMiniCard;
