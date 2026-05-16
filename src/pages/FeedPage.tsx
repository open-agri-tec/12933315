import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import EmptyState from '../components/EmptyState';
import FeedCard from '../components/FeedCard';
import MainActionGrid from '../components/MainActionGrid';
import MonsterHeroCard from '../components/MonsterHeroCard';
import TagChip from '../components/TagChip';
import { TAGS } from '../context/FarmContext';

const FeedPage: React.FC = () => {
  const { activeMonster, createFood } = useFarm();
  const [memo, setMemo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [field, setField] = useState('');
  const [crop, setCrop] = useState('');

  if (!activeMonster) {
    return (
      <div className="page feed-page companion-page">
        <EmptyState title="最初のタマゴを作成してください" description="作物・圃場・作型を登録すると、エサ生成を開始できます。" icon="" actions={[{ label: 'タマゴを作る', to: '/egg/new', primary: true }]} />
      </div>
    );
  }

  const previewTags = selectedTags.length > 0 ? selectedTags : ['観察', '継続'];
  const recentFoods = activeMonster.foods.slice(0, 4);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(item => item !== tag) : [...prev, tag]);
  };

  const handleGenerate = () => {
    if (!memo.trim() && selectedTags.length === 0) {
      alert('タグかメモを入力してください。');
      return;
    }
    createFood(selectedTags, memo.trim(), 'manual', field.trim(), crop.trim());
    setMemo('');
    setSelectedTags([]);
    setField('');
    setCrop('');
  };

  return (
    <div className="page feed-page companion-page">
      <MonsterHeroCard monster={activeMonster} />
      <MainActionGrid />

      <div className="feed-create-layout">
        <section className="feed-create-steps glass-panel">
          <div className="section-heading">
            <h2>エサ生成</h2>
            <span>Step形式</span>
          </div>

          <div className="step-card">
            <span className="step-number">Step 01</span>
            <label>
              なにが起きましたか？
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={6} placeholder="例: 夕方に葉色が少し薄く見えた。A-3区画の水持ちも確認した。" />
            </label>
          </div>

          <div className="step-card step-grid-two">
            <span className="step-number">Step 02</span>
            <label>
              場所
              <input type="text" value={field} onChange={(e) => setField(e.target.value)} placeholder={`例: ${activeMonster.fieldAddress || 'A圃場'}`} />
            </label>
            <label>
              対象
              <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder={`例: ${activeMonster.crop || 'コメ'}`} />
            </label>
          </div>

          <div className="step-card">
            <span className="step-number">Step 03</span>
            <p className="step-title">タグをえらぶ</p>
            <div className="tag-selector">
              {TAGS.map(tag => (
                <button key={tag} type="button" className={selectedTags.includes(tag) ? 'tag active' : 'tag'} onClick={() => toggleTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button className="primary-button create-feed-button" type="button" onClick={handleGenerate}>エサにする</button>
          <div className="import-route soft-card-inline">
            <strong>CSV / Excelから作成</strong>
            <p>一括取り込みは次工程用に導線を保持しています。現在は手入力で検証できます。</p>
            <button className="secondary-button" type="button" disabled>ファイル連携を準備中</button>
          </div>
        </section>

        <aside className="feed-preview-column">
          <section className="soft-card">
            <div className="section-heading compact-heading">
              <h2>生成プレビュー</h2>
              <span>{previewTags.length}タグ</span>
            </div>
            <article className="feed-card preview-card">
              <div className="feed-card-main"><h3>{previewTags[0]}のエサ{memo ? `：${memo.slice(0, 12)}` : ''}</h3></div>
              <p className="feed-card-memo">{memo || 'メモを入力すると内容がここに表示されます。'}</p>
              <div className="chip-list">{previewTags.map(tag => <TagChip key={tag} label={tag} />)}</div>
            </article>
          </section>
          <section className="soft-card">
            <div className="section-heading compact-heading"><h2>最近作ったエサ</h2><span>{recentFoods.length}件</span></div>
            <div className="feed-list compact-list">
              {recentFoods.length > 0 ? recentFoods.map(food => <FeedCard key={food.id} food={food} compact />) : <p className="muted-text no-pad">まだ生成履歴がありません。</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default FeedPage;
