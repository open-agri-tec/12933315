import React from 'react';
import { useFarm, AXIS } from '../context/FarmContext';

/**
 * 観察画面。現在の経験値とステータスバーを表示し、
 * モンスターの成長段階や性質を可視化します。
 */
const ObservePage: React.FC = () => {
  const { state } = useFarm();
  const { exp, stats, tastes } = state;

  // 成長段階判定
  let stage = '卵期';
  if (exp >= 90) stage = 'コンバート準備';
  else if (exp >= 48) stage = '成長体';
  else if (exp >= 18) stage = '幼体';

  // 最大の軸を求める
  const entries = Object.entries(stats);
  const [topAxis, topValue] = entries.sort((a, b) => b[1] - a[1])[0] || ['未形成', 0];
  // 性質の説明を生成
  let nature = '';
  if (topValue <= 0) {
    nature = 'まだ情報の癖が薄い。';
  } else if (topAxis === '自然性') {
    nature = '環境感応型。圃場・水・生育の情報に反応しやすい。';
  } else if (topAxis === '生産性') {
    nature = '生産管理型。収量・販売・施肥の情報を強く取り込む。';
  } else if (topAxis === '社会性') {
    nature = '地域接続型。共同作業や販売先の情報に寄る。';
  } else if (topAxis === '知性') {
    nature = '記録欲求型。観察密度と継続記録を欲しがる。';
  } else if (topAxis === '機械性') {
    nature = '機械親和型。整備・ローバー・道具の情報に反応する。';
  } else {
    nature = '防御寄り。異常・防除・緊急対応の情報を重く見る。';
  }

  return (
    <div className="page observe-page">
      <h1>観察</h1>
      <div style={{ padding: '0 16px' }}>
        <p>
          <strong>{stage}</strong> / 経験値 {exp}
        </p>
        <p>{nature}</p>
        <p>現在反応しやすいタグ：{tastes.join('・')}</p>
        <div id="meters">
          {AXIS.map((axis) => {
            const v = stats[axis] || 0;
            return (
              <div key={axis} className="meter-row">
                <span>{axis}</span>
                <div className="bar">
                  <i style={{ width: `${v}%` }}></i>
                </div>
                <span>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ObservePage;