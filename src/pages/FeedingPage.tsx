import React, { useState } from 'react';
import EmptyState from '../components/EmptyState';
import FeedCard from '../components/FeedCard';
import MainActionGrid from '../components/MainActionGrid';
import MonsterHeroCard from '../components/MonsterHeroCard';
import StatusMeter from '../components/StatusMeter';
import { useFarm } from '../context/FarmContext';

const FeedingPage: React.FC = () => {
  const { activeMonster, feedFood } = useFarm();
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  if (!activeMonster) {
    return (
      <div className="page feeding-page companion-page">
        <EmptyState title="最初のタマゴを作成してください" description="給餌するには育成対象の個体が必要です。" icon="" actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]} />
      </div>
    );
  }

  const pendingFoods = activeMonster.foods.filter(food => !food.fed);
  const fedFoods = activeMonster.foods.filter(food => food.fed);
  const appetite = Math.min(100, 36 + pendingFoods.length * 16);
  const foods = tab === 'pending' ? pendingFoods : fedFoods;

  return (
    <div className="page feeding-page companion-page">
      <MonsterHeroCard monster={activeMonster} />
      <MainActionGrid />

      <div className="feeding-layout">
        <StatusMeter label="情報の受け入れ具合" value={appetite} help="未給餌エサが増えるほど、次に取り込める情報量の目安が高くなります。" />
        <section className="glass-panel feeding-panel">
          <div className="section-heading">
            <h2>給餌</h2>
            <span>{pendingFoods.length}件の未給餌</span>
          </div>
          <div className="tab-row" role="tablist" aria-label="給餌リスト切替">
            <button type="button" className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>未給餌</button>
            <button type="button" className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>履歴</button>
          </div>
          {foods.length > 0 ? (
            <div className="feed-list">
              {foods.map(food => <FeedCard key={food.id} food={food} onFeed={tab === 'pending' ? feedFood : undefined} />)}
            </div>
          ) : (
            <EmptyState
              title={tab === 'pending' ? '未給餌エサはありません' : '給餌履歴はまだありません'}
              description={tab === 'pending' ? '作業メモからエサを作ると、ここで与えられます。' : '未給餌エサをあげると履歴として確認できます。'}
              icon=""
              actions={[{ label: 'エサを作る', to: '/feed', primary: true }]}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default FeedingPage;
