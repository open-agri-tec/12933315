import React, { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import FeedLogCard from '../components/FeedLogCard';
import LogFilterChips, { LogFilter } from '../components/LogFilterChips';
import MainActionGrid from '../components/MainActionGrid';
import MonsterHeroCard from '../components/MonsterHeroCard';
import StatSummaryCards from '../components/StatSummaryCards';
import { LogEntry, useFarm } from '../context/FarmContext';

function logKind(log: LogEntry): string {
  if (log.type === '生成') return 'エサ生成';
  if (log.type === '給餌') return '給餌';
  if (log.type === '個体作成') return '個体作成';
  if (log.type === 'エクスポート') return 'エクスポート';
  return log.type || '記録';
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
  if (log.foodName && log.reaction) return log.foodName;
  if (log.foodName && log.type === '生成') return log.foodName;
  return log.text || '記録内容なし';
}

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
    a.download = 'local-ai-farm-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('ローカル保存データを初期化しますか？この操作は戻せません。')) resetFarm();
  };

  if (!activeMonster) {
    return (
      <div className="page log-page companion-page">
        <EmptyState title="最初のタマゴを作成してください" description="作物・圃場・作型を登録すると、記録を蓄積できます。" icon="" actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]} />
      </div>
    );
  }

  return (
    <div className="page log-page companion-page">
      <MonsterHeroCard monster={activeMonster} />
      <MainActionGrid />

      <div className="logs-layout">
        <section className="logs-main-column">
          <StatSummaryCards activeMonster={activeMonster} logs={logs} foods={foods} />
          <section className="glass-panel recent-logs" aria-label="成長記録">
            <div className="section-heading">
              <h2>成長記録</h2>
              <span>{filteredLogs.length} / {logs.length}件</span>
            </div>
            <LogFilterChips value={filter} onChange={setFilter} />
            {logs.length === 0 ? (
              <EmptyState title="まだ記録がありません" description="エサを作る、または給餌を行うと履歴が残ります。" icon="" actions={[{ label: 'エサを作る', to: '/feed', primary: true }]} />
            ) : filteredLogs.length === 0 ? (
              <EmptyState title="この条件の記録はありません" description="別のフィルターを選ぶと、他の履歴を確認できます。" icon="" />
            ) : (
              <div className="log-list">
                {filteredLogs.slice(0, 80).map((log, idx) => (
                  <FeedLogCard
                    key={`${log.at}-${idx}`}
                    log={log}
                    monster={activeMonster}
                    tags={extractTags(log)}
                    title={displayText(log)}
                    kind={logKind(log)}
                  />
                ))}
              </div>
            )}
          </section>
        </section>

        <aside id="tools" className="soft-card log-tools-panel">
          <div className="section-heading compact-heading"><h2>保存・連携</h2><span>ローカル</span></div>
          <p className="muted-text no-pad">JSON書き出しで検証用バックアップを保存できます。初期化は危険操作として分離しています。</p>
          <div className="log-actions">
            <button className="secondary-button" type="button" onClick={handleExport}>JSONを書き出す</button>
          </div>
          <div className="danger-zone">
            <h3>危険操作</h3>
            <p>ローカル保存データを初期状態に戻します。</p>
            <button className="danger-button" type="button" onClick={handleReset}>初期化する</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LogPage;
