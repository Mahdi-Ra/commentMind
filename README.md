# 🧠 CommentMind AI

> هوش مصنوعی برای مدیریت خودکار کامنت‌های سایت

CommentMind AI به سایت‌های فروشگاهی، بلاگ‌ها و هر پلتفرمی کمک می‌کنه که:
- 🤖 **به‌طور خودکار** به کامنت‌های کاربران جواب بده
- ✅ کامنت‌های معتبر رو تأیید کنه
- 🚫 اسپم‌ها رو فیلتر کنه
- 📚 بر اساس دانش سایت شما جواب بده

---

## 🏗️ معماری

```
commentmind-ai/
├── backend/              # FastAPI + PostgreSQL + Redis
├── wordpress-plugin/     # افزونه وردپرس (PHP)
├── dashboard/            # داشبورد مدیریتی (Next.js)
└── docker-compose.yml    # راه‌اندازی کامل با یه دستور
```

## 🚀 راه‌اندازی سریع

### ۱. Clone و Config

```bash
git clone https://github.com/yourname/commentmind-ai.git
cd commentmind-ai

# Backend
cp backend/.env.example backend/.env
# ویرایش backend/.env و اضافه کردن OPENAI_API_KEY

# Dashboard
cp dashboard/.env.local.example dashboard/.env.local
```

### ۲. اجرا

```bash
docker-compose up -d
```

سرویس‌ها:
| سرویس | آدرس |
|-------|------|
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Dashboard | http://localhost:3000 |

---

## 🔌 نصب افزونه وردپرس

1. پوشه `wordpress-plugin/commentmind-ai` را ZIP کنید
2. در WordPress Admin → Plugins → Add New → Upload
3. فعال‌سازی افزونه
4. Settings → CommentMind AI
5. API Key از داشبورد وارد کنید

---

## 📡 API

### احراز هویت

```bash
# ثبت‌نام
POST /api/v1/auth/register
{"email": "admin@site.ir", "password": "pass", "full_name": "نام"}

# ورود
POST /api/v1/auth/login
{"email": "admin@site.ir", "password": "pass"}
```

### ثبت سایت

```bash
POST /api/v1/sites
Authorization: Bearer <jwt_token>
{"name": "فروشگاه من", "domain": "myshop.ir", "tone": "friendly", "language": "fa"}

# Response: {"id": "...", "api_key": "cm_..."}  ← این کلید رو نگه دار!
```

### ارسال کامنت (از پلاگین/ویجت)

```bash
POST /api/v1/widget/comment
Authorization: Bearer <site_api_key>

{
  "external_id": "123",
  "author_name": "علی",
  "author_email": "ali@example.com",
  "content": "سلام، آیا این محصول ضمانت دارد؟",
  "post_title": "محصول X",
  "post_url": "https://myshop.ir/product/x"
}

# Response:
{
  "comment_id": "...",
  "status": "replied",     # approved | spam | replied | uncertain
  "ai_reply": "سلام! بله، این محصول ۱۸ ماه ضمانت کارخانه دارد.",
  "spam_score": 0.02,
  "intent": "question",
  "sentiment": "neutral"
}
```

---

## ⚙️ تنظیمات

### لحن جواب‌ها
- `friendly` — دوستانه و صمیمی
- `formal` — رسمی و محترمانه
- `professional` — تخصصی و مختصر

### آستانه‌ها
- `spam_threshold` (پیش‌فرض: ۰.۸۵) — کامنت‌هایی با spam_score بالاتر، اسپم می‌شن
- `approve_threshold` (پیش‌فرض: ۰.۹۰) — کامنت‌هایی با spam_score پایین‌تر، تأیید می‌شن

---

## 📚 پایگاه دانش

AI از محتوای پایگاه دانش برای جواب‌دادن استفاده می‌کنه:

```bash
# افزودن متن
POST /api/v1/sites/{site_id}/knowledge
{"content": "سیاست بازگشت کالا: تا ۷ روز امکان مرجوع کردن دارید.", "source_name": "policies"}

# آپلود فایل .txt
POST /api/v1/sites/{site_id}/knowledge/upload
form-data: file=@knowledge.txt
```

---

## 🛣️ Roadmap

- [x] Backend API (FastAPI)
- [x] WordPress Plugin
- [x] Dashboard (Next.js)
- [ ] JS Widget (Universal)
- [ ] PDF/DOCX support in Knowledge Base
- [ ] Vector search (pgvector)
- [ ] Webhook notifications
- [ ] Multi-language support
- [ ] Usage analytics & billing

---

## 📄 License

MIT
