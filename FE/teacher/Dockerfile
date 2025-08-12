# --------------------------
# 📦 STAGE 1: BUILD
# --------------------------
FROM node:18-alpine AS build

# Đặt thư mục làm việc
WORKDIR /app

# Copy toàn bộ code FE/teacher vào container
COPY . .

# Cài đặt dependencies
RUN npm install

# Build ứng dụng Next.js
RUN npm run build

# --------------------------
# 🚀 STAGE 2: RUNTIME
# --------------------------
FROM node:18-alpine

# Tạo thư mục app
WORKDIR /app

# Copy output từ stage build
COPY --from=build /app .

# Mở cổng 3000 trong container
EXPOSE 3000

# Chạy ứng dụng (production)

CMD ["npm", "start"]
