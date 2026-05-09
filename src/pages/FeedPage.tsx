import React, { useState } from 'react';
import { useFarm, TAGS } from '../context/FarmContext';
import { Link } from 'react-router-dom';
import TagSelector from '../components/TagSelector';

/**
 * エサ生成画面。メモ入力とタグ選択によりエサを生成します。
 * 入力がない場合は自動タグ付けが行われます。
 */
const FeedPage: React.FC = () => {
  const { activeMonster, createFood } = useFarm();
  // 手動生成用の入力状態
  const [memo, setMemo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [field, setField] = useState('');
  const [crop, setCrop] = useState('');
  // クイック生成用のメモをカテゴリ別に保存
  const [quickMemo, setQuickMemo] = useState<Record<string, string>>({});

  if (!activeMonster) {
    return (
      <div className="page feed-page">
        <h1>エサ生成</h1>
        <div className="notice-card">
          <p>先にタマゴを作ってください。</p>
          <Link className="egg-create-link" to="/egg/new">タマゴの情報を入力する</Link>
        </div>
      </div>
    );
  }

  const handleGenerate = () => {
    if (!memo && selectedTags.length === 0) {
      alert('タグかメモを入力してください。');
      return;
    }
    createFood(selectedTags, memo, 'manual', field, crop);
    setMemo('');
    setSelectedTags([]);
    setField('');
    setCrop('');
  };

  const handleQuickGenerate = (tags: string[], label: string) => {
    const text = quickMemo[label]?.trim() || '';
    if (!text) {
      alert('メモを入力してください。');
      return;
    }
    createFood(tags, text, 'quick', field, crop);
    setQuickMemo(prev => ({ ...prev, [label]: '' }));
  };

  // クイックカテゴリ定義。必要であれば増やすことが可能。
  const quickCategories: { label: string; tags: string[]; placeholder: string }[] = [
    { label: '防除', tags: ['防除'], placeholder: '病害虫防除の内容...' },
    { label: '施肥', tags: ['施肥'], placeholder: '肥料や追肥の内容...' },
    { label: '機械', tags: ['機械'], placeholder: '機械整備や修理の内容...' },
    { label: '環境', tags: ['環境'], placeholder: '天気や圃場環境の内容...' }
  ];

  return (
    <div className="page feed-page">
      <h1>エサ生成</h1>
      {/* 圃場名と作物名の入力 */}
      <div>
        <label>
          圃場名:
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="例: A圃場"
          />
        </label>
        <label>
          作物名:
          <input
            type="text"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            placeholder="例: コメ"
          />
        </label>
        <label>
          メモ（自由記述）:
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            placeholder="観察内容や気づきなどを入力..."
          ></textarea>
        </label>
        <div>
          タグを選択:
          <TagSelector selected={selectedTags} onChange={setSelectedTags} />
        </div>
        <button onClick={handleGenerate}>エサを生成</button>
      </div>
      {/* クイック生成セクション */}
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px' }}>クイック生成</h2>
        {quickCategories.map((cat) => (
          <div key={cat.label} style={{ marginBottom: '16px' }}>
            <label>
              {cat.label}:
              <textarea
                value={quickMemo[cat.label] || ''}
                onChange={(e) => setQuickMemo(prev => ({ ...prev, [cat.label]: e.target.value }))}
                rows={2}
                placeholder={cat.placeholder}
              ></textarea>
            </label>
            <button onClick={() => handleQuickGenerate(cat.tags, cat.label)}>
              {cat.label}エサを生成
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;