import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, Monster, useFarm } from '../context/FarmContext';

function categoryLabel(monster: Monster): string {
  return CATEGORIES.find(category => category.key === monster.category)?.label || 'その他';
}

/**
 * モンスターカードを表示するコンポーネント。
 * タマゴ期はCSSだけでタマゴ風に描画します。
 */
const MonsterCard: React.FC = () => {
  const { activeMonster } = useFarm();

  if (!activeMonster) {
    return (
      <div className="monster-card empty-monster-card">
        <div className="empty-egg" aria-hidden="true">?</div>
        <div className="monster-info">
          <h2>まだタマゴがありません</h2>
          <p>農業データを育てるために、まず栽培品種・ほ場・作型を登録してください。</p>
          <Link className="egg-create-link" to="/egg/new">タマゴの情報を入力する</Link>
        </div>
      </div>
    );
  }

  if (activeMonster.lifeStage === 'egg') {
    return (
      <div className="monster-card egg-card">
        <div className="egg-stage-mini" aria-hidden="true">
          <div className="monster-aura-mini" />
          <div
            className="css-egg"
            style={{ '--egg-tone': activeMonster.visualProfile.colorTone } as React.CSSProperties}
          >
            <span className="egg-speckle egg-speckle-a" />
            <span className="egg-speckle egg-speckle-b" />
            <span className="egg-speckle egg-speckle-c" />
          </div>
        </div>
        <div className="monster-info egg-info">
          <h2>{activeMonster.name}</h2>
          <p>{categoryLabel(activeMonster)} / {activeMonster.crop} / {activeMonster.variety}</p>
          <dl className="egg-detail-list">
            <div><dt>ほ場</dt><dd>{activeMonster.fieldAddress}</dd></div>
            <div><dt>作型</dt><dd>{activeMonster.cultivationType}</dd></div>
            <div><dt>経験値</dt><dd>{activeMonster.exp}</dd></div>
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="monster-card">
      <div className="monster-stage-mini" aria-hidden="true">
        <div className="monster-aura-mini" />
        <div className="css-monster">
          <div className="css-sprout" />
          <div className="css-leaf" />
          <div className="css-body" />
          <div className="css-eye css-eye-left" />
          <div className="css-eye css-eye-right" />
          <div className="css-mouth" />
        </div>
      </div>
      <div className="monster-info">
        <h2>育成モンスター</h2>
        <p>農業データから育つAIキャラクター</p>
      </div>
    </div>
  );
};

export default MonsterCard;
