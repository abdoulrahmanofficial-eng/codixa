# 42-Authentication-and-Security-JWT-OAuth2.md

> مستوى الدرس: متقدم جدًا
>
> مدة القراءة: 200-250 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم أساسيات الأمان في الويب.
- تشفير كلمات المرور بشكل صحيح.
- استخدام JWT Authentication.
- فهم OAuth2 بشكل مبسط وعملي.
- بناء نظام تسجيل دخول (Login/Register).
- حماية الـ APIs.
- إدارة الصلاحيات (Roles).
- التعامل مع Tokens بشكل آمن.

---

# مقدمة

أي تطبيق فيه:

- Users
- Data
- APIs

لازم يكون فيه:

```
Security
```

بدون أمان:

❌ أي شخص يقدر يدخل البيانات  
❌ أي شخص يقدر يعدل أو يحذف  
❌ تسريب بيانات المستخدمين  

---

# أهم مفهومين في الأمان

## 1) Authentication

من أنت؟

---

## 2) Authorization

ماذا يُسمح لك أن تفعل؟

---

# تشفير كلمات المرور

❌ خطأ شائع:

```python
password = "123456"
```

---

# الحل: Hashing

لا نخزن كلمة المرور كما هي.

بل نخزن نسخة مشفرة.

---

# bcrypt

```bash
pip install bcrypt
```

---

# Hash Password

```python
import bcrypt

password = b"mypassword"

hashed = bcrypt.hashpw(password, bcrypt.gensalt())

print(hashed)
```

---

# Verify Password

```python
bcrypt.checkpw(password, hashed)
```

---

# JWT (JSON Web Token)

هو طريقة لإثبات هوية المستخدم بدون تخزين Session.

---

# فكرة JWT

1. المستخدم يسجل دخول
2. السيرفر يعطي Token
3. المستخدم يستخدم Token في كل طلب

---

# شكل JWT

```
HEADER.PAYLOAD.SIGNATURE
```

---

# تثبيت مكتبة JWT

```bash
pip install python-jose
```

---

# إنشاء Token

```python
from jose import jwt

SECRET_KEY = "secret"

data = {"user_id": 1}

token = jwt.encode(data, SECRET_KEY, algorithm="HS256")

print(token)
```

---

# فك Token

```python
decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

print(decoded)
```

---

# FastAPI Login System

---

## User Model

```python
class User:

    def __init__(self, username, password):

        self.username = username

        self.password = password
```

---

# Register

```python
users = []
```

---

```python
def register(username, password):

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    users.append({

        "username": username,

        "password": hashed
    })
```

---

# Login

```python
def login(username, password):

    for user in users:

        if user["username"] == username:

            if bcrypt.checkpw(password.encode(), user["password"]):

                token = jwt.encode(

                    {"username": username},

                    SECRET_KEY,

                    algorithm="HS256"
                )

                return token

    return None
```

---

# حماية API

```python
def protected_route(token):

    try:

        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        return {"message": "Access granted", "user": data}

    except:

        return {"message": "Invalid token"}
```

---

# OAuth2 (مفهوم مبسط)

OAuth2 يستخدم لتسجيل الدخول عبر:

- Google
- Facebook
- GitHub

---

# مثال:

بدل إنشاء حساب:

```
Login with Google
```

---

# الفرق بين JWT و OAuth2

| JWT | OAuth2 |
|-----|--------|
| Token داخلي | تسجيل دخول خارجي |
| بسيط | أكثر تعقيدًا |
| تستخدمه أنت | تستخدمه شركات كبيرة |

---

# Roles (الصلاحيات)

## مثال:

- Admin
- User

---

# إضافة Role داخل JWT

```python
payload = {

    "username": "Ahmed",

    "role": "admin"
}
```

---

# التحقق من Role

```python
def check_admin(token):

    data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

    if data.get("role") == "admin":

        return True

    return False
```

---

# حماية Routes

```python
def delete_product(token):

    if not check_admin(token):

        return {"error": "Forbidden"}

    return {"message": "Product deleted"}
```

---

# Password Best Practices

✅ استخدم bcrypt أو argon2  
❌ لا تخزن passwords نص واضح  
❌ لا تستخدم SHA256 وحده  

---

# Token Expiration

```python
import datetime

payload = {

    "user_id": 1,

    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
}
```

---

# Refresh Tokens (مفهوم)

- Access Token → قصير المدة
- Refresh Token → طويل المدة

---

# Security Best Practices

## 1) HTTPS

كل البيانات لازم تكون مشفرة أثناء النقل.

---

## 2) Rate Limiting

منع الهجمات عبر تكرار الطلبات.

---

## 3) Input Validation

منع إدخال بيانات ضارة.

---

## 4) Never trust frontend

كل التحقق يكون في السيرفر.

---

# Common Attacks

## 1) Brute Force

تجربة كلمات مرور كثيرة.

---

## 2) SQL Injection

إدخال أوامر SQL داخل input.

---

## 3) Token Theft

سرقة JWT من المستخدم.

---

# Secure API Flow

```
Register → Login → Token → Access API → Validate Token → Response
```

---

# FastAPI JWT (شكل احترافي)

```python
from fastapi import Depends, HTTPException

from fastapi.security import OAuth2PasswordBearer
```

---

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
```

---

```python
def get_current_user(token: str = Depends(oauth2_scheme)):

    try:

        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        return data

    except:

        raise HTTPException(status_code=401, detail="Invalid token")
```

---

# حماية Endpoint

```python
@app.get("/profile")
def profile(user = Depends(get_current_user)):

    return user
```

---

# أخطاء شائعة

## تخزين password بدون hashing

❌ كارثة أمنية

---

## إرسال token بدون expiry

❌ خطر كبير

---

## عدم التحقق من role

❌ أي مستخدم يمكنه الوصول لأي شيء

---

# أفضل الممارسات

✅ Hash passwords  
✅ استخدم JWT مع expiration  
✅ تحقق من roles  
✅ استخدم HTTPS  
✅ لا تثق في client  

---

# مشروع صغير

نظام تسجيل دخول بسيط:

```python
register("Ahmed", "1234")

token = login("Ahmed", "1234")

print(token)
```

---

# مشروع احترافي

نظام كامل:

- Register
- Login
- JWT Auth
- Admin/User Roles
- Protected Routes
- Token Expiration
- Password Hashing

---

# ملخص

- Authentication = تحديد الهوية
- Authorization = الصلاحيات
- JWT = طريقة إدارة الهوية عبر Tokens
- bcrypt = تشفير كلمات المرور
- OAuth2 = تسجيل دخول خارجي
- الأمان أهم جزء في أي API

---

# Quiz

## السؤال الأول

ما معنى Authentication؟

A) حذف البيانات

B) تحديد هوية المستخدم

C) تحسين الأداء

D) إنشاء API

✅ الإجابة: B

---

## السؤال الثاني

ما وظيفة bcrypt؟

A) إنشاء API

B) تشفير كلمات المرور

C) تشغيل السيرفر

D) حذف المستخدمين

✅ الإجابة: B

---

## السؤال الثالث

ما هو JWT؟

A) قاعدة بيانات

B) نظام تخزين ملفات

C) Token لتوثيق المستخدم

D) لغة برمجة

✅ الإجابة: C

---

## السؤال الرابع

ما معنى Authorization؟

A) تسجيل الدخول

B) التحقق من الهوية

C) تحديد الصلاحيات

D) حذف الحساب

✅ الإجابة: C

---

# Challenge

أنشئ نظام Authentication كامل:

1. Register / Login
2. JWT Token
3. Password Hashing
4. Roles (Admin / User)
5. Protected Routes
6. Token Expiration
7. Admin Dashboard API

**تحدٍ إضافي:**

- أضف Refresh Token system
- أضف Rate Limiting بسيط
- امنع brute force login attempts

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Authentication | التحقق من الهوية |
| Authorization | التفويض |
| Hashing | تشفير أحادي الاتجاه |
| JWT | توكن ويب |
| OAuth2 | تسجيل دخول خارجي |
| Secret Key | مفتاح سري |
| Expiration | انتهاء الصلاحية |
| Middleware | وسيط |
| Role | صلاحية |
| Token | رمز دخول |

---

# الدرس القادم

**43 - Real-World Backend Architecture (Production Level Design)**

ستتعلم كيف تبني مشروع Backend حقيقي مثل الشركات الكبيرة، تنظيم الملفات، Layers Architecture، Services Pattern، Repository Pattern، Logging، Error Handling، ورفع مشروع كامل Production Ready.