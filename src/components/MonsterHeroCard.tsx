import React from 'react';
import { CATEGORIES, Monster } from '../context/FarmContext';
import { expProgress, growthStage, moodLabel, oneLineComment } from './designUtils';
import TagChip from './TagChip';

interface MonsterHeroCardProps {
  monster: Monster | null;
  large?: boolean;
}

function categoryLabel(monster: Monster): string {
  return CATEGORIES.find(category => category.key === monster.category)?.label || 'その他';
}

const MonsterHeroCard: React.FC<MonsterHeroCardProps> = ({ monster, large = false }) => {
  if (!monster) {
    return (
      <section className={`monster-hero-card monster-hero-empty ${large ? 'monster-hero-large' : ''}`}>
        <div className="field-backdrop" />
        <div className="empty-egg" aria-hidden="true">?</div>
        <h2>まだタマゴがありません</h2>
        <p>作物・品種・圃場を登録すると、農業記録を受け取る個体が生まれます。</p>
      </section>
    );
  }

  const progress = expProgress(monster.exp);
  return (
    <section className={`monster-hero-card ${large ? 'monster-hero-large' : ''}`}>
      <div className="field-backdrop" aria-hidden="true" />
      <div className="monster-stage" aria-hidden="true">
        <div className="monster-aura-mini" />
        <div className="css-egg hero-egg" style={{ '--egg-tone': monster.visualProfile.colorTone } as React.CSSProperties}>
          <span className="egg-speckle egg-speckle-a" />
          <span className="egg-speckle egg-speckle-b" />
          <span className="egg-speckle egg-speckle-c" />
        </div>
      </div>
      <div className="monster-hero-info">
        <span className="eyebrow">Field Companion / {categoryLabel(monster)}</span>
        <h2>{monster.name}</h2>
        <div className="monster-fact-grid">
          <div><span>作物</span><strong>{monster.crop}</strong></div>
          <div><span>品種</span><strong>{monster.variety}</strong></div>
          <div><span>圃場</span><strong>{monster.fieldAddress}</strong></div>
          <div><span>作型</span><strong>{monster.cultivationType}</strong></div>
          <div><span>成長段階</span><strong>{growthStage(monster)}</strong></div>
          <div><span>気分 / 状態</span><strong>{moodLabel(monster)}</strong></div>
        </div>
        <div className="hero-exp-row">
          <span>Lv {Math.floor(monster.exp / 100) + 1}</span>
          <div className="meter-track"><i style={{ width: `${progress}%` }} /></div>
          <span>{monster.exp} exp</span>
        </div>
        <p className="monster-comment">{oneLineComment(monster)}</p>
        {monster.tastes.length > 0 && <div className="chip-list hero-tastes">{monster.tastes.slice(0, 5).map(tag => <TagChip key={tag} label={tag} />)}</div>}
      </div>
    </section>
  );
};

export default MonsterHeroCard;
