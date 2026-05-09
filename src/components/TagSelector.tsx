import React from 'react';
import { TAGS } from '../context/FarmContext';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * タグをボタン形式で一覧表示し、選択状態を管理するコンポーネント。
 */
const TagSelector: React.FC<Props> = ({ selected, onChange }) => {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };
  return (
    <div className="tag-selector">
      {TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          className={selected.includes(tag) ? 'tag active' : 'tag'}
          onClick={() => toggleTag(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagSelector;
