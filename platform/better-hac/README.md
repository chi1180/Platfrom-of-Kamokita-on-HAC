# Better HAC

広島AIクラブ 2025年度プロジェクト - 賀茂北高等学校の課題管理システム改善プロトタイプ

## 概要

このプロジェクトは、賀茂北高等学校の課題管理システム（HAC）をより使いやすく改善するためのプロトタイプです。

## 機能（予定）

- 📝 課題一覧の表示
- ⏰ 提出期限の管理
- 🔍 科目別フィルター
- 🔔 通知機能
- 📊 進捗状況の可視化

## 開発環境

- React 18.2
- Vite 5.0
- vite-plugin-singlefile

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド（単一HTMLファイルを生成）
npm run build
```

## ビルド

`npm run build` を実行すると、`../../dist/` ディレクトリに単一のHTMLファイルが生成されます。
このファイルには、すべてのCSS、JavaScript、アセットがインライン化されています。

## プロジェクト構成

```
better-hac/
├── src/
│   ├── App.jsx          # メインコンポーネント
│   ├── App.css          # アプリケーションスタイル
│   ├── main.jsx         # エントリーポイント
│   └── index.css        # グローバルスタイル
├── index.html           # HTMLテンプレート
├── vite.config.js       # Vite設定（単一ファイル出力）
└── package.json
```

## ライセンス

© 2025 Hiroshima AI Club - Kamokita High School
