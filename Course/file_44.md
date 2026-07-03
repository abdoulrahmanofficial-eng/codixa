# 44-DevOps-Basics-and-Deployment.md

> مستوى الدرس: متقدم → عملي (Production)
>
> مدة القراءة: 240-300 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم DevOps.
- تجهيز مشروع Python للنشر.
- استخدام Docker بشكل عملي.
- فهم أساسيات Linux للسيرفرات.
- رفع تطبيق FastAPI على سيرفر حقيقي.
- إدارة البيئة (Environment).
- تشغيل التطبيقات بشكل دائم (Process Management).
- فهم فكرة CI/CD بشكل مبسط.

---

# مقدمة

في الدروس السابقة أنت بنيت:

- API
- Database
- Authentication
- Architecture احترافي

لكن كل ده محلي على جهازك.

السؤال:

```
إزاي نخلي الناس تستخدم التطبيق؟
```

الإجابة:

```
Deployment
```

---

# ما هو DevOps؟

DevOps = Development + Operations

هو المجال المسؤول عن:

- تشغيل التطبيقات
- نشرها على الإنترنت
- مراقبة الأداء
- إدارة السيرفرات

---

# مراحل التطبيق الحقيقي

```
Code → Build → Test → Deploy → Monitor
```

---

# أين يتم تشغيل التطبيقات؟

- VPS (سيرفر خاص)
- Cloud (AWS, Azure, GCP)
- Docker Containers

---

# Linux Basics (مهم جدًا)

## عرض الملفات

```bash
ls
```

---

## الدخول لمجلد

```bash
cd folder_name
```

---

## إنشاء مجلد

```bash
mkdir app
```

---

## حذف ملف

```bash
rm file.txt
```

---

## عرض العمليات

```bash
top
```

---

## تثبيت برامج

```bash
sudo apt update
sudo apt install python3
```

---

# SSH (الدخول للسيرفر)

```bash
ssh user@server_ip
```

---

# رفع مشروع على سيرفر

1. ادخل SSH
2. انسخ المشروع
3. شغّل التطبيق

---

# المشكلة

لو شغلت التطبيق:

```bash
python main.py
```

ثم قفلت SSH:

❌ التطبيق يتوقف

---

# الحل: Process Manager

## استخدام screen أو tmux أو systemd

---

## مثال بسيط

```bash
nohup uvicorn main:app &
```

---

# Docker (الأهم في DevOps)

Docker = تشغيل التطبيق داخل Container

---

# لماذا Docker؟

بدون Docker:

❌ اختلاف بيئات التشغيل  
❌ مشاكل dependencies  
❌ التطبيق يعمل عندك ولا يعمل على السيرفر  

---

# فكرة Docker

```
App + Dependencies + Environment = Container
```

---

# Dockerfile

```dockerfile
FROM python:3.11
```

---

```dockerfile
WORKDIR /app
```

---

```dockerfile
COPY requirements.txt .
```

---

```dockerfile
RUN pip install -r requirements.txt
```

---

```dockerfile
COPY . .
```

---

```dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

# بناء Docker Image

```bash
docker build -t myapp .
```

---

# تشغيل Container

```bash
docker run -p 8000:8000 myapp
```

---

# Docker Compose

لتشغيل أكثر من خدمة

---

```yaml
version: "3"

services:

  app:

    build: .

    ports:

      - "8000:8000"

  db:

    image: postgres
```

---

# Environment Variables

```bash
export SECRET_KEY="mysecret"
```

---

أو داخل Docker:

```dockerfile
ENV SECRET_KEY=mysecret
```

---

# Production vs Development

| Development | Production |
|-------------|------------|
| local | server |
| debug mode | optimized |
| fast changes | stable |

---

# Hosting Options

## 1) VPS

- DigitalOcean
- Hetzner
- Linode

---

## 2) Cloud

- AWS
- Azure
- Google Cloud

---

# Nginx (Reverse Proxy)

يستخدم لتوجيه الطلبات

---

```nginx
server {

    listen 80;

    location / {

        proxy_pass http://127.0.0.1:8000;
    }
}
```

---

# Gunicorn + FastAPI

```bash
pip install gunicorn
```

---

```bash
gunicorn main:app
```

---

# CI/CD (مفهوم)

## Continuous Integration

كل كود جديد يتم اختباره تلقائيًا

---

## Continuous Deployment

كل تحديث يتم رفعه تلقائيًا للسيرفر

---

# GitHub Actions (فكرة)

```yaml
name: Deploy
on: push
```

---

# Logging في الإنتاج

```python
import logging

logging.basicConfig(level=logging.INFO)
```

---

# Monitoring (مراقبة النظام)

أدوات:

- Prometheus
- Grafana

---

# Errors في الإنتاج

لا تعرض الأخطاء للمستخدم

❌

```
Traceback...
```

---

✔

```json
{
  "error": "Something went wrong"
}
```

---

# Security في السيرفر

- Firewall
- HTTPS
- Secure SSH
- Environment secrets

---

# SSL (HTTPS)

```bash
certbot --nginx
```

---

# Architecture في الإنتاج

```
Client
  ↓
Nginx
  ↓
FastAPI (Docker)
  ↓
Database (PostgreSQL)
```

---

# أخطاء شائعة

## تشغيل السيرفر بدون Docker

❌ مشاكل بيئة

---

## فتح ports بدون حماية

❌ خطر أمني

---

## تخزين secrets داخل الكود

❌ تسريب بيانات

---

# Best Practices

✅ استخدم Docker  
✅ استخدم environment variables  
✅ استخدم Nginx  
✅ استخدم HTTPS  
✅ افصل database عن app  
✅ راقب الأداء  

---

# مشروع صغير

```bash
docker build -t fastapi-app .
```

```bash
docker run -p 8000:8000 fastapi-app
```

---

# مشروع احترافي

نشر نظام كامل:

- FastAPI Backend
- PostgreSQL Database
- Docker Compose
- Nginx Reverse Proxy
- HTTPS SSL
- Logging System
- CI/CD Pipeline

---

# ملخص

- DevOps = تشغيل ونشر التطبيقات.
- Docker يحل مشاكل البيئة.
- Linux مهم جدًا للسيرفرات.
- Nginx لإدارة الطلبات.
- CI/CD للأتمتة.
- الهدف: تطبيق يعمل في أي مكان.

---

# Quiz

## السؤال الأول

ما هو Docker؟

A) لغة برمجة

B) قاعدة بيانات

C) نظام لتشغيل التطبيقات داخل حاويات

D) محرر كود

✅ الإجابة: C

---

## السؤال الثاني

ما وظيفة Nginx؟

A) كتابة كود

B) تشغيل Python

C) توجيه الطلبات للسيرفر

D) تخزين البيانات

✅ الإجابة: C

---

## السؤال الثالث

ما معنى DevOps؟

A) تصميم UI

B) تطوير فقط

C) تطوير وتشغيل التطبيقات

D) تحليل البيانات

✅ الإجابة: C

---

## السؤال الرابع

لماذا نستخدم Environment Variables؟

A) زيادة السرعة

B) حماية البيانات الحساسة

C) تشغيل Python

D) حذف الملفات

✅ الإجابة: B

---

# Challenge

أنشئ مشروع كامل قابل للنشر:

1. FastAPI App
2. PostgreSQL Database
3. Dockerize التطبيق
4. Docker Compose
5. Nginx Reverse Proxy
6. SSL (HTTPS)
7. Logging system
8. Environment Variables

**تحدٍ إضافي:**

- أضف CI/CD باستخدام GitHub Actions
- اجعل التطبيق يُنشر تلقائيًا عند push

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| DevOps | تشغيل وتطوير |
| Deployment | نشر التطبيق |
| Docker | حاويات التطبيقات |
| Container | بيئة تشغيل معزولة |
| VPS | سيرفر افتراضي |
| Nginx | سيرفر وسيط |
| CI/CD | نشر تلقائي |
| SSL | تشفير HTTPS |
| Environment Variables | متغيرات البيئة |
| Monitoring | مراقبة النظام |

---

# الدرس القادم

**45 - Final Capstone Project (Full Real-World System)**

ستقوم ببناء مشروع كامل من الصفر إلى الإنتاج يحتوي على:

- FastAPI Backend
- Database (PostgreSQL)
- Authentication (JWT + Roles)
- Clean Architecture
- Docker + Deployment
- Admin Dashboard API
- Full Production Setup

هذا سيكون المشروع النهائي للمسار بالكامل.