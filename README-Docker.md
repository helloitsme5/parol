# SecureCheck - Docker Setup

## Docker bilan ishlatish

### 1. Loyihani klonlash yoki yuklab olish

```bash
# Git orqali
git clone <repository-url>
cd securecheck

# yoki ZIP faylni ochish
```

### 2. Environment variables sozlash

```bash
# .env faylni yaratish
cp .env.example .env

# .env faylini tahrirlash (ixtiyoriy)
# DATABASE_URL, SESSION_SECRET va boshqa parametrlarni o'zgartirish mumkin
```

### 3. Docker konteynerlarini ishga tushirish

```bash
# Barcha xizmatlarni ishga tushirish
docker-compose up -d

# Yoki build bilan
docker-compose up --build -d
```

### 4. Loyihaga kirish

Brauzeringizda quyidagi manzilga o'ting:
```
http://localhost:5000
```

### 5. Admin qilish

Birinchi user avtomatik ravishda "user" rolida yaratiladi. Admin qilish uchun:

```bash
# PostgreSQL konteyneriga kirish
docker exec -it securecheck_db psql -U postgres -d securecheck

# Userni admin qilish
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Kerakli buyruqlar

```bash
# Konteynerlarni to'xtatish
docker-compose down

# Ma'lumotlarni ham o'chirish
docker-compose down -v

# Loglarni ko'rish
docker-compose logs -f

# Faqat bitta xizmat logini ko'rish
docker-compose logs -f app
docker-compose logs -f postgres

# Konteynerlarni qayta qurish
docker-compose build --no-cache
```

### Fayl yuklash

Admin panelda:
- `.txt` formatdagi fayllarni yuklash mumkin
- Maksimal hajm: 10GB
- Format: `url,username,password` yoki `url;username;password`

### Ma'lumotlar bazasi

PostgreSQL 15 versiyasi ishlatiladi:
- Host: postgres
- Port: 5432
- Database: securecheck
- User: postgres
- Password: password123

### Xatoliklarni hal qilish

**Agar ilova ishlamasa:**
```bash
# Konteynerlar holatini tekshirish
docker-compose ps

# Ma'lumotlar bazasi tayyor emasligini tekshirish
docker-compose logs postgres

# Ilovani qayta ishga tushirish
docker-compose restart app
```

**Ma'lumotlar bazasi muammolari:**
```bash
# Ma'lumotlar bazasini tozalash va qayta yaratish
docker-compose down -v
docker-compose up -d postgres
# PostgreSQL tayyor bo'lgach
docker-compose up -d app
```