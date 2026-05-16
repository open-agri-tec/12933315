import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import TagSelector from '../components/TagSelector';
import EmptyState from '../components/EmptyState';

/**
 * エサ生成画面。メモ入力とタグ選択によりエサを生成します。
 * 入力がない場合は自動タグ付けが行われます。
 */
const FeedPage: React.FC = () => {
  const { activeMonster, createFood } = useFarm();
  const [memo, setMemo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [field, setField] = useState('');
  const [crop, setCrop] = useState('');
  const [quickMemo, setQuickMemo] = useState<Record<string, string>>({});

  if (!activeMonster) {
    return (
      <div className="page feed-page">
        <h1>エサ生成</h1>
        <EmptyState
          title="最初のタマゴを作成してください"
          description="作物・圃場・作型を登録すると、育成対象の個体が生まれます。"
          icon="🥚"
          actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]}
        />
      </div>
    );
  }

  const pendingFoods = activeMonster.foods.filter(food => !food.fed);
  const recentFoods = activeMonster.foods.slice(0, 6);
  const previewTags = selectedTags.length > 0 ? selectedTags : ['観察', '継続'];

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

  const quickCategories: { label: string; tags: string[]; placeholder: string }[] = [
    { label: '防除', tags: ['防除'], placeholder: '病害虫防除の内容...' },
    { label: '施肥', tags: ['施肥'], placeholder: '肥料や追肥の内容...' },
    { label: '機械', tags: ['機械'], placeholder: '機械整備や修理の内容...' },
    { label: '環境', tags: ['環境'], placeholder: '天気や圃場環境の内容...' }
  ];

  return (
    <div className="page feed-page">
      <h1>エサ生成</h1>
      <div className="feed-grid">
        <section className="panel-card feed-form-panel">
          <h2>作業メモから作る</h2>
          <label>
            圃場名
            <input type="text" value={field} onChange={(e) => setField(e.target.value)} placeholder="例: A圃場" />
          </label>
          <label>
            作物名
            <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="例: コメ" />
          </label>
          <label>
            メモ（自由記述）
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={5} placeholder="観察内容や気づきなどを入力..." />
          </label>
          <button onClick={handleGenerate}>エサを生成</button>
        </section>

        <section className="panel-card feed-preview-panel">
          <h2>生成プレビュー / タグ選択</h2>
          <p className="muted-text">選択したタグは、内部軸と好み傾向の変化に使われます。</p>
          <TagSelector selected={selectedTags} onChange={setSelectedTags} />
          <div className="food-card preview-card">
            <div className="food-name">{previewTags[0]}のエサ{memo ? `：${memo.slice(0, 12)}` : ''}</div>
            <div className="food-meta">{previewTags.map(t => `＃${t}`).join('　')}</div>
            <div className="food-meta">{memo || 'メモを入力すると内容がここに表示されます。'}</div>
          </div>
          <div className="quick-generate-list">
            <h3>クイック生成</h3>
            {quickCategories.map((cat) => (
              <div key={cat.label} className="quick-generate-item">
                <label>
                  {cat.label}
                  <textarea value={quickMemo[cat.label] || ''} onChange={(e) => setQuickMemo(prev => ({ ...prev, [cat.label]: e.target.value }))} rows={2} placeholder={cat.placeholder} />
                </label>
                <button onClick={() => handleQuickGenerate(cat.tags, cat.label)}>{cat.label}エサを生成</button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card feed-history-panel">
          <div className="section-heading">
            <h2>未給餌エサ一覧</h2>
            <span>{pendingFoods.length}件</span>
          </div>
          {pendingFoods.length === 0 ? (
            <EmptyState title="未給餌のエサはありません" description="作業メモや観察メモからエサを生成できます。" icon="🍽️" actions={[{ label: 'エサを作る', to: '/feed', primary: true }]} />
          ) : (
            <div className="food-list compact-list">
              {pendingFoods.map(food => (
                <div key={food.id} className="food-card">
                  <div className="food-name">{food.name}</div>
                  <div className="food-meta">{food.tags.map(t => `＃${t}`).join('　')}</div>
                </div>
              ))}
            </div>
          )}
          <div className="section-heading recent-heading">
            <h2>最近の生成履歴</h2>
            <span>{recentFoods.length}件</span>
          </div>
          <div className="mini-log-list">
            {recentFoods.map(food => <p key={food.id}>{food.name}</p>)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeedPage;
