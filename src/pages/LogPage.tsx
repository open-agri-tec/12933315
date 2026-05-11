import React from 'react';
import { Link } from 'react-router-dom';
import { LogEntry, useFarm } from '../context/FarmContext';

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

const reactionEmoji: Record<string, string> = {
  大好物: '😋',
  普通: '🌱',
  苦手: '💦'
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--/-- --:--';
  return dateFormatter.format(date);
}

function logKind(log: LogEntry): '生成' | '給餌' | '反応' | 'その他' {
  if (log.type === '生成' || log.type === '給餌' || log.type === '反応') return log.type;
  return 'その他';
}

function extractTags(log: LogEntry): string[] {
  if (Array.isArray(log.tags) && log.tags.length > 0) {
    return log.tags.filter(Boolean).slice(0, 8);
  }

  const source = `${log.memo || ''} ${log.text || ''}`;
  const match = source.match(/タグ[:：]\s*([^/\n]+)/);
  if (!match) return [];

  return match[1]
    .split(/[・、,\s]+/)
    .map(tag => tag.trim().replace(/^#|^＃/, ''))
    .filter(Boolean)
    .slice(0, 8);
}

function displayText(log: LogEntry): string {
  if (log.foodName && log.reaction) return `${log.reaction}：${log.foodName}`;
  if (log.foodName && log.type === '生成') return `生成：${log.foodName}`;
  return log.text || '記録内容なし';
}

/**
 * 記録画面。栽培ログを閲覧し、データの書き出しや初期化を行います。
 */
const LogPage: React.FC = () => {
  const { state, activeMonster, resetFarm } = useFarm();
  const logs = activeMonster?.logs || [];
  const foods = activeMonster?.foods || [];
  const totalFoods = foods.length;
  const feedingLogs = logs.filter(log => log.type === '給餌');
  const totalFeeds = Math.max(foods.filter(food => food.fed).length, feedingLogs.length);
  const totalReactions = feedingLogs.filter(log => log.reaction || log.text).length;

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
      <section className="log-summary" aria-label="記録サマリー">
        <div className="summary-card">
          <span>総エサ数</span>
          <strong>{totalFoods}</strong>
        </div>
        <div className="summary-card">
          <span>総給餌数</span>
          <strong>{totalFeeds}</strong>
        </div>
        <div className="summary-card">
          <span>総反応数</span>
          <strong>{totalReactions}</strong>
        </div>
      </section>

      <section className="recent-logs" aria-label="最近の記録">
        <div className="section-heading">
          <h2>最近の記録</h2>
          <span>{logs.length}件</span>
        </div>
        {logs.length === 0 ? (
          <div className="empty-log-card">記録はまだありません。エサ生成や給餌を行うとここに履歴が残ります。</div>
        ) : (
          <div className="log-list">
            {logs.slice(0, 80).map((log, idx) => {
              const kind = logKind(log);
              const tags = extractTags(log);
              const reaction = log.reaction;
              const expGain = typeof log.expGain === 'number' ? log.expGain : undefined;

              return (
                <article key={`${log.at}-${idx}`} className={`log-entry log-entry-${kind}`}>
                  <div className="log-main">
                    <div className="log-time">{formatDate(log.at)}</div>
                    <div className="log-title-row">
                      <span className="log-type-badge">{kind}</span>
                      <strong>{displayText(log)}</strong>
                    </div>
                    {log.memo && <div className="log-memo">{log.memo}</div>}
                    {tags.length > 0 && (
                      <div className="log-tags" aria-label="タグ">
                        {tags.map((tag, tagIndex) => <span key={`${tag}-${tagIndex}`}>#{tag}</span>)}
                      </div>
                    )}
                  </div>
                  {reaction && (
                    <aside className="reaction-panel" aria-label="反応">
                      <span className="reaction-emoji">{reactionEmoji[reaction] || '✨'}</span>
                      <strong>{reaction}</strong>
                      {typeof log.score === 'number' && <span>score {log.score}</span>}
                      {expGain !== undefined && <span>+{expGain}経験値</span>}
                    </aside>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="log-actions">
        <button onClick={handleExport}>JSONを書き出す</button>
        <button className="gold" onClick={handleReset}>初期化</button>
      </div>
    </div>
  );
};

export default LogPage;
