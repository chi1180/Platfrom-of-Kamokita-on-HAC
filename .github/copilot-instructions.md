# Copilot Instructions for Platform of Kamokita on HAC

## このドキュメントについて

- GitHub Copilot や各種 AI ツールが本リポジトリのコンテキストを理解しやすくするためのガイドです。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。

## 前提条件

- 回答は必ず日本語でしてください。
- 何か大きい変更を加える場合（既存のコード200行以上書き換える場合。新規に200行以上のコードを追加する場合は問題なし。）、まず何をするのか計画を立てた上で、ユーザーに「このような計画で進めようと思います。」と提案してください。この時、ユーザーから計画の修正を求められた場合は計画を修正して、再提案をしてください。

## アプリ概要

開発サービスをまとめるリポジトリです。

### 主な機能

- **ペライチHTML**: Reactベースで作成したサービスをペライチのHTMLに変換し、Babcoでホスティングします。
- **ユーザー認証**: HAC用のカスタマイズされた認証システムを用いてユーザのログインを管理します。
- **独自機能**: HACのニーズに合わせた独自機能を提供します。

## 技術スタック概要

- **UIコンポーネント**: React

## プロジェクト構成と役割

本アプリはdist&platformディレクトリに大きく分けられます。
distでは個々のアプリがペライチのHTMLになり、platformではサービスごとにReactベースでの開発が行われます。

### platform/better-hac の構成

Reactベースのフロントエンドアプリケーション。Viteを使用してビルドされます。

### platform/better-hac-bff の構成

**BFF (Backend For Frontend)**: Express.jsベースのプロキシサーバー

- HAC本体APIとフロントエンドの間に位置し、CORS問題を解決
- クッキーベースの認証情報を適切に転送
- エンドポイント: 各種HAC APIへのプロキシ

---

## better-hac の詳細構成

#### 認証システム

- **メイン認証** (`services/auth.js`): HAC全体の認証を管理

#### コンテキスト

- **ToastContext** (`contexts/ToastContext.jsx`): トースト通知の管理

#### ページ構成

- **Login** (`pages/Login.jsx`): HAC全体のログインページ
- **Dashboard** (`pages/Dashboard.jsx`): メインダッシュボード、タブ切り替え機能
- **Chat** (`pages/Chat.jsx`): チャット機能
- **ImageGen** (`pages/ImageGen.jsx`): 画像生成機能

#### コンポーネント

- **SessionWarning** (`components/SessionWarning.jsx`): セッション警告モーダル
- **Toast** (`components/Toast.jsx`): 個別トースト通知コンポーネント
- **ToastContainer** (`components/ToastContainer.jsx`): トースト表示コンテナ

#### カスタムフック

- **useSessionMonitor** (`hooks/useSessionMonitor.js`): セッション監視とアイドル検知
- **useToast** (`hooks/useToast.js`): トースト通知の表示制御

#### サービス層

- `services/auth.js`: メイン認証サービス
- `services/chat.js`: チャットAPI通信
- `services/image.js`: 画像生成API通信
- `services/imageStorage.js`: 画像ストレージ管理

## コーディング規約・ベストプラクティス

### コード編集後に毎回すべきこと

このファイル（.github/copilot-instructions.md）の、「プロジェクト構成と役割」の部分について、アップデートが必要な点があればアップデートしてください。
アップデートした内容に関しては、ユーザに伝えといてください。

### コメント

- **JSDoc**: 複雑な関数には JSDoc コメントを付与
- **TODO コメント**: タスクについてはその箇所に \'// TODO ::: [ ] here is to do content\' を残す

## アンチパターン

以下のパターンは避けてください。既存コードで発見した場合は、リファクタリングを提案してください。

### コンポーネント設計

- **巨大コンポーネント**: 1つのコンポーネントが200行を超える場合は分割を検討
- **Prop Drilling**: 深い階層での props バケツリレーは、Context や状態管理ライブラリで解決
- **useEffect の濫用**: データフェッチは React Query、イベントハンドラーで済む処理は useEffect を使わない

### 状態管理

- **過度なグローバル状態**: 真にグローバルな状態のみを Zustand で管理
- **useState の濫用**: 複雑な状態は useReducer で管理
- **直接的な状態変更**: イミュータブルな更新を心がける

### パフォーマンス

- **不要な再レンダリング**: React DevTools Profiler で計測し、必要に応じて最適化
- **過度な最適化**: 実測せずに useMemo/useCallback を多用しない
- **巨大なバンドル**: Code Splitting を活用し、初期ロードを軽量化
