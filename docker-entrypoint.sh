#!/bin/sh

# PostgreSQL kutilganicha ishga tushishini kutamiz
echo "PostgreSQL kutilmoqda..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL tayyor!"

# Ma'lumotlar bazasi sxemasini yaratamiz
echo "Ma'lumotlar bazasi sxemasini yaratmoqda..."
npm run db:push

# Ilovani ishga tushiramiz
echo "Ilova ishga tushirilmoqda..."
exec "$@"