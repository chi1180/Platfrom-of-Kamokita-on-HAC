/**
 * IndexedDB Service for Image Storage
 * 将来の「ユーセージ」タブでの統計表示にも対応
 */

const DB_NAME = "HACStorage";
const DB_VERSION = 1;
const IMAGE_STORE = "images";

class ImageStorageService {
  constructor() {
    this.db = null;
  }

  /**
   * IndexedDBの初期化
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB open error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 画像ストアの作成
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          const imageStore = db.createObjectStore(IMAGE_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });

          // インデックスの作成（日時でソート可能に）
          imageStore.createIndex("createdAt", "createdAt", { unique: false });
          imageStore.createIndex("prompt", "prompt", { unique: false });
        }

        // 将来のために他のストアも追加可能
        // 例: chatHistory, usage など
      };
    });
  }

  /**
   * DBが初期化されているか確認、未初期化なら初期化
   */
  async ensureDB() {
    if (!this.db) {
      await this.initDB();
    }
    return this.db;
  }

  /**
   * 画像を保存
   * @param {string} prompt - 生成プロンプト
   * @param {string} imageData - Base64エンコードされた画像データ
   * @returns {Promise<number>} 保存された画像のID
   */
  async saveImage(prompt, imageData) {
    try {
      await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([IMAGE_STORE], "readwrite");
        const store = transaction.objectStore(IMAGE_STORE);

        const imageRecord = {
          prompt: prompt,
          imageData: imageData,
          createdAt: new Date().toISOString(),
        };

        const request = store.add(imageRecord);

        request.onsuccess = () => {
          console.log("Image saved successfully, ID:", request.result);
          resolve(request.result);
        };

        request.onerror = () => {
          console.error("Error saving image:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("saveImage error:", error);
      throw error;
    }
  }

  /**
   * 全画像を取得（新しい順）
   * @returns {Promise<Array>} 画像の配列
   */
  async getAllImages() {
    try {
      await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([IMAGE_STORE], "readonly");
        const store = transaction.objectStore(IMAGE_STORE);
        const index = store.index("createdAt");

        // 新しい順（降順）で取得
        const request = index.openCursor(null, "prev");
        const images = [];

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            images.push({
              id: cursor.value.id,
              prompt: cursor.value.prompt,
              imageData: cursor.value.imageData,
              createdAt: cursor.value.createdAt,
            });
            cursor.continue();
          } else {
            resolve(images);
          }
        };

        request.onerror = () => {
          console.error("Error getting all images:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("getAllImages error:", error);
      throw error;
    }
  }

  /**
   * IDで画像を取得
   * @param {number} id - 画像ID
   * @returns {Promise<Object>} 画像オブジェクト
   */
  async getImageById(id) {
    try {
      await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([IMAGE_STORE], "readonly");
        const store = transaction.objectStore(IMAGE_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error("Error getting image by ID:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("getImageById error:", error);
      throw error;
    }
  }

  /**
   * 画像を削除
   * @param {number} id - 画像ID
   * @returns {Promise<void>}
   */
  async deleteImage(id) {
    try {
      await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([IMAGE_STORE], "readwrite");
        const store = transaction.objectStore(IMAGE_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
          console.log("Image deleted successfully, ID:", id);
          resolve();
        };

        request.onerror = () => {
          console.error("Error deleting image:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("deleteImage error:", error);
      throw error;
    }
  }

  /**
   * 全画像を削除
   * @returns {Promise<void>}
   */
  async clearAllImages() {
    try {
      await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([IMAGE_STORE], "readwrite");
        const store = transaction.objectStore(IMAGE_STORE);
        const request = store.clear();

        request.onsuccess = () => {
          console.log("All images cleared successfully");
          resolve();
        };

        request.onerror = () => {
          console.error("Error clearing images:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("clearAllImages error:", error);
      throw error;
    }
  }

  /**
   * 画像の総数を取得（ユーセージタブ用）
   * @returns {Promise<number>} 画像数
   */
  async getImageCount() {
    try {
      await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([IMAGE_STORE], "readonly");
        const store = transaction.objectStore(IMAGE_STORE);
        const request = store.count();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error("Error getting image count:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("getImageCount error:", error);
      throw error;
    }
  }

  /**
   * 最新の画像を取得（ユーセージタブ用）
   * @returns {Promise<Object|null>} 最新画像またはnull
   */
  async getLatestImage() {
    try {
      await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([IMAGE_STORE], "readonly");
        const store = transaction.objectStore(IMAGE_STORE);
        const index = store.index("createdAt");

        // 最新の1件を取得
        const request = index.openCursor(null, "prev");

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            resolve({
              id: cursor.value.id,
              prompt: cursor.value.prompt,
              imageData: cursor.value.imageData,
              createdAt: cursor.value.createdAt,
            });
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error("Error getting latest image:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("getLatestImage error:", error);
      throw error;
    }
  }

  /**
   * ストレージ使用量を推定（ユーセージタブ用）
   * @returns {Promise<Object>} { count, estimatedSize }
   */
  async getStorageStats() {
    try {
      const images = await this.getAllImages();
      const count = images.length;

      // Base64データのサイズを推定（バイト）
      let estimatedSize = 0;
      images.forEach((img) => {
        if (img.imageData) {
          // Base64文字列の長さから推定サイズを計算
          // Base64は4文字で3バイトを表現するため、(length * 3) / 4
          const base64Length = img.imageData.length;
          estimatedSize += (base64Length * 3) / 4;
        }
        // プロンプトのサイズも加算（文字列バイト数）
        if (img.prompt) {
          estimatedSize += new Blob([img.prompt]).size;
        }
      });

      return {
        count: count,
        estimatedSizeBytes: Math.round(estimatedSize),
        estimatedSizeMB: (estimatedSize / (1024 * 1024)).toFixed(2),
      };
    } catch (error) {
      console.error("getStorageStats error:", error);
      throw error;
    }
  }

  /**
   * プロンプトで検索（将来の拡張用）
   * @param {string} searchTerm - 検索キーワード
   * @returns {Promise<Array>} マッチした画像の配列
   */
  async searchByPrompt(searchTerm) {
    try {
      const allImages = await this.getAllImages();
      const searchLower = searchTerm.toLowerCase();

      return allImages.filter((img) =>
        img.prompt.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("searchByPrompt error:", error);
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
const imageStorageService = new ImageStorageService();
export default imageStorageService;
