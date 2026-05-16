import React from 'react';
import { LogEntry } from '../context/FarmContext';

type ReactionKind = 'favorite' | 'normal' | 'dislike' | 'none';

interface ReactionBadgeProps {
  reaction?: LogEntry['reaction'];
  expGain?: number;
}

function reactionKind(reaction?: LogEntry['reaction']): ReactionKind {
  if (reaction === '大好物') return 'favorite';
  if (reaction === '普通') return 'normal';
  if (reaction === '苦手') return 'dislike';
  return 'none';
}

function labelFor(kind: ReactionKind): string {
  if (kind === 'favorite') return '大好物';
  if (kind === 'normal') return 'ふつう';
  if (kind === 'dislike') return '苦手かも';
  return '未反応';
}

const ReactionBadge: React.FC<ReactionBadgeProps> = ({ reaction, expGain }) => {
  const kind = reactionKind(reaction);
  return (
    <span className={`reaction-badge reaction-${kind}`}>
      <strong>{labelFor(kind)}</strong>
      {typeof expGain === 'number' && <em>+{expGain} exp</em>}
    </span>
  );
};

export default ReactionBadge;
