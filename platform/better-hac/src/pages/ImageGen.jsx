import { useState, useEffect } from "react";
import imageService from "../services/image";
import imageStorageService from "../services/imageStorage";
import { useToast } from "../hooks/useToast";
import "./ImageGen.css";

function ImageGen() {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const { showToast } = useToast();

  // 初期化：IndexedDBから既存の画像を読み込む
  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoadingGallery(true);
      const images = await imageStorageService.getAllImages();
      setGeneratedImages(images);
    } catch (error) {
      console.error("Failed to load gallery:", error);
      showToast("ギャラリーの読み込みに失敗しました", "error");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);

    const result = await imageService.generateImage(prompt.trim());

    if (result.success) {
      try {
        // IndexedDBに保存
        const id = await imageStorageService.saveImage(
          prompt.trim(),
          result.url,
        );

        // ギャラリーを再読み込み（新しい画像を含む）
        await loadGallery();

        setPrompt("");
        showToast("画像を生成しました！", "success");
      } catch (error) {
        console.error("Failed to save image:", error);
        showToast(
          "画像の保存に失敗しましたが、生成には成功しました",
          "warning",
        );
      }
    } else {
      showToast(result.error, "error");
    }

    setLoading(false);
  };

  const handleDownload = (imageData, prompt, id) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `generated_${id}_${prompt.substring(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!confirm("この画像を削除しますか？")) return;

    try {
      await imageStorageService.deleteImage(id);
      await loadGallery();

      // モーダルが開いている場合は閉じる
      if (selectedImage && selectedImage.id === id) {
        setSelectedImage(null);
      }
      showToast("画像を削除しました", "success");
    } catch (error) {
      console.error("Failed to delete image:", error);
      showToast("画像の削除に失敗しました", "error");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("全ての画像を削除しますか？この操作は取り消せません。"))
      return;

    try {
      await imageStorageService.clearAllImages();
      await loadGallery();
      setSelectedImage(null);
      showToast("全ての画像を削除しました", "success");
    } catch (error) {
      console.error("Failed to clear all images:", error);
      showToast("画像の一括削除に失敗しました", "error");
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="imagegen-container">
      <div className="imagegen-header">
        <h1>🎨 画像生成</h1>
        <p>AIで画像を生成しましょう</p>
      </div>

      <form onSubmit={handleGenerate} className="imagegen-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例: a elephant climbing mt.Fuji"
          disabled={loading}
          className="imagegen-input"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="imagegen-button"
        >
          {loading ? "生成中..." : "生成"}
        </button>
      </form>

      {loading && (
        <div className="imagegen-loading">
          <div className="loading-spinner"></div>
          <p>画像を生成しています...</p>
        </div>
      )}

      <div className="imagegen-gallery-header">
        <h2>ギャラリー ({generatedImages.length})</h2>
        {generatedImages.length > 0 && (
          <button onClick={handleClearAll} className="clear-all-button">
            全て削除
          </button>
        )}
      </div>

      {loadingGallery ? (
        <div className="imagegen-loading">
          <div className="loading-spinner"></div>
          <p>ギャラリーを読み込んでいます...</p>
        </div>
      ) : (
        <div className="imagegen-gallery">
          {generatedImages.length === 0 && !loading ? (
            <div className="imagegen-empty">
              <p>プロンプトを入力して画像を生成してください</p>
            </div>
          ) : (
            generatedImages.map((img) => (
              <div key={img.id} className="imagegen-card">
                <div
                  className="imagegen-image-wrapper"
                  onClick={() => openModal(img)}
                >
                  <img
                    src={img.imageData}
                    alt={img.prompt}
                    className="imagegen-image"
                  />
                  <div className="imagegen-overlay">
                    <span>クリックで拡大</span>
                  </div>
                </div>
                <div className="imagegen-card-footer">
                  <div className="imagegen-card-info">
                    <p className="imagegen-prompt" title={img.prompt}>
                      {img.prompt}
                    </p>
                    <p className="imagegen-time">{formatDate(img.createdAt)}</p>
                  </div>
                  <div className="imagegen-card-actions">
                    <button
                      onClick={() =>
                        handleDownload(img.imageData, img.prompt, img.id)
                      }
                      className="imagegen-action-button download"
                      title="ダウンロード"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="imagegen-action-button delete"
                      title="削除"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* モーダル */}
      {selectedImage && (
        <div className="imagegen-modal" onClick={closeModal}>
          <div
            className="imagegen-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="modal-image-wrapper">
              <img
                src={selectedImage.imageData}
                alt={selectedImage.prompt}
                className="modal-image"
              />
            </div>
            <div className="modal-info">
              <h3>プロンプト</h3>
              <p className="modal-prompt">{selectedImage.prompt}</p>
              <p className="modal-time">
                {formatDate(selectedImage.createdAt)}
              </p>
              <div className="modal-actions">
                <button
                  onClick={() =>
                    handleDownload(
                      selectedImage.imageData,
                      selectedImage.prompt,
                      selectedImage.id,
                    )
                  }
                  className="modal-button download"
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  ダウンロード
                </button>
                <button
                  onClick={() => handleDelete(selectedImage.id)}
                  className="modal-button delete"
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGen;
