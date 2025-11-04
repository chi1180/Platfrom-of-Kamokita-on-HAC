import { useContext } from "react";
import { ToastContext } from "../contexts/ToastContext";

/**
 * トースト通知を簡単に使うためのカスタムフック
 *
 * @example
 * const { showToast } = useToast();
 * showToast('画像を生成しました！', 'success');
 * showToast('エラーが発生しました', 'error');
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { addToast, removeToast } = context;

  /**
   * トースト通知を表示
   * @param {string} message - 表示するメッセージ
   * @param {string} type - トーストのタイプ ('success' | 'error' | 'warning' | 'info')
   * @param {number} duration - 表示時間（ミリ秒）デフォルト5000ms
   * @returns {number} トーストID
   */
  const showToast = (message, type = "info", duration = 5000) => {
    return addToast(message, type, duration);
  };

  /**
   * 成功メッセージを表示
   * @param {string} message - 表示するメッセージ
   * @param {number} duration - 表示時間（ミリ秒）
   */
  const success = (message, duration = 5000) => {
    return addToast(message, "success", duration);
  };

  /**
   * エラーメッセージを表示
   * @param {string} message - 表示するメッセージ
   * @param {number} duration - 表示時間（ミリ秒）
   */
  const error = (message, duration = 5000) => {
    return addToast(message, "error", duration);
  };

  /**
   * 警告メッセージを表示
   * @param {string} message - 表示するメッセージ
   * @param {number} duration - 表示時間（ミリ秒）
   */
  const warning = (message, duration = 5000) => {
    return addToast(message, "warning", duration);
  };

  /**
   * 情報メッセージを表示
   * @param {string} message - 表示するメッセージ
   * @param {number} duration - 表示時間（ミリ秒）
   */
  const info = (message, duration = 5000) => {
    return addToast(message, "info", duration);
  };

  return {
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}
