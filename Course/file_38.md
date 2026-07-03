# 38-API-Design-and-RESTful-Services.md

> مستوى الدرس: متقدم
>
> مدة القراءة: 180-220 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم API.
- فهم REST Architecture.
- استخدام HTTP Methods بشكل صحيح.
- تصميم Endpoints احترافية.
- التعامل مع JSON APIs.
- بناء API منظمة وقابلة للتوسع.
- فهم Status Codes.
- تطبيق مبادئ RESTful Design.

---

# مقدمة

في التطبيقات الحديثة:

- الموبايل
- الويب
- الديسكتوب

كلهم يحتاجون للتواصل مع السيرفر.

هذا التواصل يتم عبر:

```
API
```

---

# ما هو API؟

API = Application Programming Interface

هو وسيط يسمح لتطبيقين بالتواصل مع بعض.

---

# مثال بسيط

- التطبيق يطلب بيانات
- السيرفر يرد

---

# REST

REST = Representational State Transfer

هي مجموعة قواعد لتصميم APIs بشكل منظم.

---

# مبادئ REST

- استخدام HTTP Methods
- استخدام URLs واضحة
- استخدام JSON
- Stateless (كل طلب مستقل)

---

# HTTP Methods

## GET

لجلب البيانات

```http
GET /users
```

---

## POST

لإنشاء بيانات جديدة

```http
POST /users
```

---

## PUT

لتعديل بيانات كاملة

```http
PUT /users/1
```

---

## PATCH

لتعديل جزئي

```http
PATCH /users/1
```

---

## DELETE

لحذف بيانات

```http
DELETE /users/1
```

---

# Status Codes

## 200 OK

نجاح الطلب

---

## 201 Created

تم إنشاء عنصر جديد

---

## 400 Bad Request

خطأ في البيانات

---

## 401 Unauthorized

غير مصرح

---

## 404 Not Found

غير موجود

---

## 500 Server Error

خطأ في السيرفر

---

# تصميم REST API

## سيء ❌

```
/getUsers
/createUser
/deleteUser
```

---

## جيد ✅

```
/users
/users/1
```

---

# JSON Response

```json
{
    "id": 1,
    "name": "Ahmed",
    "email": "ahmed@example.com"
}
```

---

# Python API (Flask مثال بسيط)

```python
from flask import Flask, jsonify

app = Flask(__name__)
```

---

# GET API

```python
@app.route("/users", methods=["GET"])
def get_users():

    return jsonify([
        {"id": 1, "name": "Ahmed"},
        {"id": 2, "name": "Sara"}
    ])
```

---

# POST API

```python
from flask import request

@app.route("/users", methods=["POST"])
def create_user():

    data = request.json

    return jsonify({
        "message": "User created",
        "user": data
    }), 201
```

---

# GET by ID

```python
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):

    return jsonify({
        "id": user_id,
        "name": "Ahmed"
    })
```

---

# DELETE

```python
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):

    return jsonify({
        "message": f"User {user_id} deleted"
    })
```

---

# PATCH

```python
@app.route("/users/<int:user_id>", methods=["PATCH"])
def update_user(user_id):

    data = request.json

    return jsonify({
        "message": "User updated",
        "data": data
    })
```

---

# Stateless

كل طلب مستقل:

- لا يعتمد على الطلب السابق
- لا يتم حفظ حالة المستخدم داخل السيرفر

---

# تنظيم API احترافي

```
/api/v1/users
/api/v1/products
/api/v1/orders
```

---

# Query Parameters

```http
GET /users?age=20
```

---

Python

```python
age = request.args.get("age")
```

---

# Headers

```python
request.headers
```

---

مثال

```
Authorization: Bearer TOKEN
```

---

# API Structure احترافي

```python
{
    "status": "success",
    "data": {},
    "message": "OK"
}
```

---

# Error Response

```python
{
    "status": "error",
    "message": "User not found"
}
```

---

# Pagination

```http
GET /users?page=1&limit=10
```

---

Python

```python
page = request.args.get("page", 1)
limit = request.args.get("limit", 10)
```

---

# API Versioning

```
/api/v1/
/api/v2/
```

---

# Middleware Concept

كود يعمل قبل أو بعد الطلب.

مثال:

- تسجيل الدخول
- Logging
- Validation

---

# مثال بسيط Middleware (Flask)

```python
@app.before_request
def before():

    print("Request received")
```

---

# Authentication

## Token-based

```
Authorization: Bearer <token>
```

---

# Authorization

- من يملك صلاحية الوصول

---

# REST Best Practices

✅ استخدم nouns وليس verbs

---

❌ /getUsers

---

✅ /users

---

# API Naming Rules

- استخدم plural
- استخدم lowercase
- استخدم hyphen إذا لزم

---

# مثال مشروع API

## Users API

```
GET /users
POST /users
GET /users/1
PATCH /users/1
DELETE /users/1
```

---

## Products API

```
GET /products
POST /products
GET /products/10
```

---

# أخطاء شائعة

## استخدام verbs في URL

❌ /createUser

---

## عدم استخدام status codes

❌ دائمًا 200

---

## عدم تنظيم response

❌ JSON عشوائي

---

# أفضل الممارسات

✅ استخدم REST conventions

---

✅ استخدم JSON موحد الشكل

---

✅ استخدم Versioning

---

✅ استخدم Status Codes بشكل صحيح

---

# مشروع صغير

API لإدارة الطلاب

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

students = []
```

---

## إضافة طالب

```python
@app.route("/students", methods=["POST"])
def add_student():

    data = request.json

    students.append(data)

    return jsonify(data), 201
```

---

## عرض الطلاب

```python
@app.route("/students", methods=["GET"])
def get_students():

    return jsonify(students)
```

---

## حذف طالب

```python
@app.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):

    return jsonify({"message": "deleted"})
```

---

# ملخص

- API هو وسيلة تواصل بين التطبيقات.
- REST يعتمد على HTTP Methods.
- استخدم nouns بدل verbs.
- استخدم JSON كصيغة بيانات.
- استخدم Status Codes بشكل صحيح.
- اجعل API stateless.

---

# Quiz

## السؤال الأول

ما معنى API؟

A) لغة برمجة

B) نظام تشغيل

C) واجهة للتواصل بين التطبيقات

D) قاعدة بيانات

✅ الإجابة: C

---

## السؤال الثاني

أي HTTP Method يستخدم لإنشاء بيانات؟

A) GET

B) POST

C) DELETE

D) PATCH

✅ الإجابة: B

---

## السؤال الثالث

ما معنى 404؟

A) نجاح

B) خطأ في السيرفر

C) غير موجود

D) غير مصرح

✅ الإجابة: C

---

## السؤال الرابع

ما أفضل طريقة لتصميم URL في REST؟

A) /getUsers

B) /users

C) /fetchUsersData

D) /doUsers

✅ الإجابة: B

---

# Challenge

أنشئ REST API كامل لإدارة متجر إلكتروني:

1. Users
2. Products
3. Orders

المطلوب:

- CRUD كامل لكل كيان
- استخدام Status Codes
- استخدام Versioning (/api/v1)
- إضافة Pagination للمنتجات
- إضافة Authentication Token (مبدئي)
- توحيد شكل الاستجابة JSON

**تحدٍ إضافي:** أضف نظام Roles (Admin / User) للتحكم في الصلاحيات داخل API.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| API | واجهة برمجية |
| REST | نمط معماري |
| Endpoint | نقطة وصول |
| HTTP Method | طريقة طلب |
| Status Code | كود حالة |
| Stateless | بدون حفظ حالة |
| Authentication | تحقق الهوية |
| Authorization | التفويض |
| JSON | تنسيق بيانات |
| Middleware | وسيط معالجة |

---

# الدرس القادم

**39 - Databases & SQL Fundamentals**

ستتعلم أساسيات قواعد البيانات، وكيفية استخدام SQL، إنشاء الجداول، تنفيذ CRUD Queries، وربط قواعد البيانات مع تطبيقات Python و APIs بشكل احترافي.