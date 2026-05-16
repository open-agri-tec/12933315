import React from 'react';
import { Food } from '../context/FarmContext';
import { formatShortDateTime } from './designUtils';
import TagChip from './TagChip';

interface FeedCardProps {
  food: Food;
  onFeed?: (id: string) => void;
  compact?: boolean;
}

const FeedCard: React.FC<FeedCardProps> = ({ food, onFeed, compact = false }) => {
  return (
    <article className={`feed-card ${food.fed ? 'is-fed' : ''} ${compact ? 'feed-card-compact' : ''}`.trim()}>
      <div className="feed-card-main">
        <div>
          <span className="eyebrow">{food.fed ? '給餌済み' : '未給餌エサ'}</span>
          <h3>{food.name}</h3>
        </div>
        <time>{formatShortDateTime(food.createdAt)}</time>
      </div>
      {food.memo && <p className="feed-card-memo">{food.memo}</p>}
      <div className="feed-card-meta">
        {food.field && <span>圃場: {food.field}</span>}
        {food.crop && <span>作物: {food.crop}</span>}
      </div>
      <div className="chip-list">
        {food.tags.map(tag => <TagChip key={tag} label={tag} />)}
      </div>
      {onFeed && !food.fed && (
        <button className="feed-button" type="button" onClick={() => onFeed(food.id)}>このエサをあげる</button>
      )}
    </article>
  );
};

export default FeedCard;
