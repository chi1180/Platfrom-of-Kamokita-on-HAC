import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import { useSessionMonitor } from "../hooks/useSessionMonitor";
import SessionWarning from "../components/SessionWarning";
import Chat from "./Chat";
import ImageGen from "./ImageGen";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    // localStorageから前回のタブを復元
    const savedTab = localStorage.getItem("activeTab");
    return savedTab || "dashboard";
  });
  const navigate = useNavigate();

  // セッション監視フックを使用
  const { isSessionValid, showIdleWarning, dismissWarning } = useSessionMonitor(
    {
      checkInterval: 5 * 60 * 1000, // 5分ごとにチェック
      maxIdleTime: 30 * 60 * 1000, // 30分でアイドル警告
      showWarning: true,
    },
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!authService.checkAuth()) {
        navigate("/login");
        return;
      }

      setUser(authService.getUser());
      setLoading(false);
    };

    checkAuthentication();
  }, [navigate]);

  // activeTabが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    authService.logout();
    // ログアウト時はタブ情報もクリア
    localStorage.removeItem("activeTab");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* セッション警告モーダル */}
      <SessionWarning
        show={showIdleWarning}
        onDismiss={dismissWarning}
        onLogout={handleLogout}
      />

      {activeTab !== "chat" && (
        <header className="dashboard-header">
          <div className="header-content">
            <h1>
              <span className="accented-text">Better</span>
              &nbsp;HAC for Student
            </h1>
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <button onClick={handleLogout} className="logout-button">
                ログアウト
              </button>
            </div>
          </div>

          <div className="tabs-container">
            <button
              className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              ダッシュボード
            </button>
            <button
              className={`tab ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              チャット
            </button>
            <button
              className={`tab ${activeTab === "image" ? "active" : ""}`}
              onClick={() => setActiveTab("image")}
            >
              画像生成
            </button>
          </div>
        </header>
      )}

      {activeTab === "dashboard" && (
        <main className="dashboard-main">
          <div className="welcome-section">
            <h2>ようこそ！</h2>
            <p>ひろしまAI部のHAC for Studentへようこそ。</p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">📚</div>
              <h3>課題一覧</h3>
              <p>提出期限が近い課題をチェックしましょう</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">件の課題</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">✅</div>
              <h3>提出済み</h3>
              <p>提出完了した課題の一覧</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">件完了</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">⏰</div>
              <h3>期限間近</h3>
              <p>今週中に提出が必要な課題</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">件の課題</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">📊</div>
              <h3>進捗状況</h3>
              <p>全体の提出状況を確認</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">%完了</span>
              </div>
            </div>
          </div>

          <div className="recent-section">
            <h2>最近の活動</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📝</div>
                <div className="activity-content">
                  <h4>新しい課題が追加されました</h4>
                  <p className="activity-time">準備中</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🎯</div>
                <div className="activity-content">
                  <h4>システムが改善されました</h4>
                  <p className="activity-time">より使いやすくなりました</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-card">
              <h3>📖 利用ガイド</h3>
              <p>
                HAC for Studentの使い方については、
                <a href="#" className="info-link">
                  利用ガイドライン
                </a>
                をご確認ください。
              </p>
            </div>

            <div className="info-card">
              <h3>💡 お知らせ</h3>
              <p>
                このシステムは賀茂北高等学校とひろしまAI部による
                改善版プロトタイプです。フィードバックをお待ちしています。
              </p>
            </div>
          </div>

          <footer className="dashboard-footer">
            <p>© 2025 Hiroshima AI Club - Kamokita High School</p>
          </footer>
        </main>
      )}

      {activeTab === "chat" && (
        <div className="full-page-content">
          <Chat
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            userEmail={user?.email}
          />
        </div>
      )}
      {activeTab === "image" && <ImageGen />}
    </div>
  );
}

export default Dashboard;
