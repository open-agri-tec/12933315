import React from 'react';
import { useFarm } from '../context/FarmContext';
import MonsterCard from '../components/MonsterCard';
import { Link } from 'react-router-dom';

/**
 * ホーム画面。未給餌のエサ一覧を表示し、モンスターに与えることができます。
 */
const HomePage: React.FC = () => {
  const { state, feedFood } = useFarm();
  const foods = state.foods.filter(f => !f.fed);

  return (
    <div className="page home-page">
      {/* モンスターカードを表示 */}
      <MonsterCard />
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
        <Link to="/feed" className="primary">エサを生成</Link>
        <Link to="/observe">観察する</Link>
        <Link to="/logs">記録を見る</Link>
      </div>
    </div>
  );
};

export default HomePage;