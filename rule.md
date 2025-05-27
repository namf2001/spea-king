Các Rule và Best Practices từ dự án Next.js App Router
Dựa trên phân tích dự án Next.js App Router Playground này, tôi có thể đưa ra các nguyên tắc và best practices quan trọng:

1. Server vs Client Components
   Ưu tiên Server Components mặc định để tối ưu hiệu suất và SEO
   Chỉ sử dụng Client Components khi cần:
   React hooks (useState, useEffect, v.v.)
   Event handlers (onClick, onChange)
   Browser API
   Truy cập vào Context API phía client
2. Cấu trúc thư mục và tệp
   Tổ chức theo chức năng: Nhóm các thành phần liên quan vào cùng thư mục
   Route Groups ((group)) để tổ chức mã nguồn mà không ảnh hưởng URL
   Các tệp đặc biệt tuân thủ quy ước đặt tên:
   layout.tsx: Giao diện được chia sẻ giữa các trang
   page.tsx: UI chính của route
   loading.tsx: UI hiển thị khi đang tải
   error.tsx: UI xử lý lỗi
   not-found.tsx: UI hiển thị khi không tìm thấy trang
3. Data Fetching và Caching
   Fetch dữ liệu trong Server Components thay vì sử dụng API routes khi có thể
   Sử dụng cơ chế caching: Request với cùng URL và tham số sẽ được cache tự động
   Áp dụng revalidation bằng revalidatePath hoặc revalidate khi phù hợp

4. Routing và Navigation
   Sử dụng Next.js Link component thay vì thẻ <a> để tránh full page reload
   Parallel Routes (@folder) cho nội dung song song độc lập
   Intercepting Routes để hiển thị modal hoặc overlays mà không làm mất context
5. Patterns thiết kế UI
   Shared Layout: Tái sử dụng UI giữa các trang
   Nested Layouts: Kế thừa và mở rộng từ layout cha
   Loading và Error States: UI riêng biệt cho các trạng thái khác nhau
   UI thích ứng: Sử dụng Tailwind CSS để styling linh hoạt theo kích thước màn hình

6. Typing và Validation
   TypeScript cho tất cả mã nguồn để đảm bảo type safety
   Zod hoặc các schema validators cho dữ liệu đầu vào
   Strong typing cho props, params và data
7. Accessibility
   Semantic HTML: Sử dụng các thẻ đúng mục đích
   ARIA attributes: Thêm khi cần thiết
   Keyboard navigation: Đảm bảo tính khả dụng cho người dùng bàn phím
