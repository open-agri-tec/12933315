import React from 'react';
import { useFarm, AXIS } from '../context/FarmContext';
import EmptyState from '../components/EmptyState';
import MonsterCard from '../components/MonsterCard';

/**
 * 観察画面。現在の経験値とステータスバーを表示し、
 * モンスターの成長段階や性質を可視化します。
 */
const ObservePage: React.FC = () => {
  const { activeMonster } = useFarm();

  if (!activeMonster) {
    return (
      <div className="page observe-page">
        <h1>観察</h1>
        <EmptyState
          title="最初のタマゴを作成してください"
          description="作物・圃場・作型を登録すると、育成対象の個体が生まれます。"
          icon="🥚"
          actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]}
        />
      </div>
    );
  }

  const { exp, stats, tastes, logs } = activeMonster;
  let stage = activeMonster.lifeStage === 'egg' ? 'タマゴ' : '卵期';
  if (activeMonster.lifeStage !== 'egg') {
    if (exp >= 90) stage = 'コンバート準備';
    else if (exp >= 48) stage = '成長体';
    else if (exp >= 18) stage = '幼体';
  }

  const entries = Object.entries(stats);
  const [topAxis, topValue] = entries.sort((a, b) => b[1] - a[1])[0] || ['未形成', 0];
  let nature = '';
  if (topValue <= 0) nature = 'まだ情報の癖が薄い。';
  else if (topAxis === '自然性') nature = '環境感応型。圃場・水・生育の情報に反応しやすい。';
  else if (topAxis === '生産性') nature = '生産管理型。収量・販売・施肥の情報を強く取り込む。';
  else if (topAxis === '社会性') nature = '地域接続型。共同作業や販売先の情報に寄る。';
  else if (topAxis === '知性') nature = '記録欲求型。観察密度と継続記録を欲しがる。';
  else if (topAxis === '機械性') nature = '機械親和型。整備・ローバー・道具の情報に反応する。';
  else nature = '防御寄り。異常・防除・緊急対応の情報を重く見る。';

  const reactionLogs = logs.filter(log => log.reaction).slice(0, 5);

  return (
    <div className="page observe-page">
      <h1>観察</h1>
      <div className="observe-grid">
        <section className="observe-monster-panel">
          <MonsterCard />
        </section>
        <section className="panel-card observe-meter-panel">
          <div className="section-heading">
            <h2>内部軸メーター</h2>
            <span>{stage} / 経験値 {exp}</span>
          </div>
          {activeMonster.lifeStage === 'egg' ? (
            <div className="observe-egg-summary">
              <p>まだ孵化していない。入力された栽培情報を内部にためている。</p>
              <dl className="egg-detail-list">
                <div><dt>タマゴ名</dt><dd>{activeMonster.name}</dd></div>
                <div><dt>作物</dt><dd>{activeMonster.crop}</dd></div>
                <div><dt>品種</dt><dd>{activeMonster.variety}</dd></div>
                <div><dt>ほ場</dt><dd>{activeMonster.fieldAddress}</dd></div>
                <div><dt>作型</dt><dd>{activeMonster.cultivationType}</dd></div>
              </dl>
            </div>
          ) : <p>{nature}</p>}
          <div id="meters">
            {AXIS.map((axis) => {
              const v = stats[axis] || 0;
              return (
                <div key={axis} className="meter-row">
                  <span>{axis}</span>
                  <div className="bar"><i style={{ width: `${v}%` }} /></div>
                  <span>{v}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel-card observe-history-panel">
          <h2>最近の反応履歴 / 好み傾向</h2>
          <p className="muted-text">現在反応しやすいタグ：{tastes.join('・')}</p>
          {reactionLogs.length > 0 ? (
            <div className="mini-log-list">
              {reactionLogs.map((log, index) => <p key={`${log.at}-${index}`}>{log.reaction}：{log.foodName || log.text}</p>)}
            </div>
          ) : (
            <p className="muted-text">まだ反応履歴がありません。未給餌エサをあげるとここに表示されます。</p>
          )}
          <div className="taste-chip-list">
            {tastes.map(taste => <span key={taste}>#{taste}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ObservePage;
