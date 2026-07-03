# 43-Real-World-Backend-Architecture-Production-Level.md

> مستوى الدرس: احترافي جدًا (Production Level)
>
> مدة القراءة: 240-300 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم Architecture المشاريع الكبيرة.
- بناء Backend بطريقة الشركات (Production Ready).
- تنظيم المشروع بطريقة Clean Architecture.
- استخدام Layers (Routes / Services / Repositories).
- التعامل مع Errors بشكل احترافي.
- إضافة Logging للنظام.
- تحسين قابلية الصيانة والتوسع.
- بناء مشروع قابل للنشر الحقيقي.

---

# مقدمة

كل الدروس السابقة علمتك:

- APIs
- Databases
- ORM
- Security

لكن المشكلة:

❌ كل شيء كان داخل ملف أو ملفين  
❌ الكود غير منظم للمشاريع الكبيرة  

في الواقع:

```
مشاريع الشركات = نظام طبقات (Layers)
```

---

# ما هي Clean Architecture؟

هي طريقة لتنظيم المشروع بحيث:

- كل جزء له مسؤولية واحدة
- الكود سهل التعديل
- الكود سهل الاختبار
- الكود قابل للتوسع

---

# Layers في Backend

## 1) Routes Layer

استقبال الطلبات فقط

---

## 2) Services Layer

منطق التطبيق (Business Logic)

---

## 3) Repository Layer

التعامل مع قاعدة البيانات

---

## 4) Models Layer

تعريف الجداول

---

## الشكل العام

```
Client → Routes → Services → Repository → Database
```

---

# هيكل مشروع احترافي

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

# 1) Models Layer

```python
from sqlalchemy import Column, Integer, String

from core.database import Base
```

---

```python
class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    name = Column(String)

    email = Column(String)
```

---

# 2) Schemas Layer (Pydantic)

```python
from pydantic import BaseModel
```

---

```python
class UserCreate(BaseModel):

    name: str

    email: str
```

---

# 3) Repository Layer

هنا يتم التعامل مع DB فقط

---

```python
from models.user import User
```

---

```python
class UserRepository:

    def __init__(self, db):

        self.db = db
```

---

```python
    def get_all(self):

        return self.db.query(User).all()
```

---

```python
    def get_by_id(self, user_id):

        return self.db.query(User).filter(User.id == user_id).first()
```

---

```python
    def create(self, user):

        self.db.add(user)

        self.db.commit()

        self.db.refresh(user)

        return user
```

---

# 4) Service Layer

هنا المنطق الحقيقي

---

```python
from models.user import User
```

---

```python
class UserService:

    def __init__(self, repo):

        self.repo = repo
```

---

```python
    def get_users(self):

        return self.repo.get_all()
```

---

```python
    def create_user(self, data):

        user = User(**data.dict())

        return self.repo.create(user)
```

---

# 5) Routes Layer

```python
from fastapi import APIRouter, Depends
```

---

```python
router = APIRouter()
```

---

```python
@router.get("/users")
def get_users(service=Depends()):

    return service.get_users()
```

---

```python
@router.post("/users")
def create_user(user, service=Depends()):

    return service.create_user(user)
```

---

# Dependency Injection (مهم جدًا)

```python
def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()
```

---

# Core Layer

## database.py

```python
from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker, declarative_base
```

---

```python
engine = create_engine("sqlite:///app.db")

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
```

---

# Config Layer

```python
import os
```

```python
SECRET_KEY = os.getenv("SECRET_KEY", "default")
```

---

# Logging System

```python
import logging
```

---

```python
logging.basicConfig(

    level=logging.INFO,

    format="%(asctime)s - %(levelname)s - %(message)s"
)
```

---

```python
logger = logging.getLogger(__name__)
```

---

```python
logger.info("Server started")
```

---

# Error Handling

```python
from fastapi import HTTPException
```

---

```python
raise HTTPException(

    status_code=404,

    detail="User not found"
)
```

---

# Global Exception Handler

```python
from fastapi import Request
```

---

```python
@app.exception_handler(Exception)
def global_exception(request: Request, exc: Exception):

    return {

        "error": "Internal Server Error"
    }
```

---

# Environment Variables

❌ لا تضع secrets داخل الكود

---

## مثال

```
DATABASE_URL=sqlite:///app.db
SECRET_KEY=supersecret
```

---

# Security Layer

```python
def verify_token(token):

    try:

        return decode(token)

    except:

        return None
```

---

# Project Flow الحقيقي

```
Request
  ↓
Routes
  ↓
Services
  ↓
Repositories
  ↓
Database
```

---

# لماذا هذا التصميم مهم؟

## بدون Architecture

❌ كود عشوائي  
❌ صعب التعديل  
❌ صعب التوسع  

---

## مع Architecture

✅ قابل للتوسع  
✅ سهل الصيانة  
✅ مناسب لفريق عمل  

---

# Anti Patterns (أخطاء خطيرة)

## 1) Business Logic داخل Routes

❌ خطأ كبير

---

## 2) التعامل مع DB داخل Routes

❌ غير احترافي

---

## 3) عدم فصل الملفات

❌ مشروع غير قابل للتطوير

---

# Best Practices

✅ افصل كل Layer  
✅ اجعل كل Class مسؤول عن شيء واحد  
✅ استخدم Dependency Injection  
✅ لا تكرر الكود  
✅ اجعل المشروع قابل للاختبار  

---

# مشروع صغير (بنية كاملة)

```
app/

    api/

        routes/

    services/

    repositories/

    models/

    schemas/

    core/

    main.py
```

---

# مشروع احترافي (شركة حقيقية)

## نظام متجر إلكتروني

- Users Service
- Products Service
- Orders Service
- Payments Service
- Auth Service

---

## Features

- JWT Authentication
- Role-based Access
- Logging System
- Error Handling
- Clean Architecture
- Database Layer separated

---

# مثال تدفق كامل

```
User sends request
→ Route receives
→ Service processes logic
→ Repository queries DB
→ Response returned
```

---

# ملخص

- Clean Architecture = تنظيم احترافي للمشروع.
- كل Layer له مسؤولية واحدة.
- Routes لا تحتوي على logic.
- Services تحتوي على business logic.
- Repositories تتعامل مع DB فقط.
- هذا هو شكل مشاريع الشركات الحقيقية.

---

# Quiz

## السؤال الأول

ما وظيفة Service Layer؟

A) عرض البيانات

B) منطق التطبيق

C) تشغيل السيرفر

D) حذف الملفات

✅ الإجابة: B

---

## السؤال الثاني

ما وظيفة Repository؟

A) UI

B) Business Logic

C) التعامل مع قاعدة البيانات

D) Authentication

✅ الإجابة: C

---

## السؤال الثالث

ما المشكلة في وضع كل الكود داخل Routes؟

A) تحسين الأداء

B) تنظيم أفضل

C) صعوبة الصيانة

D) زيادة السرعة

✅ الإجابة: C

---

## السؤال الرابع

ما الهدف من Clean Architecture؟

A) تعقيد الكود

B) تنظيم المشروع

C) حذف البيانات

D) تشغيل أسرع فقط

✅ الإجابة: B

---

# Challenge

أنشئ مشروع Backend كامل:

## المطلوب:

1. Users / Products / Orders
2. فصل Layers بالكامل:
   - Routes
   - Services
   - Repositories
   - Models
3. إضافة:
   - JWT Authentication
   - Role System
   - Logging
   - Error Handling
4. استخدام Environment Variables
5. تنظيم كامل قابل للنشر

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Architecture | هيكل النظام |
| Layer | طبقة |
| Service | خدمة |
| Repository | مستودع بيانات |
| Dependency Injection | حقن الاعتمادات |
| Logging | تسجيل الأحداث |
| Exception | خطأ |
| Config | إعدادات |
| Environment Variables | متغيرات البيئة |
| Clean Architecture | معمارية نظيفة |

---

# الدرس القادم

**44 - DevOps Basics & Deployment (Docker, Linux, Hosting)**

ستتعلم كيف تنشر مشروعك على الإنترنت، استخدام Docker، أساسيات Linux، رفع التطبيقات على سيرفرات حقيقية، وتجهيز مشروعك ليكون Production Ready فعليًا.