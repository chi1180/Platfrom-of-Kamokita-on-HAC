import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import chatService from "../services/chat";
import { useToast } from "../hooks/useToast";
import "./Chat.css";
import "highlight.js/styles/github-dark.css";

function Chat({ onTabChange, onLogout, userEmail }) {
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // localStorageからサイドバーの状態を復元
    const savedState = localStorage.getItem("chatSidebarCollapsed");
    return savedState === "true";
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // サイドバーの状態が変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem("chatSidebarCollapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadThreads = async () => {
    setLoading(true);
    setError(null);
    const result = await chatService.listThreads();
    if (result.success) {
      setThreads(result.threads);
      if (result.lastThreadId) {
        loadThread(result.lastThreadId);
      }
    } else {
      setError(result.error);
      console.error("Failed to load threads:", result.error);
    }
    setLoading(false);
  };

  const loadThread = async (threadId) => {
    const result = await chatService.getThread(threadId);
    if (result.success) {
      setCurrentThreadId(threadId);
      setMessages(result.messages);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "24px";
      const scrollHeight = inputRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, 150);
      inputRef.current.style.height = newHeight + "px";

      // Show scrollbar if content exceeds max height
      if (scrollHeight > 150) {
        inputRef.current.style.overflowY = "auto";
      } else {
        inputRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "24px";
      inputRef.current.style.overflowY = "hidden";
    }

    setSending(true);

    // ユーザーメッセージを即座に表示
    const tempMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
        time: new Date().toISOString(),
      },
    ];
    setMessages(tempMessages);

    const result = await chatService.sendMessage(userMessage, currentThreadId);

    if (result.success) {
      setCurrentThreadId(result.threadId);
      setMessages(result.messages);
      // スレッド一覧を更新
      loadThreads();
    } else {
      // エラーの場合は元に戻す
      setMessages(messages);
      showToast(result.error, "error");
    }

    setSending(false);
  };

  const handleNewChat = () => {
    setCurrentThreadId(null);
    setMessages([]);
  };

  const handleDeleteThread = async (threadId) => {
    if (!confirm("このチャットを非表示にしますか？")) return;

    const result = await chatService.hideThread(threadId);
    if (result.success) {
      loadThreads();
      if (currentThreadId === threadId) {
        handleNewChat();
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-content">
          <h1>
            <span className="accented-text">Better</span>
            &nbsp;HAC for Student
          </h1>
          <div className="chat-user-info">
            <span className="chat-user-email">{userEmail}</span>
            <button onClick={onLogout} className="chat-logout-button">
              ログアウト
            </button>
          </div>
        </div>

        <div className="chat-tabs-container">
          <button
            className="chat-tab"
            onClick={() => {
              onTabChange("dashboard");
              localStorage.setItem("activeTab", "dashboard");
            }}
          >
            ダッシュボード
          </button>
          <button className="chat-tab active">チャット</button>
          <button
            className="chat-tab"
            onClick={() => {
              onTabChange("image");
              localStorage.setItem("activeTab", "image");
            }}
          >
            画像生成
          </button>
        </div>
      </div>

      <div className="chat-content-wrapper">
        <div className={`chat-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <div className="sidebar-header">
            <button onClick={handleNewChat} className="new-chat-button">
              {sidebarCollapsed ? (
                <span className="new-chat-icon">＋</span>
              ) : (
                <span className="new-chat-text">＋ 新しいチャット</span>
              )}
            </button>
            <button
              className="sidebar-toggle-button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={
                sidebarCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {sidebarCollapsed ? (
                  <path d="M9 18l6-6-6-6" />
                ) : (
                  <path d="M15 18l-6-6 6-6" />
                )}
              </svg>
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <div className="error-text">{error}</div>
              <button onClick={loadThreads} className="retry-button">
                再試行
              </button>
            </div>
          )}

          <div className="threads-list">
            {loading ? (
              <div className="threads-loading">読み込み中...</div>
            ) : threads.length === 0 ? (
              <div className="threads-empty">チャットがありません</div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.thread_id}
                  className={`thread-item ${
                    currentThreadId === thread.thread_id ? "active" : ""
                  }`}
                  onClick={() => loadThread(thread.thread_id)}
                >
                  <div className="thread-title">{thread.title}</div>
                  <div className="thread-date">{thread.updated_at}</div>
                  <button
                    className="thread-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteThread(thread.thread_id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <h2>お手伝いできることはありますか？</h2>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-content">
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            return inline ? (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="message assistant">
                <div className="message-content typing">入力中...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="質問してみましょう（Shift+Enterで改行）"
                disabled={sending}
                className="chat-input"
                rows="1"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="chat-send-button"
                title="送信"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
