# 農業育成アプリ (Agri Game App)

このリポジトリは、スマホ向け農業支援・育成ゲーム系 Web アプリの実験プロジェクトです。農業データを蓄積し、身体感覚と通知を接続することを目指します。まずは動作する小さなプロトタイプから始め、段階的に機能を追加していきます。

## プロジェクト構成

```
agri-game-app/
├── index.html             # エントリポイント (Vite が扱います)
├── package.json           # 依存関係とスクリプト定義
├── tsconfig.json          # TypeScript 設定
├── vite.config.ts         # Vite 設定
├── src/
│   ├── main.tsx           # React アプリのエントリ
│   ├── App.tsx            # ルーティングとナビゲーション
│   ├── pages/             # 各画面
│   │   ├── HomePage.tsx
│   │   ├── FeedPage.tsx
│   │   ├── ObservePage.tsx
│   │   └── LogPage.tsx
│   ├── components/        # 再利用可能な UI コンポーネント
│   │   ├── Navbar.tsx     # 下部ナビゲーションバー
│   │   └── Navbar.css
│   └── styles/
│       └── global.css     # 全体のスタイル
└── README.md
```

## インストールと実行

このプロジェクトは Vite を用いた React + TypeScript 構成です。ローカル環境で以下を実行して依存関係をインストールし、開発サーバーを起動してください。

```bash
npm install
npm run dev
```

`npm run dev` で Vite 開発サーバーが立ち上がり、ブラウザで確認できます。

本番ビルドを生成する場合は、以下を実行してください。

```bash
npm run build
```

`npm run preview` で本番ビルドのプレビューができます。

## GitHub Pages での公開

GitHub Pages で公開する場合の URL は以下です。

```text
https://open-agri-tec.github.io/12933315/
```

Vite の `base` は、この公開 URL のリポジトリ名に合わせて `/12933315/` に設定しています。

> **注意:** `node_modules` は Git 管理しないでください。依存パッケージは `package.json` と `package-lock.json` をもとに、必要な環境で `npm install` を実行して復元します。

## Git 運用

開発は `dev` ブランチで行い、安定版は `main` ブランチに保持します。新しい機能追加や実験は `feature/` プレフィックスのブランチで行ってください。小さな変更ごとにコミットし、変更理由を明確に残すことを推奨します。直接 `main` へ push しないように注意してください。

## UI 方針

スマホ縦画面を前提としたデザインで、高齢者にも見やすい UI を目指します。ボタンや文字は大きめにし、認知負荷を下げるよう配慮しています。将来的には朝昼夜の背景や季節の変化、ダークテーマ対応も可能な構造を目指します。

## 将来的な機能追加

- エサ生成や設定機能
- 育成モンスターの観察
- 栽培ログの記録と管理
- 温度表示や通知連携 (Discord など)
- AI による要約や農業データの可視化

継続的に改善し、実験的な要素を取り込みながら発展させていきます。