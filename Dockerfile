# Node.js asosiy image
FROM node:20-alpine

# Netcat va boshqa kerakli toollar o'rnatish
RUN apk add --no-cache netcat-openbsd

# Ish katalogini o'rnatish
WORKDIR /app

# Package files ni nusxalash
COPY package*.json ./

# Dependencies o'rnatish (dev dependencies ham kerak build va db:push uchun)
RUN npm ci

# Barcha loyiha fayllarini nusxalash
COPY . .

# Build qilish
RUN npm run build

# Uploads katalogini yaratish
RUN mkdir -p uploads

# Entrypoint script ni nusxalash va bajarish huquqini berish
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Port ochish
EXPOSE 5000

# Entrypoint va start command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]