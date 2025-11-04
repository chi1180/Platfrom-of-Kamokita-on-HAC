import axios from "axios";

// 開発環境ではプロキシを使用、本番環境では直接APIを呼び出す
const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://bff-for-better-hac.onrender.com";

class AuthService {
  constructor() {
    // 認証専用のaxiosインスタンスを作成
    this.authAxios = axios.create({
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // 認証専用インスタンスにのみインターセプターを適用
    this.authAxios.interceptors.response.use(
      (response) => {
        // 正常なレスポンスはそのまま返す
        return response;
      },
      (error) => {
        // 401 Unauthorized または 403 Forbidden の場合
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          console.warn("セッションが期限切れです。ログアウトします。");
          this.logout();

          // ログインページにリダイレクト
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async login(email, password) {
    try {
      console.log("Logging in to:", `${API_BASE_URL}/login_process.php`);

      // URLSearchParamsを使用してapplication/x-www-form-urlencoded形式で送信
      const params = new URLSearchParams();
      params.append("email", email);
      params.append("password", password);

      const response = await this.authAxios.post(
        `${API_BASE_URL}/login_process.php`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      console.log("Login response status:", response.status);
      console.log("Login response headers:", response.headers);
      console.log("Cookies after login:", document.cookie);

      // ログイン成功
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("lastActivity", Date.now().toString());
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Login error response:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || "ログインに失敗しました",
      };
    }
  }

  async fetchDashboard() {
    try {
      console.log("Fetching dashboard, cookies:", document.cookie);

      const response = await this.authAxios.get(
        `${API_BASE_URL}/dashboard.php`,
      );

      // アクティビティ時刻を更新
      this.updateLastActivity();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      console.error("Dashboard error response:", error.response?.data);
      return {
        success: false,
        error: "ダッシュボードの取得に失敗しました",
      };
    }
  }

  async checkSessionValidity() {
    try {
      // 軽量なリクエストでセッションの有効性を確認
      const response = await this.authAxios.get(
        `${API_BASE_URL}/dashboard.php`,
        {
          timeout: 5000,
        },
      );

      this.updateLastActivity();
      return response.status === 200;
    } catch (error) {
      console.error("Session check failed:", error);
      return false;
    }
  }

  updateLastActivity() {
    localStorage.setItem("lastActivity", Date.now().toString());
  }

  logout() {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("lastActivity");
    localStorage.removeItem("activeTab");
    localStorage.removeItem("chatSidebarCollapsed");
  }

  checkAuth() {
    return localStorage.getItem("isAuthenticated") === "true";
  }

  getUser() {
    const email = localStorage.getItem("userEmail");
    return email ? { email } : null;
  }

  getLastActivity() {
    const lastActivity = localStorage.getItem("lastActivity");
    return lastActivity ? parseInt(lastActivity, 10) : null;
  }

  // セッションのアイドル時間をチェック（ミリ秒単位）
  isSessionIdle(maxIdleTime = 30 * 60 * 1000) {
    // デフォルト30分
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return true;

    return Date.now() - lastActivity > maxIdleTime;
  }
}

export default new AuthService();
