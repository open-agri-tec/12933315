import React from 'react';
import { LogEntry, Monster } from '../context/FarmContext';
import { formatDateTime } from './designUtils';
import ReactionBadge from './ReactionBadge';
import TagChip from './TagChip';

interface FeedLogCardProps {
  log: LogEntry;
  monster: Monster;
  tags: string[];
  title: string;
  kind: string;
}

const FeedLogCard: React.FC<FeedLogCardProps> = ({ log, monster, tags, title, kind }) => {
  return (
    <article className={`feed-log-card feed-log-${kind}`}>
      <div className="feed-log-head">
        <div>
          <time>{formatDateTime(log.at)}</time>
          <h3>{title}</h3>
        </div>
        <ReactionBadge reaction={log.reaction} expGain={log.expGain} />
      </div>
      {log.memo && <p className="feed-log-memo">{log.memo}</p>}
      <div className="feed-log-facts">
        <span>対象個体: {monster.name}</span>
        <span>作物: {monster.crop}</span>
        <span>圃場: {monster.fieldAddress}</span>
      </div>
      {tags.length > 0 && <div className="chip-list">{tags.map(tag => <TagChip key={tag} label={tag} />)}</div>}
    </article>
  );
};

export default FeedLogCard;
