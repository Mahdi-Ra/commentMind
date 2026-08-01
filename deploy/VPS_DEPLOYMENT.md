# CommentMind AI VPS Deployment

This guide deploys CommentMind AI on a single Ubuntu VPS with Docker Compose, Nginx, and Let's Encrypt.

## Domains

Point these DNS records to the VPS IP:

```text
commentmind.website      A  46.105.45.161
www.commentmind.website  A  46.105.45.161
api.commentmind.website  A  46.105.45.161
```

Keep Cloudflare records as `DNS only` until SSL is issued on the VPS. After SSL works, Cloudflare can be switched to proxied mode with SSL/TLS set to `Full (strict)`.

## Server Setup

Run on the VPS as a sudo-capable user:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git nginx certbot python3-certbot-nginx
```

Install Docker:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

Clone the repository:

```bash
git clone https://github.com/Mahdi-Ra/commentMind.git /opt/commentmind-ai
cd /opt/commentmind-ai
```

## Environment

Create the root Compose environment:

```bash
cp backend/.env.production.example backend/.env
cp dashboard/.env.production.example dashboard/.env.local
openssl rand -base64 32
```

Create `/opt/commentmind-ai/.env`:

```text
POSTGRES_PASSWORD=replace-with-a-long-random-password
```

Edit `backend/.env` and replace:

```text
SECRET_KEY
ASYNC_DATABASE_URL password
DATABASE_URL_SYNC password
OPENAI_API_KEY
USDT_TRC20_ADDRESS
TRX_ADDRESS
PAYMENT_ADMIN_EMAILS
```

The database URLs must use the same password as `POSTGRES_PASSWORD`.

## Start Services

Build and start:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

Check health:

```bash
docker compose -f docker-compose.prod.yml ps
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:3000
```

## Nginx

Install the initial HTTP proxy config:

```bash
sudo cp deploy/nginx/commentmind.http.conf /etc/nginx/sites-available/commentmind
sudo ln -s /etc/nginx/sites-available/commentmind /etc/nginx/sites-enabled/commentmind
sudo nginx -t
sudo systemctl reload nginx
```

Issue SSL certificates:

```bash
sudo certbot --nginx -d commentmind.website -d www.commentmind.website -d api.commentmind.website
```

Verify:

```bash
curl https://api.commentmind.website/health
```

Open:

```text
https://commentmind.website
https://www.commentmind.website
https://api.commentmind.website/health
```

## Updates

Deploy future changes:

```bash
cd /opt/commentmind-ai
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Maintenance

View logs:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f worker
docker compose -f docker-compose.prod.yml logs -f dashboard
```

Clean unused Docker data carefully:

```bash
docker system prune -f
```
