import React, { TouchEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import EmptyState from '../components/EmptyState';
import FeedCard from '../components/FeedCard';
import MainActionGrid from '../components/MainActionGrid';
import MonsterHeroCard from '../components/MonsterHeroCard';
import { formatShortDateTime } from '../components/designUtils';

const HomePage: React.FC = () => {
  const { state, activeMonster, feedFood, switchActiveMonster } = useFarm();
  const touchStartX = useRef<number | null>(null);
  const pendingFoods = activeMonster?.foods.filter(food => !food.fed) || [];
  const logs = activeMonster?.logs || [];
  const hasMonster = state.monsters.length > 0;
  const activeIndex = activeMonster ? state.monsters.findIndex(monster => monster.id === activeMonster.id) : -1;
  const canSwitch = state.monsters.length >= 2;

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!canSwitch || touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = endX - touchStartX.current;
    if (Math.abs(diff) > 48) switchActiveMonster(diff > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <div className="page home-page companion-page">
      <section className="monster-command-zone" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <MonsterHeroCard monster={activeMonster} large />
        <div className="under-hero-row">
          {canSwitch ? (
            <div className="monster-switcher" aria-label="個体切替">
              <button type="button" onClick={() => switchActiveMonster(-1)} aria-label="前の個体へ">←</button>
              <span>{Math.max(0, activeIndex) + 1} / {state.monsters.length}</span>
              <button type="button" onClick={() => switchActiveMonster(1)} aria-label="次の個体へ">→</button>
            </div>
          ) : (
            <Link to="/egg/new" className="secondary-action">個体情報を登録</Link>
          )}
          {hasMonster && <Link to="/egg/new" className="secondary-action">タマゴを追加</Link>}
        </div>
        <MainActionGrid disabled={!hasMonster} />
      </section>

      <div className="home-support-grid">
        <section className="soft-card latest-record-card">
          <div className="section-heading">
            <h2>最新の成長記録</h2>
            <span>{logs.length}件</span>
          </div>
          {logs.length > 0 ? (
            <div className="mini-log-list">
              {logs.slice(0, 4).map((log, index) => (
                <p key={`${log.at}-${index}`}><time>{formatShortDateTime(log.at)}</time>{log.text}</p>
              ))}
            </div>
          ) : (
            <p className="muted-text no-pad">エサ生成や給餌を行うと、反応と作業履歴がここに残ります。</p>
          )}
        </section>

        <section className="soft-card feed-candidate-card">
          <div className="section-heading">
            <h2>エサ候補</h2>
            <span>{pendingFoods.length}件</span>
          </div>
          {pendingFoods.length > 0 ? (
            <div className="feed-list compact-list">
              {pendingFoods.slice(0, 3).map(food => <FeedCard key={food.id} food={food} onFeed={feedFood} compact />)}
            </div>
          ) : hasMonster ? (
            <EmptyState
              title="未給餌エサはありません"
              description="今日の観察や作業メモをエサにして、個体へ渡せます。"
              icon=""
              actions={[{ label: 'エサを作る', to: '/feed', primary: true }]}
            />
          ) : (
            <EmptyState
              title="最初のタマゴを作成してください"
              description="農業記録を受け取る中心個体を登録します。"
              icon=""
              actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
