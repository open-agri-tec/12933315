import React, { TouchEvent, useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import MonsterCard from '../components/MonsterCard';
import { Link } from 'react-router-dom';
import NextActionCard from '../components/NextActionCard';
import EmptyState from '../components/EmptyState';

/**
 * ホーム画面。未給餌のエサ一覧を表示し、タマゴ/モンスターに与えることができます。
 */
const HomePage: React.FC = () => {
  const { state, activeMonster, feedFood, switchActiveMonster } = useFarm();
  const touchStartX = useRef<number | null>(null);
  const foods = activeMonster?.foods.filter(f => !f.fed) || [];
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
    if (Math.abs(diff) > 48) {
      switchActiveMonster(diff > 0 ? -1 : 1);
    }
    touchStartX.current = null;
  };

  return (
    <div className="page home-page">
      <h1>ホーム</h1>
      <div className="home-dashboard">
        <section className="home-monster-column">
          <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <MonsterCard />
          </div>
          {canSwitch && (
            <div className="monster-switcher" aria-label="タマゴ切り替え">
              <button onClick={() => switchActiveMonster(-1)} aria-label="前のタマゴへ">←</button>
              <span>{Math.max(0, activeIndex) + 1} / {state.monsters.length}</span>
              <button onClick={() => switchActiveMonster(1)} aria-label="次のタマゴへ">→</button>
            </div>
          )}
          {hasMonster && (
            <div className="add-egg-area">
              <Link to="/egg/new" className="egg-add-link">＋ タマゴを作る</Link>
            </div>
          )}
        </section>

        <section className="home-status-column">
          <NextActionCard monsters={state.monsters} activeMonster={activeMonster} />
          <div className="panel-card">
            <div className="section-heading">
              <h2>状態・成長</h2>
              <span>{activeMonster ? `経験値 ${activeMonster.exp}` : '未開始'}</span>
            </div>
            {activeMonster ? (
              <dl className="info-list">
                <div><dt>作物</dt><dd>{activeMonster.crop}</dd></div>
                <div><dt>品種</dt><dd>{activeMonster.variety}</dd></div>
                <div><dt>好み傾向</dt><dd>{activeMonster.tastes.join('・')}</dd></div>
              </dl>
            ) : (
              <p className="muted-text">タマゴを作ると、ここに成長状況が表示されます。</p>
            )}
          </div>
          <div className="home-buttons">
            {hasMonster ? (
              <>
                <Link to="/feed" className="primary">エサを生成</Link>
                <Link to="/observe">観察する</Link>
                <Link to="/logs">記録を見る</Link>
              </>
            ) : (
              <>
                <span className="disabled-link primary">エサを生成</span>
                <span className="disabled-link">観察する</span>
                <span className="disabled-link">記録を見る</span>
              </>
            )}
          </div>
        </section>

        <section className="home-side-column">
          <div className="panel-card">
            <div className="section-heading">
              <h2>エサ候補</h2>
              <span>{foods.length}件</span>
            </div>
            {foods.length > 0 ? (
              <div className="food-list compact-list">
                {foods.slice(0, 5).map(food => (
                  <div key={food.id} className="food-card">
                    <div className="food-name">{food.name}</div>
                    <div className="food-meta">{food.tags.map(t => `＃${t}`).join('　')}</div>
                    <div className="food-meta">{food.memo || 'メモなし'}</div>
                    <button className="gold" onClick={() => feedFood(food.id)}>このエサをあげる</button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="未給餌のエサはありません"
                description="作業メモや観察メモからエサを生成できます。"
                icon="🍽️"
                actions={[{ label: 'エサを作る', to: '/feed', primary: true }]}
              />
            )}
          </div>
          <div className="panel-card">
            <div className="section-heading">
              <h2>最近の記録</h2>
              <span>{logs.length}件</span>
            </div>
            {logs.length > 0 ? (
              <div className="mini-log-list">
                {logs.slice(0, 4).map((log, index) => <p key={`${log.at}-${index}`}>{log.text}</p>)}
              </div>
            ) : (
              <p className="muted-text">エサ生成や給餌を行うと履歴が残ります。</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
