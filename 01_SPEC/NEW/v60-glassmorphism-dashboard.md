# SPEC v60 - Glassmorphism Dashboard

## 1. Mục tiêu
Phát triển dashboard quản lý dự án với thiết kế Glassmorphism - phiên bản nâng cấp từ v30.

## 2. Phạm vi

### 2.1 Trong phạm vi
- Dashboard chính với glassmorphism UI
- Thống kê: Dự án, Công việc, Thành viên
- Danh sách dự án với CRUD
- Biểu đồ donut và area chart
- Team panel với trạng thái online/offline
- Quick actions panel
- Responsive design
- LocalStorage persistence

### 2.2 Ngoài phạm vi
- Backend/API server
- Authentication
- Multi-user real-time collaboration

## 3. Thiết kế UI/UX

### 3.1 Color Palette
- Primary gradient: `#667eea` → `#764ba2`
- Accent blue: `#00f2fe` → `#4facfe`
- Success green: `#11998e` → `#38ef7d`
- Warning orange: `#f093fb` → `#f5576c`
- Background: Gradient 135deg purple-pink
- Glass: `rgba(255,255,255,0.1)` + blur 20px

### 3.2 Typography
- Font: Outfit (Google Fonts)
- Weights: 400, 500, 600, 700

### 3.3 Layout
```
[Topbar: Logo | Title | Search | Actions]
[Sidebar] | [Stats/Team Panel] | [Main Content: Table + Charts]
```

## 4. Chức năng

### 4.1 Dashboard Stats
- Tổng số dự án
- Dự án hoàn thành
- Tổng công việc
- Số thành viên

### 4.2 CRUD Dự án
- Tạo dự án mới (modal form)
- Sửa dự án
- Xóa dự án (confirm)
- Lưu vào LocalStorage

### 4.3 Data Model
```javascript
Project {
  id: string,
  name: string,
  icon: string,
  startDate: string,
  endDate: string,
  totalTasks: number,
  completedTasks: number,
  progress: number,
  status: 'completed' | 'in-progress' | 'delivered' | 'paused'
}
```

### 4.4 Biểu đồ
- Donut chart: Phân bố trạng thái dự án
- Area chart: Tiến độ theo tháng (6 tháng gần nhất)

## 5. Acceptance Criteria
- [ ] Hiển thị dashboard với glassmorphism effect
- [ ] Stats cards với icon và số liệu
- [ ] Table danh sách dự án với 5 sample data
- [ ] CRUD operations hoạt động
- [ ] Data persisted trong LocalStorage
- [ ] Charts hiển thị đúng
- [ ] Responsive trên mobile

## 6. Test Cases
1. Tạo dự án mới → hiển thị trong table
2. Sửa dự án → cập nhật table
3. Xóa dự án → không còn trong table
4. Refresh page → data vẫn còn (LocalStorage)
5. Empty state → hiển thị message khi không có dự án
