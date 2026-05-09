import React, { createContext, useContext, useEffect, useState } from 'react';

// 定数：タグと軸の定義。HTML版から引用。
export const TAGS = [
  "観察","防除","施肥","生育","環境","機械","収量","販売","経費","地域","継続","異常","緊急","作業"
];
export const AXIS = [
  "自然性","生産性","社会性","知性","機械性","防御性"
];
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

export interface FarmState {
  foods: Food[];
  logs: LogEntry[];
  stats: Stats;
  tastes: string[];
  lastTags: string[];
  exp: number;
}

interface FarmContextType {
  state: FarmState;
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

const defaultState: FarmState = {
  foods: [],
  logs: [],
  stats: Object.fromEntries(AXIS.map(a => [a, 0])) as Stats,
  tastes: ["観察","環境","機械"],
  lastTags: [],
  exp: 0
};

const STORAGE_KEY = "localAiFarm";

const FarmContext = createContext<FarmContextType>({
  state: defaultState,
  createFood: () => {},
  feedFood: () => {},
  resetFarm: () => {},
});

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
  const [state, setState] = useState<FarmState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as Partial<FarmState>;
        return { ...defaultState, ...data };
      }
    } catch {}
    return defaultState;
  });

  // 保存用副作用
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      createdAt: new Date().toISOString(),
      name: foodName(chosenTags, memo),
      tags: chosenTags.slice(0, 5),
      memo,
      field,
      crop,
      source,
      fed: false
    };
    setState(prev => ({
      ...prev,
      foods: [newFood, ...prev.foods],
      logs: [
        {
          type: '生成',
          at: newFood.createdAt,
          text: `${newFood.name} / ${newFood.tags.join('・')}`,
          memo
        },
        ...prev.logs
      ]
    }));
  };

  const feedFood = (id: string) => {
    setState(prev => {
      const food = prev.foods.find(f => f.id === id);
      if (!food) return prev;
      const tasteHit = food.tags.filter(t => prev.tastes.includes(t)).length;
      const repeated = food.tags.filter(t => prev.lastTags.includes(t)).length;
      const novelty = food.tags.filter(t => !prev.lastTags.includes(t)).length;
      let score = tasteHit * 2 + novelty - repeated;
      // update stats
      const newStats: Stats = { ...prev.stats };
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
        ...prev.logs
      ];
      return {
        ...prev,
        foods: prev.foods.map(f => (f.id === id ? { ...f, fed: true } : f)),
        logs: newLogs,
        exp: prev.exp + Math.max(1, score + 2),
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
    <FarmContext.Provider value={{ state, createFood, feedFood, resetFarm }}>
      {children}
    </FarmContext.Provider>
  );
};

export function useFarm() {
  return useContext(FarmContext);
}
