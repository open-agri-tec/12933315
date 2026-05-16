import React from 'react';

export type LogFilter = 'すべて' | 'エサ生成' | '給餌' | '反応' | '個体作成' | 'エクスポート';

export const logFilters: LogFilter[] = ['すべて', 'エサ生成', '給餌', '反応', '個体作成', 'エクスポート'];

interface LogFilterChipsProps {
  value: LogFilter;
  onChange: (value: LogFilter) => void;
}

const LogFilterChips: React.FC<LogFilterChipsProps> = ({ value, onChange }) => {
  return (
    <div className="log-filter-chips" role="group" aria-label="ログフィルター">
      {logFilters.map(filter => (
        <button
          key={filter}
          type="button"
          className={value === filter ? 'active' : ''}
          onClick={() => onChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default LogFilterChips;
