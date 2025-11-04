import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

/**
 * セッション監視フック
 * - 定期的にセッションの有効性をチェック
 * - ユーザーアクティビティを追跡
 * - アイドル時間が長すぎる場合に警告
 */
export function useSessionMonitor(options = {}) {
  const {
    checkInterval = 5 * 60 * 1000, // 5分ごとにチェック
    maxIdleTime = 30 * 60 * 1000, // 30分でアイドル警告
    showWarning = true,
  } = options;

  const [isSessionValid, setIsSessionValid] = useState(true);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.checkAuth()) {
      return;
    }

    // 定期的なセッションチェック
    const sessionCheckInterval = setInterval(async () => {
      const isValid = await authService.checkSessionValidity();
      setIsSessionValid(isValid);

      if (!isValid) {
        console.warn('セッションが無効です');
        authService.logout();
        navigate('/login');
      }
    }, checkInterval);

    // アイドル時間チェック
    const idleCheckInterval = setInterval(() => {
      if (authService.isSessionIdle(maxIdleTime) && showWarning) {
        setShowIdleWarning(true);
      }
    }, 60 * 1000); // 1分ごとにチェック

    // ユーザーアクティビティの追跡
    const handleActivity = () => {
      authService.updateLastActivity();
      setShowIdleWarning(false);
    };

    // アクティビティイベントを監視
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      clearInterval(sessionCheckInterval);
      clearInterval(idleCheckInterval);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [checkInterval, maxIdleTime, showWarning, navigate]);

  const dismissWarning = () => {
    setShowIdleWarning(false);
    authService.updateLastActivity();
  };

  return {
    isSessionValid,
    showIdleWarning,
    dismissWarning,
  };
}
