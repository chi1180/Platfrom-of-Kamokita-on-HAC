import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import { useToast } from "../hooks/useToast";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authService.login(email, password);

    if (result.success) {
      showToast("ログインしました", "success");
      navigate("/dashboard");
    } else {
      setError(result.error || "ログインに失敗しました");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>
            Hiroshima AI club
            <br />
            HAC
            <br />
            for student
          </h1>
          <p className="login-subtitle">ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@g.hiroshima-c.ed.jp"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="login-footer">
          <p className="agreement-text">
            上記のログインボタンを押すことで
            <br />
            <a
              href="https://hac.hiroshima-aiclub.org/assets/HACforStudent_guide_070716.pdf"
              target="_blank"
              rel="noopener"
            >
              「ひろしまAI部生成AIチャット「HAC for Student」利用ガイドライン」
            </a>
            <br />
            の内容に承諾したこととします。
          </p>
          <div className="login-links">
            <a
              href="https://xs637603.xsrv.jp/babco/level3/public/kamokita/index.html"
              target="_blank"
              rel="noopener"
              className="login-link"
            >
              賀茂北 AI club
            </a>
            <a
              href="https://hac.hiroshima-aiclub.org/"
              target="_blank"
              rel="noopener"
              className="login-link"
            >
              GitHubリポジトリ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
