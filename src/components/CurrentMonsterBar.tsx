import React from 'react';
import { Link } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';

function growthStage(exp: number, lifeStage: string): string {
  if (lifeStage === 'egg') return 'タマゴ';
  if (exp >= 90) return 'コンバート準備';
  if (exp >= 48) return '成長体';
  if (exp >= 18) return '幼体';
  return '卵期';
}

function moodLabel(lastReaction?: string): string {
  if (lastReaction === '大好物') return 'ごきげん';
  if (lastReaction === '苦手') return '警戒中';
  if (lastReaction === '普通') return 'おだやか';
  return '情報を待っています';
}

const CurrentMonsterBar: React.FC = () => {
  const { state, activeMonster, switchActiveMonster } = useFarm();
  const canSwitch = state.monsters.length >= 2;
  const index = activeMonster ? state.monsters.findIndex(monster => monster.id === activeMonster.id) : -1;

  if (!activeMonster) {
    return (
      <section className="current-monster-bar empty-current-bar" aria-label="現在の育成対象">
        <div>
          <span className="eyebrow">現在の育成対象</span>
          <h2>まだタマゴがありません</h2>
          <p>作物・圃場・作型を登録して、最初の個体を作成しましょう。</p>
        </div>
        <Link className="primary-action" to="/egg/new">タマゴを作る</Link>
      </section>
    );
  }

  const latestReaction = activeMonster.logs.find(log => log.reaction)?.reaction;
  const stage = growthStage(activeMonster.exp, activeMonster.lifeStage);

  return (
    <section className="current-monster-bar" aria-label="現在の育成対象">
      <div className="current-monster-main">
        <div className="current-avatar" style={{ '--egg-tone': activeMonster.visualProfile.colorTone } as React.CSSProperties} aria-hidden="true" />
        <div>
          <span className="eyebrow">現在の育成対象</span>
          <h2>{activeMonster.name}</h2>
          <p>{activeMonster.crop || '作物未設定'} / {activeMonster.variety || '品種未設定'} / {activeMonster.fieldAddress || '圃場未設定'}</p>
        </div>
      </div>
      <dl className="current-monster-facts">
        <div><dt>作型</dt><dd>{activeMonster.cultivationType || '未設定'}</dd></div>
        <div><dt>成長段階</dt><dd>{stage}</dd></div>
        <div><dt>経験値</dt><dd>{activeMonster.exp}</dd></div>
        <div><dt>気分 / 状態</dt><dd>{moodLabel(latestReaction)}</dd></div>
      </dl>
      <div className="current-monster-actions">
        <div className="switch-buttons" aria-label="個体切替">
          <button type="button" disabled={!canSwitch} onClick={() => switchActiveMonster(-1)}>←</button>
          <span>{Math.max(0, index) + 1} / {state.monsters.length}</span>
          <button type="button" disabled={!canSwitch} onClick={() => switchActiveMonster(1)}>→</button>
        </div>
        <Link className="secondary-action" to="/egg/new">個体一覧へ</Link>
      </div>
    </section>
  );
};

export default CurrentMonsterBar;
