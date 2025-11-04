# Better HAC BFF (Backend for Frontend)

Better HAC アプリケーション用の BFF サーバーです。フロントエンドと HAC 本体 API の間に立ち、リクエストのプロキシとクッキー管理を行います。

## 概要

このBFFサーバーは以下の役割を果たします：

- **APIプロキシ**: フロントエンドから HAC 本体 API へのリクエストを中継
- **クッキー管理**: 認証セッションのクッキーを適切に転送
- **CORS対応**: 開発環境でのクロスオリジンリクエストを処理
- **Keep-Alive**: Render等のホスティングサービスでのスリープ防止

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### サーバーの起動

```bash
npm start
```

デフォルトではポート 3000 で起動します。環境変数 `PORT` で変更可能です。

```bash
PORT=8080 npm start
```

## APIエンドポイント

### ヘルスチェック

#### `GET /`
サーバーの稼働状態を確認

**レスポンス例:**
```json
{
  "status": "ok",
  "message": "Better HAC BFF Server is running",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

#### `GET /health`
Keep-Alive用エンドポイント（GitHub Actionsなどから定期的に叩く）

**レスポンス例:**
```json
{
  "status": "healthy",
  "uptime": "10分30秒",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "message": "Keep-Alive ping received"
}
```

---

### 認証関連

#### `POST /login_process.php`
ユーザーログイン処理

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
HAC本体APIからのレスポンスをそのまま返す + Set-Cookieヘッダー

---

#### `GET /dashboard.php`
ダッシュボードデータ取得（セッション確認も兼ねる）

**ヘッダー:**
- Cookie: セッションクッキーが必要

**レスポンス:**
HAC本体APIからのダッシュボードHTML/JSONをそのまま返す

---

### チャット関連

#### `POST /chat_api.php`
チャット機能の各種操作

**リクエストボディ (スレッド一覧取得):**
```json
{
  "action": "list"
}
```

**レスポンス例:**
```json
{
  "threads": [
    {
      "id": "thread_123",
      "first_message": "こんにちは",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "last_thread_id": "thread_123"
}
```

**リクエストボディ (メッセージ送信):**
```json
{
  "action": "send",
  "message": "こんにちは",
  "thread_id": "thread_123"  // 新規の場合はnull
}
```

**レスポンス例:**
```json
{
  "reply": "こんにちは！何かお手伝いできることはありますか？",
  "thread_id": "thread_123",
  "ctx_count": 2,
  "messages": [...]
}
```

**リクエストボディ (スレッド取得):**
```json
{
  "action": "get",
  "thread_id": "thread_123"
}
```

**リクエストボディ (スレッド非表示):**
```json
{
  "action": "hide",
  "thread_id": "thread_123"
}
```

---

### 画像生成関連

#### `POST /image_api.php`
プロンプトから画像を生成

**リクエストボディ:**
```json
{
  "prompt": "美しい夕日の風景"
}
```

**レスポンス例:**
```json
{
  "url": "https://example.com/generated-image.png"
}
```

**注意:**
- タイムアウト: 60秒
- 処理に時間がかかる場合があります

---

## 技術仕様

### 使用技術
- **Express.js**: Webフレームワーク
- **Axios**: HTTPクライアント
- **CORS**: クロスオリジン対応

### クッキー転送
クライアントから受け取ったクッキーをHAC本体APIに転送し、レスポンスのSet-Cookieヘッダーもクライアントに返します。

### エラーハンドリング
- 500エラー: サーバー内部エラー
- 504エラー: タイムアウト（画像生成など）
- 404エラー: 存在しないエンドポイント

## デプロイ

### Renderでのデプロイ
1. Renderで新しいWebサービスを作成
2. リポジトリを接続
3. 以下の設定を行う:
   - **Build Command**: `cd platform/better-hac-bff && npm install`
   - **Start Command**: `cd platform/better-hac-bff && npm start`
   - **Environment**: Node

### Keep-Alive設定
Renderの無料プランではアイドル状態でスリープするため、GitHub Actionsなどで定期的に `/health` エンドポイントを叩く必要があります。

**GitHub Actions例:**
```yaml
name: Keep BFF Alive
on:
  schedule:
    - cron: '*/10 * * * *'  # 10分ごと
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping health endpoint
        run: curl https://your-bff-url.onrender.com/health
```

## 開発

### ログ
リクエストとレスポンスの主要な情報がコンソールにログ出力されます。

### デバッグ
```bash
DEBUG=* npm start
```

## ライセンス

ISC
