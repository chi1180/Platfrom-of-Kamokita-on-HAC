import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://hac.hiroshima-aiclub.org";

class ImageService {
  constructor() {
    // 画像API専用のaxiosインスタンスを作成（認証インターセプターを回避）
    this.imageAxios = axios.create({
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * プロンプトから画像を生成
   * @param {string} prompt - 画像生成プロンプト
   */
  async generateImage(prompt) {
    try {
      const response = await this.imageAxios.post(
        `${API_BASE_URL}/image_api.php`,
        { prompt },
        {
          timeout: 60000, // 画像生成は時間がかかる可能性があるので60秒
        },
      );

      return {
        success: true,
        url: response.data.url,
      };
    } catch (error) {
      console.error("Generate image error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "画像の生成に失敗しました",
      };
    }
  }
}

export default new ImageService();
