import React from 'react';

/**
 * モンスターカードを表示するコンポーネント。
 * 外部アイコンライブラリに依存せず、CSSだけで葉のある小型モンスターを描画します。
 */
const MonsterCard: React.FC = () => {
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
