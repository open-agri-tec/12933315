import React from 'react';
import { Link } from 'react-router-dom';
import { Monster } from '../context/FarmContext';

interface NextActionCardProps {
  monsters: Monster[];
  activeMonster: Monster | null;
}

function isToday(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return !Number.isNaN(date.getTime()) &&
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

const NextActionCard: React.FC<NextActionCardProps> = ({ monsters, activeMonster }) => {
  let title = 'まずタマゴを作る';
  let description = '作物・圃場・作型を登録すると、育成対象の個体が生まれます。';
  let to = '/egg/new';
  let cta = 'タマゴを作る';

  if (monsters.length > 0 && activeMonster) {
    const pendingFoods = activeMonster.foods.filter(food => !food.fed);
    const hasTodayLog = activeMonster.logs.some(log => isToday(log.at));

    if (activeMonster.foods.length === 0) {
      title = '最初のエサを作る';
      description = '作業メモや観察メモから、この個体にあげる情報のエサを生成しましょう。';
      to = '/feed';
      cta = 'エサを作る';
    } else if (pendingFoods.length > 0) {
      title = 'エサをあげる';
      description = `${pendingFoods.length}件の未給餌エサがあります。反応を見るために給餌しましょう。`;
      to = '/';
      cta = 'ホームで給餌する';
    } else if (activeMonster.logs.length > 0) {
      title = '観察して変化を見る';
      description = '給餌や記録で変化した内部軸・好み傾向を確認できます。';
      to = '/observe';
      cta = '観察する';
    }

    if (!hasTodayLog && activeMonster.logs.length > 0 && pendingFoods.length === 0) {
      title = '今日の作業メモを残す';
      description = 'しばらく今日の記録がありません。小さな観察でもエサにして蓄積しましょう。';
      to = '/feed';
      cta = 'メモからエサを作る';
    }
  }

  return (
    <section className="next-action-card">
      <span className="eyebrow">次にやること</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="primary-action" to={to}>{cta}</Link>
    </section>
  );
};

export default NextActionCard;
