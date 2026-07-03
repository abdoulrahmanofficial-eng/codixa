# 29-Working-with-APIs.md

> مستوى الدرس: متوسط → متقدم
>
> مدة القراءة: 140-170 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم معنى API.
- فهم بروتوكول HTTP.
- معرفة أشهر أنواع Requests.
- استخدام مكتبة requests.
- إرسال GET و POST Requests.
- التعامل مع JSON.
- قراءة البيانات القادمة من API.
- إرسال Headers و Parameters.
- استخدام API Keys.
- التعامل مع الأخطاء والاستجابات.

---

# مقدمة

تخيل أنك تريد معرفة:

- حالة الطقس.
- سعر الدولار.
- أسعار العملات الرقمية.
- مباريات كرة القدم.
- ترجمة النصوص.
- إرسال رسالة واتساب.
- استخدام ChatGPT.

هل ستكتب كل هذه الخدمات بنفسك؟

بالطبع لا.

بدلاً من ذلك ستستخدم:

```
API
```

---

# ما هي API؟

API اختصار:

```
Application Programming Interface
```

وهي وسيلة تسمح لبرنامجين بالتواصل مع بعضهما البعض.

---

# مثال من الواقع

تخيل مطعمًا.

```
أنت

↓

الجرسون

↓

المطبخ
```

أنت لا تدخل إلى المطبخ.

الجرسون ينقل الطلب.

الـ API هو الجرسون.

---

# كيف تعمل؟

```
برنامجك

↓

API Request

↓

Server

↓

Response

↓

برنامجك
```

---

# HTTP

هو البروتوكول المستخدم لإرسال الطلبات.

---

# أشهر أنواع الطلبات

| Method | الاستخدام |
|---------|------------|
| GET | جلب البيانات |
| POST | إرسال بيانات جديدة |
| PUT | تحديث البيانات بالكامل |
| PATCH | تحديث جزء من البيانات |
| DELETE | حذف البيانات |

---

# تثبيت requests

```bash
pip install requests
```

---

# أول Request

```python
import requests

response = requests.get("https://jsonplaceholder.typicode.com/posts/1")

print(response.status_code)
```

الناتج:

```
200
```

---

# Status Codes

| الكود | المعنى |
|--------|---------|
| 200 | نجاح |
| 201 | تم إنشاء مورد جديد |
| 204 | نجحت العملية ولا يوجد محتوى |
| 400 | طلب غير صحيح |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 500 | خطأ في الخادم |

---

# قراءة البيانات

```python
print(response.text)
```

---

# JSON

معظم APIs ترسل البيانات بصيغة:

```
JSON
```

مثال:

```json
{

    "id":1,

    "title":"Hello",

    "userId":5

}
```

---

# تحويل JSON

```python
data = response.json()

print(data)
```

---

الوصول للبيانات

```python
print(data["title"])
```

---

# إرسال Parameters

بدلًا من كتابة القيم داخل الرابط يدويًا:

```python
params = {

    "userId":1

}

response = requests.get(

    "https://jsonplaceholder.typicode.com/posts",

    params=params

)
```

سيضيف requests المعاملات إلى الرابط بشكل صحيح.

---

# إرسال Headers

```python
headers = {

    "User-Agent":"Python App"

}

response = requests.get(url, headers=headers)
```

---

# إرسال POST

```python
data = {

    "title":"Python",

    "body":"Lesson",

    "userId":1

}

response = requests.post(

    "https://jsonplaceholder.typicode.com/posts",

    json=data

)
```

---

الناتج

```python
print(response.status_code)
```

```
201
```

---

# قراءة JSON

```python
print(response.json())
```

---

# إرسال Form Data

```python
response = requests.post(

    url,

    data=data

)
```

---

# الفرق بين json و data

| json | data |
|-------|------|
| يرسل JSON | يرسل بيانات Form بشكل افتراضي |

يعتمد الاختيار على ما يتطلبه الـ API.

---

# Timeout

قد يتأخر الخادم.

```python
response = requests.get(

    url,

    timeout=5

)
```

إذا لم يصل الرد خلال 5 ثوانٍ، سيتم إطلاق استثناء.

---

# التعامل مع الأخطاء

```python
import requests

try:

    response = requests.get(url, timeout=5)

    response.raise_for_status()

except requests.exceptions.RequestException as error:

    print(error)
```

`raise_for_status()` يطلق استثناء إذا كانت الاستجابة تشير إلى خطأ (مثل 404 أو 500).

---

# API Key

بعض الخدمات تتطلب مفتاحًا.

مثال:

```
x-api-key

xxxxxxxxxx
```

---

إرساله في Header

```python
headers = {

    "x-api-key":"YOUR_KEY"

}

requests.get(url, headers=headers)
```

---

# Bearer Token

بعض الخدمات تستخدم:

```text
Authorization: Bearer YOUR_TOKEN
```

مثال:

```python
headers = {

    "Authorization":"Bearer YOUR_TOKEN"

}
```

---

# قراءة قائمة

إذا أعاد الـ API:

```json
[

{

"id":1

},

{

"id":2

}

]
```

---

يمكن المرور عليها:

```python
for item in response.json():

    print(item["id"])
```

---

# مثال عملي

جلب جميع المستخدمين.

```python
import requests

response = requests.get(

"https://jsonplaceholder.typicode.com/users"

)

users = response.json()

for user in users:

    print(user["name"])
```

---

# مثال

جلب منشور.

```python
import requests

response = requests.get(

"https://jsonplaceholder.typicode.com/posts/1"

)

post = response.json()

print(post["title"])
```

---

# استخدام Session

إذا كنت سترسل عدة طلبات لنفس الخدمة، يمكنك استخدام Session لإعادة استخدام الاتصال وبعض الإعدادات.

```python
import requests

with requests.Session() as session:

    response = session.get("https://jsonplaceholder.typicode.com/posts")

    print(response.status_code)
```

---

# أخطاء شائعة

## نسيان json()

```python
print(response)
```

لن يعرض البيانات الفعلية القادمة من الـ API.

---

## تجاهل Status Code

قد يكون الطلب فشل.

ويجب دائمًا التحقق من النتيجة أو استخدام `raise_for_status()`.

---

## وضع API Key داخل الكود

يفضل حفظها في متغيرات البيئة (Environment Variables) أو باستخدام ملفات إعدادات آمنة، وليس داخل الكود المرفوع إلى Git.

---

# أفضل الممارسات

✅ استخدم `timeout`.

---

✅ استخدم `raise_for_status()` أو تحقق من `status_code`.

---

✅ خزّن المفاتيح السرية خارج الكود.

---

✅ اقرأ توثيق الـ API قبل الاستخدام.

---

# مشروع صغير

إنشاء برنامج يجلب بيانات مستخدم.

```python
import requests

user_id = input("Enter User ID: ")

response = requests.get(

    f"https://jsonplaceholder.typicode.com/users/{user_id}",

    timeout=5

)

response.raise_for_status()

user = response.json()

print("Name:", user["name"])

print("Email:", user["email"])

print("City:", user["address"]["city"])
```

---

# ملخص

- API تسمح للتطبيقات بالتواصل مع بعضها.
- يستخدم HTTP لإرسال الطلبات.
- `GET` لجلب البيانات و`POST` لإرسالها.
- تستخدم مكتبة `requests` للتعامل مع APIs.
- معظم APIs ترسل البيانات بصيغة JSON.
- احرص على التعامل مع الأخطاء والتحقق من الاستجابات.

---

# Quiz

## السؤال الأول

ما اختصار API؟

A) Application Programming Interface

B) Automatic Program Integration

C) Advanced Python Interface

D) Application Process Internet

✅ الإجابة: A

---

## السؤال الثاني

أي Method يستخدم لجلب البيانات؟

A) POST

B) GET

C) DELETE

D) PATCH

✅ الإجابة: B

---

## السؤال الثالث

أي Method يحول استجابة JSON إلى كائنات Python؟

A)

```python
response.text()
```

B)

```python
response.json()
```

C)

```python
response.data()
```

D)

```python
response.object()
```

✅ الإجابة: B

---

## السؤال الرابع

ما فائدة `timeout`؟

A) حذف البيانات.

B) تحديد الحد الأقصى لانتظار الاستجابة.

C) تشفير البيانات.

D) إرسال الطلب أسرع.

✅ الإجابة: B

---

# Challenge

أنشئ تطبيقًا بسيطًا لسعر العملات.

المطلوب:

1. استخدم API مجاني لأسعار العملات.
2. اطلب من المستخدم إدخال عملتين (مثل USD وEUR).
3. أرسل طلب GET إلى الـ API.
4. اعرض سعر التحويل.
5. تعامل مع الأخطاء مثل انقطاع الإنترنت أو إدخال رمز عملة غير صحيح.
6. استخدم `timeout` و`raise_for_status()`.

**تحدٍ إضافي:** أضف خيارًا لحفظ آخر عمليات البحث داخل ملف JSON محلي حتى يمكن الرجوع إليها لاحقًا.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| API | واجهة برمجة التطبيقات |
| Endpoint | نقطة وصول |
| Request | طلب |
| Response | استجابة |
| HTTP | بروتوكول نقل النص الفائق |
| JSON | تنسيق تبادل البيانات |
| Header | رأس الطلب |
| Parameter | معامل |
| API Key | مفتاح API |
| Status Code | كود الحالة |

---

# الدرس القادم

**30 - JSON in Python**

ستتعلم كيفية قراءة وكتابة ملفات JSON، وتحويل البيانات بين قواميس Python وJSON، واستخدام JSON لحفظ الإعدادات والبيانات في التطبيقات الحقيقية.