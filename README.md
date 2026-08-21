# CommentMind AI

AI-powered comment moderation for modern websites.

CommentMind AI helps stores, blogs, and content platforms:

- Automatically reply to customer comments
- Approve legitimate comments
- Filter spam and low-quality submissions
- Answer from your own site knowledge base
- Surface sales opportunities, customer risks, and repeated knowledge gaps

## Architecture

```text
commentmind-ai/
├── backend/              # FastAPI + PostgreSQL + Redis + Celery
├── wordpress-plugin/     # WordPress plugin
├── dashboard/            # Admin dashboard (Next.js)
├── widget/               # Widget demo assets
└── docker-compose.yml    # Local orchestration
```

## Quick Start

### 1. Configure Environment

```bash
git clone https://github.com/yourname/commentmind-ai.git
cd commentmind-ai

cp backend/.env.example backend/.env
cp dashboard/.env.local.example dashboard/.env.local
```

Edit `backend/.env` and add:

```env
OPENAI_API_KEY=sk-...
SECRET_KEY=change-this
PUBLIC_BASE_URL=http://localhost:8000
USDT_TRC20_ADDRESS=
TRX_ADDRESS=
PAYMENT_ADMIN_EMAILS=
ADMIN_EMAILS=owner@example.com
```

Edit `dashboard/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Run Locally

```bash
docker compose up --build
```

Run migrations:

```bash
docker compose exec backend alembic upgrade head
```

Services:

| Service | URL |
| --- | --- |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Dashboard | http://localhost:3000 |

For background comment processing:

```bash
docker compose exec backend celery -A app.worker.celery_app worker --loglevel=info --concurrency=2 -Q default
```

## WordPress Plugin

1. Download `dashboard/public/downloads/commentmind-ai-wordpress-plugin.zip` from the website or build it from `wordpress-plugin/commentmind-ai`
2. Upload it in WordPress Admin → Plugins → Add New → Upload
3. Activate the plugin
4. Open Settings → CommentMind AI
5. Add the site API key from the dashboard
6. Set API URL to your backend URL, for example `https://api.commentmind.website`

The plugin can send WooCommerce product context such as SKU, price, stock status, and product title when comments are posted on product pages.
Supported AI reply languages are English, Persian, Arabic, Turkish, and German.

## API Examples

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "strong-password",
  "full_name": "Admin User"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "strong-password"
}
```

### Create Site

```http
POST /api/v1/sites
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My Store",
  "domain": "example.com",
  "tone": "friendly",
  "language": "en"
}
```

The response includes a one-time site API key. Store it securely.

### Submit Comment

```http
POST /api/v1/widget/comment
Authorization: Bearer <site_api_key>
Content-Type: application/json

{
  "external_id": "123",
  "author_name": "Alex",
  "author_email": "alex@example.com",
  "content": "Does this product include a warranty?",
  "post_title": "Product X",
  "post_url": "https://example.com/product/x"
}
```

Example response:

```json
{
  "comment_id": "...",
  "status": "replied",
  "ai_reply": "Yes, this product includes an 18-month manufacturer warranty.",
  "spam_score": 0.02,
  "intent": "question",
  "sentiment": "neutral"
}
```

## Knowledge Base

The AI uses site knowledge when writing replies.

### Add Text

```http
POST /api/v1/sites/{site_id}/knowledge
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Return policy: customers can return items within 7 days.",
  "source_name": "policies"
}
```

### Upload Text File

```http
POST /api/v1/sites/{site_id}/knowledge/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file=@knowledge.txt
```

## Plans and Trials

Paid plans support a 7-day free trial. Crypto checkout supports USDT/TRC20 and TRX. Payment verification is currently manual through the admin confirmation endpoint.

## Product Features

- AI moderation and reply generation
- Review queue with approve, reply, spam, and pending actions
- ROI meter for time and support-cost savings
- Lost-sales detector for buying-intent comments
- Smart reply confidence summary
- Knowledge gap alerts
- Suggested FAQ builder
- Comment funnel analytics
- Risk radar for negative comments and repeated issues
- Weekly AI report summary
- Universal JavaScript widget
- WordPress and WooCommerce integration

## License

MIT
