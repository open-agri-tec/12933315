import React, { useMemo, useState } from 'react';
import { LogEntry, useFarm } from '../context/FarmContext';
import EmptyState from '../components/EmptyState';
import StatSummaryCards from '../components/StatSummaryCards';
import LogFilterChips, { LogFilter } from '../components/LogFilterChips';

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
  if (log.reaction) return '反応';
  if (log.type === '生成' || log.type === '給餌') return log.type;
  return 'その他';
}

function matchesFilter(log: LogEntry, filter: LogFilter): boolean {
  if (filter === 'すべて') return true;
  if (filter === 'エサ生成') return log.type === '生成';
  if (filter === '給餌') return log.type === '給餌';
  if (filter === '反応') return Boolean(log.reaction);
  if (filter === '個体作成') return log.type === '個体作成';
  if (filter === 'エクスポート') return log.type === 'エクスポート';
  return true;
}

function extractTags(log: LogEntry): string[] {
  if (Array.isArray(log.tags) && log.tags.length > 0) return log.tags.filter(Boolean).slice(0, 8);
  const source = `${log.memo || ''} ${log.text || ''}`;
  const match = source.match(/タグ[:：]\s*([^/\n]+)/);
  if (!match) return [];
  return match[1].split(/[・、,\s]+/).map(tag => tag.trim().replace(/^#|^＃/, '')).filter(Boolean).slice(0, 8);
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
  const [filter, setFilter] = useState<LogFilter>('すべて');
  const logs = activeMonster?.logs || [];
  const foods = activeMonster?.foods || [];
  const filteredLogs = useMemo(() => logs.filter(log => matchesFilter(log, filter)), [logs, filter]);

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
    if (window.confirm('ローカル保存データを初期化しますか？')) resetFarm();
  };

  if (!activeMonster) {
    return (
      <div className="page log-page">
        <h1>記録</h1>
        <EmptyState
          title="最初のタマゴを作成してください"
          description="作物・圃場・作型を登録すると、育成対象の個体が生まれます。"
          icon="🥚"
          actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]}
        />
      </div>
    );
  }

  return (
    <div className="page log-page">
      <h1>記録</h1>
      <div className="logs-layout">
        <section className="logs-main-column">
          <StatSummaryCards activeMonster={activeMonster} logs={logs} foods={foods} />
          <section className="recent-logs" aria-label="最近の記録">
            <div className="section-heading">
              <h2>ログ一覧</h2>
              <span>{filteredLogs.length} / {logs.length}件</span>
            </div>
            <LogFilterChips value={filter} onChange={setFilter} />
            {logs.length === 0 ? (
              <EmptyState
                title="まだ記録がありません"
                description="エサを作る、または給餌を行うと、ここに履歴が残ります。"
                icon="📝"
                actions={[{ label: 'エサを作る', to: '/feed', primary: true }, { label: 'ホームへ戻る', to: '/' }]}
              />
            ) : filteredLogs.length === 0 ? (
              <EmptyState
                title="この条件の記録はありません"
                description="別のフィルターを選ぶと、他の履歴を確認できます。"
                icon="🔎"
                actions={[{ label: 'すべてを見る', to: '/logs', primary: true }]}
              />
            ) : (
              <div className="log-list">
                {filteredLogs.slice(0, 80).map((log, idx) => {
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
                        {tags.length > 0 && <div className="log-tags" aria-label="タグ">{tags.map((tag, tagIndex) => <span key={`${tag}-${tagIndex}`}>#{tag}</span>)}</div>}
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
        </section>
        <aside className="panel-card log-tools-panel">
          <h2>JSON書き出し / 初期化</h2>
          <p className="muted-text">ローカル保存データのバックアップや、検証用の初期化を行えます。</p>
          <div className="log-actions">
            <button onClick={handleExport}>JSONを書き出す</button>
            <button className="gold" onClick={handleReset}>初期化</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LogPage;
