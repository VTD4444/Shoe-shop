/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Trắng & Đen chủ đạo
        primary: '#FFFFFF',    // Nền trắng
        secondary: '#F5F5F5',  // Xám rất nhạt (cho nền phụ/card)
        text: '#171717',       // Đen (cho chữ chính)
        accent: '#000000',     // Đen tuyền (cho nút bấm, điểm nhấn)
        mute: '#737373',       // Xám trung tính (cho chữ phụ)
        error: '#DC2626',      // Đỏ (chỉ dùng khi báo lỗi)
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}