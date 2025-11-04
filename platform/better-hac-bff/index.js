const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

// 外部API（HAC本体）のベースURL
const HAC_API_BASE = "https://hac.hiroshima-aiclub.org";

// ミドルウェア設定
app.use(
  cors({
    origin: true, // 開発時は全てのオリジンを許可
    credentials: true, // クッキーを含むリクエストを許可
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Axiosインスタンスの作成（クッキー転送用）
const createProxyRequest = (req) => {
  const headers = {
    "Content-Type": req.headers["content-type"] || "application/json",
  };

  // クッキーを転送
  if (req.headers.cookie) {
    headers.Cookie = req.headers.cookie;
  }

  return axios.create({
    headers,
    maxRedirects: 0,
    validateStatus: (status) => status < 500, // 500未満のステータスは全て受け付ける
  });
};

// クッキーをレスポンスに転送
const forwardCookies = (proxyResponse, res) => {
  const setCookie = proxyResponse.headers["set-cookie"];
  if (setCookie) {
    res.setHeader("Set-Cookie", setCookie);
  }
};

// =====================
// ヘルスチェック
// =====================

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Better HAC BFF Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Keep-Alive専用エンドポイント（GitHub Actionsから叩く）
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  res.json({
    status: "healthy",
    uptime: `${Math.floor(uptime / 60)}分${Math.floor(uptime % 60)}秒`,
    timestamp: new Date().toISOString(),
    message: "Keep-Alive ping received",
  });
});

// =====================
// 認証関連エンドポイント
// =====================

/**
 * ログイン処理
 * POST /login_process.php
 */
app.post("/login_process.php", async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body.email });

    const axiosInstance = createProxyRequest(req);

    // URLSearchParamsを使用してapplication/x-www-form-urlencoded形式で送信
    const params = new URLSearchParams();
    params.append("email", req.body.email);
    params.append("password", req.body.password);

    const response = await axiosInstance.post(
      `${HAC_API_BASE}/login_process.php`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // クッキーを転送
    forwardCookies(response, res);

    console.log("Login response status:", response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      error: "ログイン処理に失敗しました",
      message: error.message,
    });
  }
});

/**
 * ダッシュボードデータ取得
 * GET /dashboard.php
 */
app.get("/dashboard.php", async (req, res) => {
  try {
    console.log("Dashboard request received");

    const axiosInstance = createProxyRequest(req);

    const response = await axiosInstance.get(`${HAC_API_BASE}/dashboard.php`);

    // クッキーを転送
    forwardCookies(response, res);

    console.log("Dashboard response status:", response.status);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({
      success: false,
      error: "ダッシュボードの取得に失敗しました",
      message: error.message,
    });
  }
});

// =====================
// チャット関連エンドポイント
// =====================

/**
 * チャットAPI
 * POST /chat_api.php
 *
 * アクション:
 * - list: スレッド一覧取得
 * - send: メッセージ送信
 * - get: スレッド詳細取得
 * - hide: スレッド非表示
 */
app.post("/chat_api.php", async (req, res) => {
  try {
    const { action } = req.body;
    console.log("Chat API request received:", { action });

    const axiosInstance = createProxyRequest(req);

    const response = await axiosInstance.post(
      `${HAC_API_BASE}/chat_api.php`,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // クッキーを転送
    forwardCookies(response, res);

    console.log("Chat API response status:", response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Chat API error:", error.message);
    res.status(500).json({
      success: false,
      error: "チャットAPIの処理に失敗しました",
      message: error.message,
    });
  }
});

// =====================
// 画像生成関連エンドポイント
// =====================

/**
 * 画像生成API
 * POST /image_api.php
 */
app.post("/image_api.php", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("Image generation request received:", { prompt });

    const axiosInstance = createProxyRequest(req);

    const response = await axiosInstance.post(
      `${HAC_API_BASE}/image_api.php`,
      { prompt },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 画像生成は時間がかかる可能性があるので60秒
      },
    );

    // クッキーを転送
    forwardCookies(response, res);

    console.log("Image generation response status:", response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Image generation error:", error.message);

    // タイムアウトの場合
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        error: "画像生成がタイムアウトしました",
        message: "リクエストに時間がかかりすぎています",
      });
    }

    res.status(500).json({
      success: false,
      error: "画像生成に失敗しました",
      message: error.message,
    });
  }
});

// =====================
// エラーハンドリング
// =====================

// グローバルエラーハンドラー
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  });
});

// 404ハンドラー
app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.path);
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Endpoint ${req.method} ${req.path} does not exist`,
  });
});

// =====================
// サーバー起動
// =====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Better HAC BFF Server listening on port ${PORT}`);
  console.log(`Proxying to: ${HAC_API_BASE}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});
