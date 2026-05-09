import React from 'react';
import { Link } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';

/**
 * 記録画面。栽培ログを閲覧し、データの書き出しや初期化を行います。
 */
const LogPage: React.FC = () => {
  const { state, activeMonster, resetFarm } = useFarm();
  const logs = activeMonster?.logs || [];

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'local-ai-farm-ver0.6-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('ローカル保存データを初期化しますか？')) {
      resetFarm();
    }
  };

  if (!activeMonster) {
    return (
      <div className="page log-page">
        <h1>記録</h1>
        <div className="notice-card">
          <p>先にタマゴを作ってください。</p>
          <Link className="egg-create-link" to="/egg/new">タマゴの情報を入力する</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page log-page">
      <h1>記録</h1>
      {logs.length === 0 ? (
        <p style={{ padding: '0 16px' }}>記録はまだありません。</p>
      ) : (
        <div className="log-list" style={{ padding: '0 16px' }}>
          {logs.slice(0, 80).map((log, idx) => (
            <div key={idx} className="log-entry">
              <div className="food-name">
                {log.type} / {new Intl.DateTimeFormat('ja-JP', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(log.at))}
              </div>
              <div className="food-meta">{log.text}</div>
              {log.memo && <div className="food-meta">{log.memo}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '24px', padding: '0 16px', display: 'flex', gap: '12px' }}>
        <button onClick={handleExport}>データ書き出し</button>
        <button className="gold" onClick={handleReset}>初期化</button>
      </div>
    </div>
  );
};

export default LogPage;