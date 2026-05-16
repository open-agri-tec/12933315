import React from 'react';
import { AXIS, useFarm } from '../context/FarmContext';
import EmptyState from '../components/EmptyState';
import MainActionGrid from '../components/MainActionGrid';
import MonsterHeroCard from '../components/MonsterHeroCard';
import StatMeter from '../components/StatMeter';
import TagChip from '../components/TagChip';
import { growthStage } from '../components/designUtils';

const ObservePage: React.FC = () => {
  const { activeMonster } = useFarm();

  if (!activeMonster) {
    return (
      <div className="page observe-page companion-page">
        <EmptyState title="最初のタマゴを作成してください" description="作物・圃場・作型を登録すると、観察画面が使えます。" icon="" actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]} />
      </div>
    );
  }

  const entries = Object.entries(activeMonster.stats);
  const [topAxis, topValue] = entries.sort((a, b) => b[1] - a[1])[0] || ['未形成', 0];
  const nature = topValue <= 0
    ? 'まだ情報の癖が薄い。観察・作業・環境の記録を少しずつ取り込ませてください。'
    : `${topAxis}に反応の芯が出ています。関連する記録を続けると性質が安定します。`;
  const recentReactionTags = activeMonster.logs.flatMap(log => log.tags || []).filter(tag => !activeMonster.tastes.includes(tag));
  const weakTags = Array.from(new Set(recentReactionTags)).slice(0, 4);

  return (
    <div className="page observe-page companion-page">
      <MonsterHeroCard monster={activeMonster} large />
      <MainActionGrid />

      <div className="observe-layout">
        <section className="soft-card nature-card">
          <div className="section-heading"><h2>現在のせいしつ</h2><span>{growthStage(activeMonster)}</span></div>
          <p className="no-pad">{nature}</p>
          <dl className="info-list">
            <div><dt>Lv</dt><dd>{Math.floor(activeMonster.exp / 100) + 1}</dd></div>
            <div><dt>経験値</dt><dd>{activeMonster.exp}</dd></div>
            <div><dt>成長段階</dt><dd>{growthStage(activeMonster)}</dd></div>
          </dl>
        </section>

        <section className="glass-panel meter-panel">
          <div className="section-heading"><h2>内部軸メーター</h2><span>6軸</span></div>
          <div className="stat-meter-list">
            {AXIS.map((axis, index) => <StatMeter key={axis} label={axis} value={activeMonster.stats[axis] || 0} tone={index % 2 === 0 ? 'growth' : 'feed'} />)}
          </div>
        </section>

        <section className="soft-card taste-card">
          <div className="section-heading compact-heading"><h2>好きなタグ</h2><span>{activeMonster.tastes.length}</span></div>
          <div className="chip-list">{activeMonster.tastes.map(tag => <TagChip key={tag} label={tag} tone="growth" />)}</div>
          <div className="section-heading compact-heading sub-heading"><h2>苦手なタグ候補</h2><span>{weakTags.length}</span></div>
          <div className="chip-list">{weakTags.length > 0 ? weakTags.map(tag => <TagChip key={tag} label={tag} tone="feed" />) : <span className="muted-text no-pad">まだ明確ではありません</span>}</div>
        </section>
      </div>
    </div>
  );
};

export default ObservePage;
