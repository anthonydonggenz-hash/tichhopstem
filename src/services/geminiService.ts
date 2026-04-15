import { GoogleGenAI, Type } from "@google/genai";
import { STEMLesson, STEMParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSTEMLesson(params: STEMParams): Promise<STEMLesson> {
  const prompt = `
    Bạn là một chuyên gia giáo dục STEM hàng đầu. Hãy thiết kế một bài học STEM chi tiết dựa trên các thông tin sau:
    - Cấp học: ${params.level}
    - Khối lớp: ${params.grade}
    - Môn học chính: ${params.subject}
    - Bộ sách: ${params.book}
    - Tên bài học/Chủ đề: ${params.topic}
    - Thời lượng: ${params.duration}
    - Ghi chú thêm: ${params.notes}

    Yêu cầu nội dung trả về phải bao gồm 4 phần chính, sử dụng định dạng Markdown phong phú (Rich Markdown) với các icon/emoji để tăng tính sinh động:
    
    1. **Kế hoạch dạy học (Plan)**: 
       - Trình bày theo mô hình 5E (Gắn kết, Khám phá, Giải thích, Áp dụng, Đánh giá).
       - Mỗi bước PHẢI trình bày dưới dạng BẢNG Markdown với các cột: **Bước & Thời gian**, **Hoạt động Giáo viên**, **Hoạt động Học sinh**.
       - Sử dụng các icon/emoji phù hợp cho từng bước (ví dụ: 🔍 cho Khám phá, 💡 cho Giải thích).
       - Văn phong sư phạm chuẩn, rõ ràng, chuyên nghiệp, có màu sắc (sử dụng Bold/Italic/Blockquote).

    2. **Phiếu học liệu học sinh (Student)**: 
       - Thiết kế như một bản hướng dẫn hấp dẫn. 
       - Có danh sách vật liệu (Checklist), các bước thực hiện đánh số rõ ràng, và các mẹo nhỏ (Tips).

    3. **Rubric đánh giá (Rubric)**: 
       - Bảng đánh giá chi tiết các tiêu chí. Sử dụng bảng Markdown với tiêu đề cột rõ ràng.

    4. **Prompt Media & Slide (Media)**: 
       - **Prompt Ảnh**: PHẢI sử dụng chính xác mẫu sau (viết bằng tiếng Việt):
         "Tạo hình ảnh quy trình các bước làm mô hình STEM với tiêu đề "[TÊN MÔ HÌNH]" hiển thị bằng chữ in hoa rõ ràng ở phía trên. Hình ảnh thể hiện quá trình "[MÔ TẢ NGẮN HOẠT ĐỘNG]" theo từng bước đánh số thứ tự từ 1 đến N, mỗi bước được đóng khung riêng biệt theo bố cục sách giáo khoa STEM hiện đại.
         Mỗi bước bao gồm: Minh họa trực quan hành động cụ thể, Mũi tên chỉ hướng thao tác, Nhãn chú thích ngắn gọn, Thể hiện rõ sự thay đổi qua từng bước.
         Dụng cụ sử dụng: [LIỆT KÊ DỤNG CỤ]
         Vật liệu sử dụng: [LIỆT KÊ VẬT LIỆU]
         Chất liệu thể hiện rõ: [MÔ TẢ TEXTURE]
         Bối cảnh: [BỐI CẢNH]
         Ánh sáng tự nhiên, bóng đổ nhẹ, chiều sâu trường ảnh, hậu cảnh mờ (bokeh)
         Lấy nét vào: [CHI TIẾT QUAN TRỌNG NHẤT]
         Phong cách: realistic educational illustration, siêu chi tiết, 4K, màu sắc tươi sáng, phong cách giáo dục hiện đại, bố cục rõ ràng, infographic khoa học, tỉ lệ 16:9, chất lượng cao, dễ hiểu cho học sinh."
       
       - **Prompt Video**: Đóng vai chuyên gia đạo diễn video STEM cho Veo 3. Tạo [8] prompt video độc lập (Clip 1 đến Clip 8).
         - Mỗi prompt bắt đầu bằng: "3D animated, Pixar-inspired educational film, animation style, 16:9."
         - Các câu lệnh mô tả bằng tiếng Anh, lời thoại (Vietnamese dialogue) bằng tiếng Việt.
         - Mỗi prompt phải có đủ: Character description, Setting, Main action, Camera angle, Lighting, Emotion, Audio ambience, Educational focus, Vietnamese dialogue.
         - Nhân vật và bối cảnh phải đồng nhất xuyên suốt 8 clip.
       
       - **Cấu trúc Slide**: Trình bày danh sách các slide bài giảng (Canva/PowerPoint).

    Lưu ý: Ngôn ngữ sử dụng là tiếng Việt, chuyên nghiệp, sư phạm nhưng vẫn hiện đại và truyền cảm hứng. Hãy sử dụng nhiều Emoji phù hợp với từng phần.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan: { type: Type.STRING, description: "Kế hoạch dạy học chi tiết" },
          student: { type: Type.STRING, description: "Phiếu giao nhiệm vụ cho học sinh" },
          rubric: { type: Type.STRING, description: "Bảng tiêu chí đánh giá" },
          media: { type: Type.STRING, description: "Các prompt tạo ảnh/video và cấu trúc slide" }
        },
        required: ["plan", "student", "rubric", "media"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Không nhận được phản hồi từ AI");
  
  return JSON.parse(text) as STEMLesson;
}
