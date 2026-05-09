import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// 定数：タグと軸の定義。HTML版から引用。
export const TAGS = [
  "観察","防除","施肥","生育","環境","機械","収量","販売","経費","地域","継続","異常","緊急","作業"
];
export const AXIS = [
  "自然性","生産性","社会性","知性","機械性","防御性"
];

export const CATEGORIES = [
  { key: 'rice', label: '米' },
  { key: 'vegetable', label: '蔬菜' },
  { key: 'fruit', label: '果樹' },
  { key: 'flower', label: '花き' },
  { key: 'livestock', label: '畜産' },
  { key: 'other', label: 'その他' }
] as const;

export type MonsterCategory = typeof CATEGORIES[number]['key'];

// タグから軸へのマッピング
const axisMap: Record<string, string[]> = {
  "観察": ["知性","自然性"],
  "防除": ["防御性","知性"],
  "施肥": ["生産性","自然性"],
  "生育": ["自然性","生産性"],
  "環境": ["自然性"],
  "機械": ["機械性"],
  "収量": ["生産性"],
  "販売": ["生産性","社会性"],
  "経費": ["生産性","知性"],
  "地域": ["社会性"],
  "継続": ["知性"],
  "異常": ["防御性"],
  "緊急": ["防御性","機械性"],
  "作業": ["知性","機械性"]
};

export interface Food {
  id: string;
  createdAt: string;
  name: string;
  tags: string[];
  memo: string;
  /**
   * 任意の圃場名。ユーザーが入力しない場合は空文字となります。
   */
  field?: string;
  /**
   * 任意の作物名。ユーザーが入力しない場合は空文字となります。
   */
  crop?: string;
  /**
   * エサの生成元。手動入力なら manual、クイック入力やCSVなど用途に応じて設定します。
   */
  source?: string;
  fed: boolean;
}

export interface LogEntry {
  type: string;
  at: string;
  text: string;
  memo?: string;
}

export interface Stats {
  [axis: string]: number;
}

export interface Monster {
  id: string;
  name: string;
  lifeStage: 'egg';
  category: MonsterCategory;
  crop: string;
  variety: string;
  fieldAddress: string;
  cultivationType: string;
  startDate?: string;
  memo?: string;
  foods: Food[];
  logs: LogEntry[];
  stats: Stats;
  tastes: string[];
  lastTags: string[];
  exp: number;
  visualProfile: {
    baseType: 'egg';
    cropMotif: string;
    colorTone: string;
    seed: number;
  };
}

export interface EggFormData {
  name: string;
  category: MonsterCategory;
  crop: string;
  variety: string;
  fieldAddress: string;
  cultivationType: string;
  startDate?: string;
  memo?: string;
}

export interface AppState {
  activeMonsterId: string | null;
  monsters: Monster[];
}

interface FarmContextType {
  state: AppState;
  activeMonster: Monster | null;
  createEgg: (form: EggFormData) => Monster;
  switchActiveMonster: (direction: -1 | 1) => void;
  createFood: (
    tags: string[],
    memo: string,
    source?: string,
    field?: string,
    crop?: string
  ) => void;
  feedFood: (id: string) => void;
  /**
   * 保存データを初期状態にリセットします。
   */
  resetFarm: () => void;
}

export const defaultStats = Object.fromEntries(AXIS.map(a => [a, 0])) as Stats;

const defaultState: AppState = {
  activeMonsterId: null,
  monsters: []
};

const STORAGE_KEY = "localAiFarm";

const FarmContext = createContext<FarmContextType>({
  state: defaultState,
  activeMonster: null,
  createEgg: () => makeEgg({
    name: '',
    category: 'other',
    crop: '',
    variety: '',
    fieldAddress: '',
    cultivationType: ''
  }),
  switchActiveMonster: () => {},
  createFood: () => {},
  feedFood: () => {},
  resetFarm: () => {},
});

function makeId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function categoryColor(category: MonsterCategory): string {
  const tones: Record<MonsterCategory, string> = {
    rice: '#d8c878',
    vegetable: '#88d8c0',
    fruit: '#f0a36f',
    flower: '#d79be8',
    livestock: '#caa47a',
    other: '#9fb0c4'
  };
  return tones[category];
}

function makeEgg(form: EggFormData, carry?: Partial<Monster>): Monster {
  const seed = Math.floor(Date.now() + Math.random() * 100000);
  return {
    id: makeId(),
    name: form.name,
    lifeStage: 'egg',
    category: form.category,
    crop: form.crop,
    variety: form.variety,
    fieldAddress: form.fieldAddress,
    cultivationType: form.cultivationType,
    startDate: form.startDate || undefined,
    memo: form.memo || undefined,
    foods: carry?.foods || [],
    logs: carry?.logs || [],
    stats: carry?.stats || { ...defaultStats },
    tastes: carry?.tastes || ["観察", "環境", "機械"],
    lastTags: carry?.lastTags || [],
    exp: carry?.exp || 0,
    visualProfile: {
      baseType: 'egg',
      cropMotif: form.crop,
      colorTone: categoryColor(form.category),
      seed
    }
  };
}

function isOldFarmState(data: Partial<Monster> & Record<string, unknown>): boolean {
  return Boolean(data.foods || data.logs || data.stats || data.tastes || data.lastTags || typeof data.exp === 'number');
}

function normalizeMonster(monster: Partial<Monster>, index: number): Monster {
  return {
    ...makeEgg({
      name: monster.name || `タマゴ${index + 1}`,
      category: monster.category || 'other',
      crop: monster.crop || '未設定',
      variety: monster.variety || '未設定',
      fieldAddress: monster.fieldAddress || '未設定',
      cultivationType: monster.cultivationType || '未設定',
      startDate: monster.startDate,
      memo: monster.memo
    }, monster),
    id: monster.id || makeId(),
    lifeStage: 'egg'
  };
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState;
    const data = JSON.parse(saved) as Partial<AppState> & Record<string, unknown>;

    if (Array.isArray(data.monsters)) {
      const monsters = data.monsters.map((monster, index) => normalizeMonster(monster, index));
      const activeMonsterId = monsters.some(m => m.id === data.activeMonsterId)
        ? data.activeMonsterId as string
        : monsters[0]?.id || null;
      return { activeMonsterId, monsters };
    }

    if (isOldFarmState(data)) {
      const migrated = makeEgg({
        name: '旧データのタマゴ',
        category: 'other',
        crop: '未設定',
        variety: '未設定',
        fieldAddress: '未設定',
        cultivationType: '未設定'
      }, {
        foods: Array.isArray(data.foods) ? data.foods as Food[] : [],
        logs: Array.isArray(data.logs) ? data.logs as LogEntry[] : [],
        stats: data.stats && typeof data.stats === 'object' ? data.stats as Stats : { ...defaultStats },
        tastes: Array.isArray(data.tastes) ? data.tastes as string[] : ["観察", "環境", "機械"],
        lastTags: Array.isArray(data.lastTags) ? data.lastTags as string[] : [],
        exp: typeof data.exp === 'number' ? data.exp : 0
      });
      return { activeMonsterId: migrated.id, monsters: [migrated] };
    }
  } catch {}
  return defaultState;
}

// ユーティリティ：HTML版のロジックを基にタグ付けを自動生成
export function autoTags(text: string): string[] {
  const found: string[] = [];
  const rules: Array<[string, RegExp]> = [
    ["防除", /防除|薬|病|虫|菌|べと|農薬/],
    ["施肥", /肥|窒素|リン|カリ|追肥|元肥/],
    ["機械", /機械|エンジン|モーター|修理|整備|ローバー|草刈/],
    ["環境", /雨|水|風|温度|湿度|天気|土|圃場/],
    ["販売", /販売|価格|売上|出荷/],
    ["収量", /収量|収穫|俵|kg|数量/],
    ["異常", /異常|枯|悪い|被害|失敗|病気/],
    ["観察", /見た|気づ|観察|葉色|生育/]
  ];
  rules.forEach(([tag, re]) => {
    if (re.test(text)) found.push(tag);
  });
  if (!found.length) found.push("観察");
  if (!found.includes("継続")) found.push("継続");
  return found.slice(0, 5);
}

// 食品名生成
function foodName(tags: string[], memo: string): string {
  const base = tags[0] || "未分類";
  const words = memo.trim().slice(0, 12);
  return `${base}のエサ${words ? "：" + words : ""}`;
}

export const FarmProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState);

  const activeMonster = useMemo(() => {
    return state.monsters.find(monster => monster.id === state.activeMonsterId) || null;
  }, [state.activeMonsterId, state.monsters]);

  // 保存用副作用
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateActiveMonster = (updater: (monster: Monster) => Monster) => {
    setState(prev => {
      if (!prev.activeMonsterId) return prev;
      return {
        ...prev,
        monsters: prev.monsters.map(monster => (
          monster.id === prev.activeMonsterId ? updater(monster) : monster
        ))
      };
    });
  };

  const createEgg = (form: EggFormData) => {
    const egg = makeEgg(form);
    setState(prev => ({
      activeMonsterId: egg.id,
      monsters: [...prev.monsters, egg]
    }));
    return egg;
  };

  const switchActiveMonster = (direction: -1 | 1) => {
    setState(prev => {
      if (prev.monsters.length < 2) return prev;
      const currentIndex = Math.max(0, prev.monsters.findIndex(m => m.id === prev.activeMonsterId));
      const nextIndex = (currentIndex + direction + prev.monsters.length) % prev.monsters.length;
      return { ...prev, activeMonsterId: prev.monsters[nextIndex].id };
    });
  };

  const createFood = (
    tags: string[],
    memo: string,
    source: string = 'manual',
    field: string = '',
    crop: string = ''
  ) => {
    // タグとメモの両方が空の場合は生成しない
    if (!memo && tags.length === 0) return;
    const chosenTags = tags.length ? tags : autoTags(memo);
    const newFood: Food = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      name: foodName(chosenTags, memo),
      tags: chosenTags.slice(0, 5),
      memo,
      field,
      crop,
      source,
      fed: false
    };
    updateActiveMonster(monster => ({
      ...monster,
      foods: [newFood, ...monster.foods],
      logs: [
        {
          type: '生成',
          at: newFood.createdAt,
          text: `${newFood.name} / ${newFood.tags.join('・')}`,
          memo
        },
        ...monster.logs
      ]
    }));
  };

  const feedFood = (id: string) => {
    updateActiveMonster(monster => {
      const food = monster.foods.find(f => f.id === id);
      if (!food) return monster;
      const tasteHit = food.tags.filter(t => monster.tastes.includes(t)).length;
      const repeated = food.tags.filter(t => monster.lastTags.includes(t)).length;
      const novelty = food.tags.filter(t => !monster.lastTags.includes(t)).length;
      let score = tasteHit * 2 + novelty - repeated;
      // update stats
      const newStats: Stats = { ...monster.stats };
      food.tags.forEach(tag => {
        (axisMap[tag] || []).forEach(axis => {
          newStats[axis] = Math.min(100, (newStats[axis] || 0) + 7);
        });
      });
      const newLogs: LogEntry[] = [
        {
          type: "給餌",
          at: new Date().toISOString(),
          text: `${score >= 4 ? "大好物" : score <= 0 ? "苦手" : "普通"}：${food.name}`,
          memo: `${score >= 4 ? "強く反応した。これは好きな情報らしい。" : score <= 0 ? "少し嫌がった。同じ傾向に飽きている。" : "もぐもぐ……情報を取り込んだ。"} / タグ：${food.tags.join("・")}`
        },
        ...monster.logs
      ];
      return {
        ...monster,
        foods: monster.foods.map(f => (f.id === id ? { ...f, fed: true } : f)),
        logs: newLogs,
        exp: monster.exp + Math.max(1, score + 2),
        lastTags: food.tags.slice(),
        stats: newStats
      };
    });
  };

  // データを初期状態にリセットする
  const resetFarm = () => {
    setState(() => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      return { ...defaultState };
    });
  };

  return (
    <FarmContext.Provider value={{ state, activeMonster, createEgg, switchActiveMonster, createFood, feedFood, resetFarm }}>
      {children}
    </FarmContext.Provider>
  );
};

export function useFarm() {
  return useContext(FarmContext);
}
