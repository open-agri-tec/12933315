import { AXIS, LogEntry, Monster } from '../context/FarmContext';

export const dateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

export const shortDateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

export function formatDateTime(value?: string): string {
  if (!value) return '未記録';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未記録';
  return dateTimeFormatter.format(date);
}

export function formatShortDateTime(value?: string): string {
  if (!value) return '未記録';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未記録';
  return shortDateTimeFormatter.format(date);
}

export function growthStage(monster: Pick<Monster, 'lifeStage' | 'exp'>): string {
  if (monster.lifeStage === 'egg') return 'タマゴ';
  if (monster.exp >= 90) return 'コンバート準備';
  if (monster.exp >= 48) return '成長体';
  if (monster.exp >= 18) return '幼体';
  return '卵期';
}

export function expProgress(exp: number): number {
  return Math.min(100, Math.max(0, exp % 100));
}

export function latestReaction(monster: Monster): LogEntry['reaction'] | undefined {
  return monster.logs.find(log => log.reaction)?.reaction;
}

export function moodLabel(monster: Monster): string {
  const reaction = latestReaction(monster);
  if (reaction === '大好物') return 'よく吸収している';
  if (reaction === '苦手') return '慎重に観察中';
  if (reaction === '普通') return 'おだやか';
  if (monster.foods.some(food => !food.fed)) return '情報を待機中';
  return '次の記録を待っています';
}

export function oneLineComment(monster: Monster): string {
  const pending = monster.foods.filter(food => !food.fed).length;
  const topAxis = AXIS.map(axis => [axis, monster.stats[axis] || 0] as const).sort((a, b) => b[1] - a[1])[0];
  if (pending > 0) return `${pending}件のエサを受け入れる準備があります。`;
  if (topAxis && topAxis[1] > 0) return `${topAxis[0]}の情報が少しずつ形になっています。`;
  return '今日の観察や作業メモを少しずつ与えてください。';
}
