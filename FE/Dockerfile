# base image
FROM node:18

# tạo thư mục app
WORKDIR /app

# copy package.json
COPY package*.json ./

# cài dependencies
RUN npm install

# copy source code
COPY . .

# expose port (nếu app chạy ở 3000)
EXPOSE 3000

# chạy app
CMD ["npm", "start"]
