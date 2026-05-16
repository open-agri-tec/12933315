import React from 'react';
import { Food, LogEntry, Monster } from '../context/FarmContext';

interface StatSummaryCardsProps {
  activeMonster: Monster | null;
  logs: LogEntry[];
  foods: Food[];
}

const dateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

function formatDate(value?: string): string {
  if (!value) return '未記録';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未記録';
  return dateTimeFormatter.format(date);
}

function isToday(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return !Number.isNaN(date.getTime()) &&
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

const StatSummaryCards: React.FC<StatSummaryCardsProps> = ({ activeMonster, logs, foods }) => {
  const feedingLogs = logs.filter(log => log.type === '給餌');
  const latestReaction = logs.find(log => log.reaction)?.reaction || 'なし';
  const cards = [
    { label: '現在の個体名', value: activeMonster?.name || '未選択' },
    { label: '総エサ数', value: foods.length },
    { label: '総給餌数', value: Math.max(foods.filter(food => food.fed).length, feedingLogs.length) },
    { label: '総反応数', value: feedingLogs.filter(log => log.reaction || log.text).length },
    { label: '最終記録日時', value: formatDate(logs[0]?.at) },
    { label: '未給餌エサ数', value: foods.filter(food => !food.fed).length },
    { label: '今日の記録数', value: logs.filter(log => isToday(log.at)).length },
    { label: '直近の反応', value: latestReaction }
  ];

  return (
    <section className="stat-summary-cards" aria-label="記録サマリー">
      {cards.map(card => (
        <div key={card.label} className="summary-card">
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </section>
  );
};

export default StatSummaryCards;
