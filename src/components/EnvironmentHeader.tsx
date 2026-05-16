import React, { useEffect, useState } from 'react';

function seasonFromMonth(month: number): string {
  if ([3, 4, 5].includes(month)) return '春';
  if ([6, 7, 8].includes(month)) return '夏';
  if ([9, 10, 11].includes(month)) return '秋';
  return '冬';
}

const EnvironmentHeader: React.FC = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  const dateLabel = new Intl.DateTimeFormat('ja-JP', {
    month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit'
  }).format(now);
  const season = seasonFromMonth(now.getMonth() + 1);

  return (
    <header className="environment-header">
      <div className="brand-block">
        <span className="eyebrow">Local AI Farm</span>
        <h1>ローカルAI育成システム</h1>
      </div>
      <div className="environment-grid" aria-label="環境情報">
        <div><span>日時</span><strong>{dateLabel}</strong></div>
        <div><span>天気</span><strong>くもり基調</strong></div>
        <div><span>気温</span><strong>24.0℃</strong></div>
        <div><span>季節</span><strong>{season}</strong></div>
        <div><span>観測状態</span><strong>ローカル観測中</strong></div>
        <div><span>センサー</span><strong>手入力 / 待機</strong></div>
      </div>
    </header>
  );
};

export default EnvironmentHeader;
