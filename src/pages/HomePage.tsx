import React, { TouchEvent, useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import MonsterCard from '../components/MonsterCard';
import { Link } from 'react-router-dom';

/**
 * ホーム画面。未給餌のエサ一覧を表示し、タマゴ/モンスターに与えることができます。
 */
const HomePage: React.FC = () => {
  const { state, activeMonster, feedFood, switchActiveMonster } = useFarm();
  const touchStartX = useRef<number | null>(null);
  const foods = activeMonster?.foods.filter(f => !f.fed) || [];
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
      {/* モンスター/タマゴカードを表示 */}
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
      {/* 未給餌のエサがあれば簡易リストを表示 */}
      {foods.length > 0 && (
        <div className="food-list" style={{ margin: '0 16px' }}>
          {foods.map(food => (
            <div key={food.id} className="food-card">
              <div className="food-name">{food.name}</div>
              <div className="food-meta">{food.tags.map(t => `＃${t}`).join('　')}</div>
              <div className="food-meta">{food.memo || 'メモなし'}</div>
              <button className="gold" onClick={() => feedFood(food.id)}>
                このエサをあげる
              </button>
            </div>
          ))}
        </div>
      )}
      {/* 大きなボタン群で各ページへ誘導 */}
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
    </div>
  );
};

export default HomePage;
