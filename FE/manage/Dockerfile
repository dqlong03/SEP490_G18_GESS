# 🟦 BASE STAGE – Build Next.js
FROM node:18-alpine AS build

WORKDIR /app

# Copy source code
COPY . .

# Cài dependencies
RUN npm install

# Build ứng dụng
RUN npm run build

# 🟩 RUNTIME STAGE – Serve bằng next start
FROM node:18-alpine

WORKDIR /app

# Copy từ stage build
COPY --from=build /app ./

EXPOSE 3000

# Chạy ứng dụng

CMD ["npm", "start"]
