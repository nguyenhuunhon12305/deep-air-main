# Deep Air Monitoring

Website tĩnh giám sát chất lượng không khí, gồm các trang:

- `index.html`: đăng nhập hệ thống.
- `overview.html`: tổng quan hệ thống.
- `theory.html`: cơ sở lý thuyết.
- `dashboard.html`: dashboard dữ liệu Firebase.
- `option.html`: tùy chọn, hướng dẫn và tạo tài khoản.

## Chức năng bảo mật đã thêm

1. Chỉ nhập đúng tài khoản/mật khẩu mới vào được hệ thống.
2. Chặn mở thẳng các trang bên trong nếu chưa đăng nhập.
3. Mật khẩu bắt buộc:
   - Dài hơn 6 ký tự.
   - Có ít nhất 1 ký tự đặc biệt, ví dụ: `@`, `#`, `$`, `!`.
4. Trang `option.html` cho quản trị viên tạo tài khoản mới.
5. Trang đăng nhập có chức năng quên mật khẩu bằng mã khôi phục.
6. Có nút đăng xuất.

## Lưu ý

Cơ chế tài khoản hiện tại dùng JavaScript và `localStorage`, phù hợp demo/bảo vệ đồ án web tĩnh. Nếu triển khai thật trên Internet, nên dùng Firebase Authentication hoặc backend riêng để bảo mật tốt hơn.


## Cập nhật giao diện đăng nhập
- Trang đăng nhập bố trí logo Khoa Điện - Điện tử bên trái, logo Trường HCMUTE bên phải.
- Phần giữa hiển thị tên trường, khoa và bộ môn theo yêu cầu.
- File logo trường đã được chuẩn hóa kích thước 200x200.


Cập nhật giao diện: Header các trang bên trong đã được căn giữa, logo khoa bên trái, logo trường bên phải, thanh chọn trang nằm bên dưới tiêu đề.

- Đã căn lại nội dung trang Tổng quan và thu nhỏ ảnh sơ đồ phần cứng để giao diện cân đối hơn.

- Đã đồng bộ hiệu ứng nền động, hiệu ứng kính mờ và hover giữa các trang đăng nhập, tổng quan, lý thuyết, dashboard và tùy chọn.


## Cập nhật giao diện
- Đồng bộ kích thước logo ở trang Dashboard với các trang Tổng quan, Lý thuyết và Tùy chọn.
- Logo trường nằm bên trái, logo khoa nằm bên phải trên toàn bộ website.
