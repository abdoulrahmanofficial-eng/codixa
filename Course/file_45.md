# 45-Final-Capstone-Project-Full-System.md

> مستوى الدرس: مشروع نهائي (Production Capstone)
>
> مدة التنفيذ: 5 - 10 أيام (حسب التطبيق)
>
> الهدف: تحويل كل ما تعلمته إلى نظام حقيقي جاهز للنشر

---

# 🎯 هدف المشروع النهائي

في نهاية هذا المشروع ستكون قادرًا على بناء:

```
Full Real-World Backend System
```

يشمل:

- FastAPI Backend
- PostgreSQL Database
- Authentication (JWT)
- Role-Based Access (Admin / User)
- Clean Architecture
- Docker Deployment
- Logging & Error Handling
- Production-ready API

---

# 💡 فكرة المشروع

## 🛒 نظام متجر إلكتروني كامل (E-Commerce Backend)

---

# 🧱 مكونات النظام

## 1) Users System

- Register
- Login
- Profile
- Roles (Admin / User)

---

## 2) Products System

- إضافة منتجات
- تعديل منتجات
- حذف منتجات (Admin فقط)
- عرض المنتجات
- Pagination

---

## 3) Orders System

- إنشاء طلب
- عرض الطلبات
- ربط الطلبات بالمستخدمين
- حساب إجمالي الطلب

---

## 4) Auth System

- JWT Login
- Password Hashing
- Token Expiration
- Protected Routes

---

# 🏗️ Architecture (المطلوب)

```
app/

    api/

        routes/

    services/

    repositories/

    models/

    schemas/

    core/

        config.py

        database.py

        security.py

    utils/

    main.py
```

---

# 🧠 قواعد المشروع

❌ ممنوع تكتب logic داخل routes  
❌ ممنوع التعامل مع DB مباشرة داخل routes  
❌ ممنوع تخزين passwords بدون hashing  
❌ ممنوع استخدام tokens بدون expiration  

---

# 🔐 Authentication Flow

```
Register → Hash Password → Save User
Login → Verify Password → Generate JWT
Request → Validate JWT → Access Protected Route
```

---

# 👥 Roles System

## Admin

- إضافة منتجات
- حذف منتجات
- تعديل أي بيانات

---

## User

- عرض المنتجات
- إنشاء طلبات
- مشاهدة طلباته فقط

---

# 📦 Database Schema

---

## Users

- id
- name
- email
- password_hash
- role

---

## Products

- id
- name
- price
- stock

---

## Orders

- id
- user_id
- total_price

---

## OrderItems

- id
- order_id
- product_id
- quantity

---

# ⚙️ Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT (python-jose)
- bcrypt
- Docker
- Uvicorn

---

# 🧪 API Endpoints

---

## Auth

```
POST /auth/register
POST /auth/login
```

---

## Users

```
GET /users/me
GET /users (admin)
```

---

## Products

```
GET /products
POST /products (admin)
PUT /products/{id} (admin)
DELETE /products/{id} (admin)
```

---

## Orders

```
POST /orders
GET /orders/my
GET /orders (admin)
```

---

# 🔥 Example: JWT Middleware

```python
def get_current_user(token: str):

    payload = decode(token, SECRET_KEY, algorithms=["HS256"])

    return payload
```

---

# 🔥 Example: Role Check

```python
def admin_required(user):

    if user["role"] != "admin":

        raise Exception("Forbidden")
```

---

# 🧱 Service Layer Example

```python
class ProductService:

    def __init__(self, repo):

        self.repo = repo

    def create_product(self, data, user):

        if user["role"] != "admin":

            raise Exception("Not allowed")

        return self.repo.create(data)
```

---

# 🗄️ Repository Layer

```python
class ProductRepository:

    def __init__(self, db):

        self.db = db

    def create(self, product):

        self.db.add(product)

        self.db.commit()

        self.db.refresh(product)

        return product
```

---

# 🌐 Routes Layer

```python
@router.post("/products")
def create_product(product, service=Depends()):

    return service.create_product(product)
```

---

# 🐳 Docker Setup

## Dockerfile

```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## docker-compose.yml

```yaml
version: "3.9"

services:

  api:

    build: .

    ports:

      - "8000:8000"

    depends_on:

      - db

  db:

    image: postgres

    environment:

      POSTGRES_USER: user

      POSTGRES_PASSWORD: pass

      POSTGRES_DB: shop
```

---

# 📊 Pagination Example

```python
def get_products(limit: int = 10, skip: int = 0):

    return db.query(Product).offset(skip).limit(limit).all()
```

---

# 🧯 Error Handling

```python
from fastapi import HTTPException
```

```python
raise HTTPException(

    status_code=404,

    detail="Product not found"
)
```

---

# 🧾 Logging

```python
import logging

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)
```

---

# 🔐 Security Rules

- Hash passwords (bcrypt)
- Use HTTPS in production
- Never expose SECRET_KEY
- Validate all inputs
- Use role-based access

---

# 🚀 Deployment Flow

```
Code → Docker Build → Docker Run → Server (VPS) → Nginx → Users
```

---

# 🌍 Production Architecture

```
Client
  ↓
Nginx
  ↓
FastAPI (Docker)
  ↓
PostgreSQL
```

---

# ⚠️ Common Mistakes

❌ وضع كل الكود في ملف واحد  
❌ عدم استخدام roles  
❌ إهمال hashing  
❌ تشغيل بدون Docker  
❌ عدم استخدام validation  

---

# 🧪 Testing (مهم جدًا)

```python
from fastapi.testclient import TestClient
```

```python
client = TestClient(app)
```

---

```python
def test_home():

    response = client.get("/")

    assert response.status_code == 200
```

---

# 🧠 Advanced Upgrade (اختياري)

- Add Redis caching
- Add email verification
- Add refresh tokens
- Add analytics dashboard
- Add rate limiting

---

# 🏁 النتيجة النهائية

بعد المشروع ده هتكون قادر:

✔ تبني Backend كامل  
✔ تشتغل في شركة  
✔ تنفذ مشاريع SaaS  
✔ تعمل APIs احترافية  
✔ تنشر مشاريعك على سيرفرات حقيقية  

---

# 🧭 الطريق بعد الكورس

## المستوى التالي:

- Microservices Architecture
- Kubernetes
- System Design
- Scalable APIs
- Cloud Engineering

---

# 🏆 خاتمة المسار

أنت الآن مش مجرد متعلم بايثون...

أنت قادر تبني:

```
Real Production Systems
```

من الصفر إلى النشر.

---

# 🎉 نهاية المسار

إذا حابب، الخطوة الجاية ممكن تكون:

- تحويل المشروع ده إلى SaaS حقيقي
- أو بناء Frontend Dashboard له
- أو إضافة AI features داخل النظام