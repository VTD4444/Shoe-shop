// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './src/models/index.js';
import routes from './src/routes/index.js';
import errorMiddleware from './src/middlewares/error.middleware.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sẽ tạo các bảng nếu chưa có
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Đã đồng bộ Database (PostgreSQL) thành công!');
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối Database:', err);
  });


app.get('/', (req, res) => {
  res.send('Server Backend is running (ES Modules)...');
});

app.use('', routes);
app.use((req, res, next) => {
  const error = new Error('Đường dẫn không tồn tại (Not Found)');
  error.statusCode = 404;
  next(error);
});
// Hứng lỗi
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});