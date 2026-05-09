import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, EggFormData, MonsterCategory, useFarm } from '../context/FarmContext';

const initialForm: EggFormData = {
  name: '',
  category: 'rice',
  crop: '',
  variety: '',
  fieldAddress: '',
  cultivationType: '',
  startDate: '',
  memo: ''
};

const requiredFields: Array<keyof Pick<EggFormData, 'name' | 'crop' | 'variety' | 'fieldAddress' | 'cultivationType'>> = [
  'name',
  'crop',
  'variety',
  'fieldAddress',
  'cultivationType'
];

const EggCreatePage: React.FC = () => {
  const { createEgg } = useFarm();
  const navigate = useNavigate();
  const [form, setForm] = useState<EggFormData>(initialForm);
  const [error, setError] = useState('');

  const updateForm = (key: keyof EggFormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hasEmpty = requiredFields.some(key => !String(form[key] || '').trim());
    if (hasEmpty || !form.category) {
      setError('必須項目を入力してください。');
      return;
    }

    createEgg({
      ...form,
      name: form.name.trim(),
      crop: form.crop.trim(),
      variety: form.variety.trim(),
      fieldAddress: form.fieldAddress.trim(),
      cultivationType: form.cultivationType.trim(),
      startDate: form.startDate || undefined,
      memo: form.memo?.trim() || undefined
    });
    navigate('/');
  };

  return (
    <div className="page egg-create-page">
      <h1>タマゴを作る</h1>
      <form className="egg-form" onSubmit={handleSubmit}>
        <label>
          タマゴ名 <span className="required">必須</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            placeholder="例: 春田の観察タマゴ"
            required
          />
        </label>
        <label>
          分類 <span className="required">必須</span>
          <select
            value={form.category}
            onChange={(e) => updateForm('category', e.target.value as MonsterCategory)}
            required
          >
            {CATEGORIES.map(category => (
              <option key={category.key} value={category.key}>{category.label}</option>
            ))}
          </select>
        </label>
        <label>
          作物名 <span className="required">必須</span>
          <input
            type="text"
            value={form.crop}
            onChange={(e) => updateForm('crop', e.target.value)}
            placeholder="例: コメ"
            required
          />
        </label>
        <label>
          栽培品種 <span className="required">必須</span>
          <input
            type="text"
            value={form.variety}
            onChange={(e) => updateForm('variety', e.target.value)}
            placeholder="例: コシヒカリ"
            required
          />
        </label>
        <label>
          ほ場番地・区画名 <span className="required">必須</span>
          <input
            type="text"
            value={form.fieldAddress}
            onChange={(e) => updateForm('fieldAddress', e.target.value)}
            placeholder="例: A-3区画"
            required
          />
        </label>
        <label>
          作型・栽培方式 <span className="required">必須</span>
          <input
            type="text"
            value={form.cultivationType}
            onChange={(e) => updateForm('cultivationType', e.target.value)}
            placeholder="例: 露地 / 有機栽培"
            required
          />
        </label>
        <label>
          開始日 <span className="optional">任意</span>
          <input
            type="date"
            value={form.startDate || ''}
            onChange={(e) => updateForm('startDate', e.target.value)}
          />
        </label>
        <label>
          メモ <span className="optional">任意</span>
          <textarea
            value={form.memo || ''}
            onChange={(e) => updateForm('memo', e.target.value)}
            rows={4}
            placeholder="このタマゴにためたい農業データの方針など"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="gold" type="submit">タマゴを作成する</button>
      </form>
    </div>
  );
};

export default EggCreatePage;
