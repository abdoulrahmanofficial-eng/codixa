# 41-FastAPI-Advanced-Backend-Development.md

> مستوى الدرس: متقدم جدًا
>
> مدة القراءة: 220-260 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم FastAPI بشكل احترافي.
- بناء REST API متكامل.
- استخدام Path & Query Parameters.
- استخدام Pydantic Validation.
- التعامل مع Authentication (JWT).
- ربط FastAPI مع SQLAlchemy.
- استخدام Dependency Injection في FastAPI.
- بناء مشروع Backend كامل قابل للإنتاج.

---

# مقدمة

في الدروس السابقة تعلمنا:

- Flask API (أساسيات)
- REST Design
- Databases + ORM

الآن ننتقل إلى مستوى احترافي جدًا:

```
FastAPI
```

---

# لماذا FastAPI؟

FastAPI يعتبر من أقوى Frameworks في Python لأنه:

- سريع جدًا ⚡
- يدعم Type Hints
- يدعم Validation تلقائي
- يولد Documentation تلقائي
- مناسب للمشاريع الكبيرة

---

# تثبيت FastAPI

```bash
pip install fastapi uvicorn
```

---

# تشغيل السيرفر

```bash
uvicorn main:app --reload
```

---

# أول API

```python
from fastapi import FastAPI

app = FastAPI()
```

---

```python
@app.get("/")
def home():

    return {"message": "Hello FastAPI"}
```

---

# GET Request

```python
@app.get("/users")
def get_users():

    return [
        {"id": 1, "name": "Ahmed"},
        {"id": 2, "name": "Sara"}
    ]
```

---

# Path Parameters

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):

    return {"user_id": user_id}
```

---

# Query Parameters

```python
@app.get("/search")
def search(q: str = None):

    return {"query": q}
```

---

# Pydantic Models (Validation)

```python
from pydantic import BaseModel
```

---

## Model

```python
class User(BaseModel):

    name: str

    age: int
```

---

# POST Request

```python
@app.post("/users")
def create_user(user: User):

    return {"message": "User created", "user": user}
```

---

# Validation تلقائي

FastAPI يمنع:

- أنواع بيانات خاطئة
- missing fields
- invalid JSON

---

# Response Model

```python
@app.post("/users", response_model=User)
def create_user(user: User):

    return user
```

---

# Status Codes

```python
from fastapi import status
```

```python
return {"message": "Created"}
```

---

# Dependencies

## Dependency Injection

```python
from fastapi import Depends
```

---

## Example

```python
def common_params(q: str = None, limit: int = 10):

    return {"q": q, "limit": limit}
```

---

```python
@app.get("/items")
def get_items(params: dict = Depends(common_params)):

    return params
```

---

# Authentication (JWT Concept)

FastAPI يدعم JWT للتوثيق.

---

## فكرة JWT:

- User login
- Server يعطي token
- Client يستخدم token في كل request

---

# Header Authorization

```
Authorization: Bearer TOKEN
```

---

# Middleware

```python
@app.middleware("http")
async def add_process_time(request, call_next):

    response = await call_next(request)

    return response
```

---

# ربط FastAPI مع SQLAlchemy

---

## إنشاء Database

```python
from sqlalchemy import create_engine

engine = create_engine("sqlite:///./app.db")
```

---

## Session

```python
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(bind=engine)
```

---

## Dependency للـ DB

```python
def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()
```

---

# Model

```python
from sqlalchemy.orm import declarative_base

from sqlalchemy import Column, Integer, String

Base = declarative_base()
```

---

```python
class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    name = Column(String)

    age = Column(Integer)
```

---

# إنشاء الجداول

```python
Base.metadata.create_all(engine)
```

---

# CRUD API مع DB

## Create

```python
@app.post("/users")
def create_user(user: UserCreate, db=Depends(get_db)):

    db_user = User(name=user.name, age=user.age)

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user
```

---

## Read

```python
@app.get("/users")
def get_users(db=Depends(get_db)):

    return db.query(User).all()
```

---

## Get by ID

```python
@app.get("/users/{user_id}")
def get_user(user_id: int, db=Depends(get_db)):

    return db.query(User).filter(User.id == user_id).first()
```

---

## Delete

```python
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db=Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    db.delete(user)

    db.commit()

    return {"message": "deleted"}
```

---

# Async FastAPI (مهم جدًا)

```python
@app.get("/async")
async def async_route():

    return {"message": "async response"}
```

---

# Upload Files

```python
from fastapi import File, UploadFile
```

---

```python
@app.post("/upload")
def upload(file: UploadFile = File(...)):

    content = file.file.read()

    return {"filename": file.filename}
```

---

# CORS

```python
from fastapi.middleware.cors import CORSMiddleware
```

---

```python
app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_methods=["*"],

    allow_headers=["*"],
)
```

---

# API Structure احترافي

```
app/

    models/

    schemas/

    routes/

    services/

    database/

    main.py
```

---

# Best Practices

✅ فصل الـ routes عن logic

---

✅ استخدم schemas للـ validation

---

✅ لا تكتب business logic داخل endpoints

---

# Common Errors

## نسيان refresh()

❌ البيانات لا تظهر ID بعد الإنشاء

---

## فتح DB بدون close

❌ يؤدي لتسريب connections

---

## كتابة logic داخل route مباشرة

❌ يجعل الكود غير قابل للصيانة

---

# Project صغير

```python
@app.get("/")
def home():

    return {"status": "API Running"}
```

---

# Project احترافي

## نظام متجر

- Users API
- Products API
- Orders API
- Payments API

---

## Features:

- JWT Authentication
- Pagination
- Filtering
- SQLAlchemy ORM
- CORS enabled
- Structured project

---

# ملخص

- FastAPI سريع وحديث.
- يعتمد على Type Hints.
- يستخدم Pydantic للتأكد من صحة البيانات.
- سهل الربط مع SQLAlchemy.
- يدعم async بشكل قوي.
- مناسب جدًا للمشاريع الكبيرة.

---

# Quiz

## السؤال الأول

ما فائدة FastAPI؟

A) تصميم UI

B) بناء APIs

C) إدارة قواعد البيانات فقط

D) تشغيل النظام

✅ الإجابة: B

---

## السؤال الثاني

ما دور Pydantic؟

A) تشغيل السيرفر

B) التحقق من البيانات

C) تحسين السرعة

D) حذف البيانات

✅ الإجابة: B

---

## السؤال الثالث

ما معنى Dependency Injection؟

A) حذف الكود

B) تمرير الاعتماديات من الخارج

C) تحسين الذاكرة

D) تشغيل API

✅ الإجابة: B

---

## السؤال الرابع

أي كلمة تستخدم لتشغيل FastAPI؟

A) runserver

B) uvicorn

C) flask run

D) node start

✅ الإجابة: B

---

# Challenge

أنشئ نظام Backend كامل باستخدام FastAPI:

1. Users API
2. Products API
3. Orders API

المطلوب:

- استخدام SQLAlchemy
- استخدام Pydantic schemas
- إضافة JWT Authentication
- إضافة Pagination
- إضافة Filtering
- تنظيم المشروع بشكل احترافي (routes/services/models)

**تحدٍ إضافي:**

أضف نظام Role-Based Access:

- Admin
- User

بحيث:
- Admin يستطيع إضافة وحذف المنتجات
- User يستطيع الشراء فقط

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| FastAPI | إطار عمل API |
| Pydantic | التحقق من البيانات |
| Dependency Injection | حقن الاعتمادات |
| Uvicorn | سيرفر التشغيل |
| Schema | شكل البيانات |
| Middleware | وسيط |
| CORS | مشاركة الموارد |
| JWT | توكن التوثيق |
| Async | تنفيذ غير متزامن |
| ORM | ربط قواعد البيانات |

---

# الدرس القادم

**42 - Authentication & Security (JWT, OAuth2, Hashing)**

ستتعلم حماية التطبيقات بشكل احترافي، تشفير كلمات المرور، استخدام JWT Tokens، وفهم OAuth2، وبناء نظام تسجيل دخول آمن للمشاريع الكبيرة.