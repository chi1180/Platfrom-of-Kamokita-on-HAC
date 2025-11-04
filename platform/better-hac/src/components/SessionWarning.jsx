import './SessionWarning.css';

function SessionWarning({ show, onDismiss, onLogout }) {
  if (!show) return null;

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="warning-icon">⚠️</div>
        <h2>セッションがまもなく期限切れになります</h2>
        <p>
          しばらく操作がありませんでした。
          <br />
          セッションを維持する場合は「続行」を、
          <br />
          終了する場合は「ログアウト」をクリックしてください。
        </p>
        <div className="warning-actions">
          <button onClick={onDismiss} className="continue-button">
            続行
          </button>
          <button onClick={onLogout} className="logout-button-warning">
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionWarning;
