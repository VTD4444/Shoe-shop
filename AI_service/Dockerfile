# 1. Dùng Python 3.9 (Bản nhẹ)
FROM python:3.10-slim

# 2. Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# 3. Copy file thư viện vào trước (để tận dụng cache của Docker)
COPY requirements.txt .

# 4. Cài đặt thư viện
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy toàn bộ code vào container
COPY . .

# 6. Mở cổng 8000
EXPOSE 8000

# 7. Lệnh chạy mặc định (Chạy Server API)
# Lưu ý: Chạy từ thư mục gốc /app, gọi module src.server
CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]