import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "https://bff-for-better-hac.onrender.com"
  : "https://bff-for-better-hac.onrender.com";

class ChatService {
  constructor() {
    // チャットAPI専用のaxiosインスタンスを作成（認証インターセプターを回避）
    this.chatAxios = axios.create({
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * チャットスレッド一覧を取得
   */
  async listThreads() {
    try {
      console.log("Listing threads from:", `${API_BASE_URL}/chat_api.php`);

      const response = await this.chatAxios.post(
        `${API_BASE_URL}/chat_api.php`,
        { action: "list" },
      );

      console.log("List threads response:", response.data);

      return {
        success: true,
        threads: response.data.threads || [],
        lastThreadId: response.data.last_thread_id,
      };
    } catch (error) {
      console.error("List threads error:", error);
      console.error("Error response:", error.response?.data);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "スレッド一覧の取得に失敗しました",
      };
    }
  }

  /**
   * メッセージを送信
   * @param {string} message - 送信するメッセージ
   * @param {string|null} threadId - スレッドID（新規の場合はnull）
   */
  async sendMessage(message, threadId = null) {
    try {
      const response = await this.chatAxios.post(
        `${API_BASE_URL}/chat_api.php`,
        {
          action: "send",
          message,
          thread_id: threadId,
        },
      );

      return {
        success: true,
        reply: response.data.reply,
        threadId: response.data.thread_id,
        ctxCount: response.data.ctx_count,
        messages: response.data.messages || [],
      };
    } catch (error) {
      console.error("Send message error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "メッセージの送信に失敗しました",
      };
    }
  }

  /**
   * スレッドの会話履歴を取得
   * @param {string} threadId - スレッドID
   */
  async getThread(threadId) {
    try {
      const response = await this.chatAxios.post(
        `${API_BASE_URL}/chat_api.php`,
        {
          action: "get",
          thread_id: threadId,
        },
      );

      return {
        success: true,
        threadId: response.data.thread_id,
        messages: response.data.messages || [],
      };
    } catch (error) {
      console.error("Get thread error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "スレッドの取得に失敗しました",
      };
    }
  }

  /**
   * スレッドを非表示にする
   * @param {string} threadId - スレッドID
   */
  async hideThread(threadId) {
    try {
      const response = await this.chatAxios.post(
        `${API_BASE_URL}/chat_api.php`,
        {
          action: "hide",
          thread_id: threadId,
        },
      );

      return {
        success: response.data.ok === true,
      };
    } catch (error) {
      console.error("Hide thread error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "スレッドの非表示に失敗しました",
      };
    }
  }
}

export default new ChatService();
