# 30-JSON-in-Python.md

> مستوى الدرس: متوسط → متقدم
>
> مدة القراءة: 110-140 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم ما هو JSON.
- معرفة الفرق بين Dictionary و JSON.
- تحويل البيانات بين Python و JSON.
- قراءة ملفات JSON.
- كتابة ملفات JSON.
- تعديل البيانات داخل ملفات JSON.
- استخدام JSON في التطبيقات الحقيقية.
- التعامل مع الأخطاء أثناء قراءة ملفات JSON.

---

# مقدمة

في الدرس السابق تعلمنا كيفية التعامل مع APIs.

لكن معظم APIs ترسل البيانات بهذا الشكل:

```json
{
    "name": "Ahmed",
    "age": 20,
    "city": "Cairo"
}
```

هذا يسمى:

```
JSON
```

ويعتبر أشهر صيغة لتبادل البيانات بين التطبيقات.

---

# ما هو JSON؟

JSON اختصار:

```
JavaScript Object Notation
```

ورغم اسمه، فهو يستخدم في معظم لغات البرمجة، وليس JavaScript فقط.

---

# لماذا نستخدم JSON؟

يستخدم في:

- APIs.
- ملفات الإعدادات.
- قواعد البيانات.
- الألعاب.
- تطبيقات الويب.
- تطبيقات الهاتف.

---

# شكل JSON

```json
{
    "name": "Ahmed",
    "age": 20,
    "skills": [
        "Python",
        "HTML",
        "CSS"
    ]
}
```

---

# Dictionary vs JSON

Dictionary في Python:

```python
student = {
    "name": "Ahmed",
    "age": 20
}
```

---

JSON:

```json
{
    "name": "Ahmed",
    "age": 20
}
```

---

الفرق الأساسي:

| Dictionary | JSON |
|------------|------|
| كائن Python | نص (String) بتنسيق JSON |
| يستخدم داخل البرنامج | يستخدم لنقل وتخزين البيانات |

---

# مكتبة json

Python توفر مكتبة جاهزة.

```python
import json
```

---

# تحويل Dictionary إلى JSON

```python
import json

student = {
    "name": "Ahmed",
    "age": 20
}

json_data = json.dumps(student)

print(json_data)
```

---

الناتج

```json
{"name": "Ahmed", "age": 20}
```

---

# نوع البيانات

```python
print(type(student))
```

```
dict
```

---

```python
print(type(json_data))
```

```
str
```

---

# تحويل JSON إلى Dictionary

```python
import json

text = '{"name":"Ahmed","age":20}'

data = json.loads(text)

print(data["name"])
```

---

# كتابة JSON داخل ملف

```python
import json

student = {
    "name": "Ahmed",
    "grade": 95
}

with open("student.json", "w", encoding="utf-8") as file:

    json.dump(student, file)
```

---

# تنسيق JSON

```python
json.dump(

    student,

    file,

    indent=4
)
```

سيصبح الملف أكثر قابلية للقراءة.

---

# الحفاظ على العربية

بشكل افتراضي قد يتم تحويل الأحرف العربية إلى Unicode.

للحفاظ عليها كما هي:

```python
json.dump(

    student,

    file,

    ensure_ascii=False,

    indent=4
)
```

---

# قراءة ملف JSON

```python
import json

with open("student.json", encoding="utf-8") as file:

    data = json.load(file)

print(data)
```

---

الوصول للبيانات

```python
print(data["grade"])
```

---

# تعديل ملف JSON

```python
import json

with open("student.json", encoding="utf-8") as file:

    student = json.load(file)

student["grade"] = 100

with open("student.json", "w", encoding="utf-8") as file:

    json.dump(student, file, indent=4, ensure_ascii=False)
```

---

# قائمة من البيانات

```python
students = [

    {
        "name":"Ahmed",
        "grade":90
    },

    {
        "name":"Sara",
        "grade":95
    }
]
```

---

الحفظ

```python
json.dump(

    students,

    file,

    indent=4,

    ensure_ascii=False
)
```

---

القراءة

```python
students = json.load(file)

for student in students:

    print(student["name"])
```

---

# تحويل List إلى JSON

```python
numbers = [

    10,

    20,

    30
]

print(json.dumps(numbers))
```

---

# التعامل مع الأخطاء

إذا كان ملف JSON غير صالح:

```python
import json

try:

    with open("data.json") as file:

        data = json.load(file)

except json.JSONDecodeError:

    print("Invalid JSON File")
```

---

التعامل مع عدم وجود الملف:

```python
try:

    with open("student.json") as file:

        data = json.load(file)

except FileNotFoundError:

    print("File Not Found")
```

---

# مثال عملي

حفظ إعدادات برنامج.

```python
import json

settings = {

    "theme":"dark",

    "language":"ar",

    "font_size":18
}

with open(

    "settings.json",

    "w",

    encoding="utf-8"

) as file:

    json.dump(

        settings,

        file,

        indent=4,

        ensure_ascii=False
    )
```

---

قراءة الإعدادات

```python
with open(

    "settings.json",

    encoding="utf-8"

) as file:

    settings = json.load(file)

print(settings["theme"])
```

---

# مثال

حفظ بيانات الطلاب.

```python
students = [

    {

        "name":"Ahmed",

        "grade":90

    },

    {

        "name":"Sara",

        "grade":95

    }

]

with open(

    "students.json",

    "w",

    encoding="utf-8"

) as file:

    json.dump(

        students,

        file,

        indent=4,

        ensure_ascii=False
    )
```

---

# أخطاء شائعة

## استخدام load بدل loads

```python
json.load()
```

للقراءة من ملف.

---

```python
json.loads()
```

لتحويل نص JSON إلى كائنات Python.

---

## استخدام dump بدل dumps

```python
dump()
```

للكتابة داخل ملف.

---

```python
dumps()
```

لتحويل البيانات إلى نص JSON.

---

## نسيان ensure_ascii=False

قد تظهر الأحرف العربية بصيغة Unicode داخل الملف.

---

# أفضل الممارسات

✅ استخدم `indent=4` لسهولة القراءة.

---

✅ استخدم `ensure_ascii=False` مع النصوص العربية.

---

✅ تعامل مع الأخطاء مثل `JSONDecodeError`.

---

✅ استخدم JSON لحفظ الإعدادات والبيانات الصغيرة والمتوسطة.

---

# مشروع صغير

برنامج لإدارة قائمة مهام.

```python
import json

tasks = []

while True:

    task = input("Task (or exit): ")

    if task.lower() == "exit":
        break

    tasks.append(task)

with open(

    "tasks.json",

    "w",

    encoding="utf-8"

) as file:

    json.dump(

        tasks,

        file,

        indent=4,

        ensure_ascii=False
    )

print("Tasks Saved Successfully.")
```

---

# ملخص

- JSON هو أشهر تنسيق لتبادل البيانات.
- `dumps()` يحول كائنات Python إلى نص JSON.
- `loads()` يحول نص JSON إلى كائنات Python.
- `dump()` يكتب JSON داخل ملف.
- `load()` يقرأ JSON من ملف.
- استخدم `indent=4` و`ensure_ascii=False` للحصول على ملفات واضحة وتدعم العربية.

---

# Quiz

## السؤال الأول

ما اختصار JSON؟

A) Java Simple Object Network

B) JavaScript Object Notation

C) Java Structured Output Node

D) Java Source Object Name

✅ الإجابة: B

---

## السؤال الثاني

أي دالة تحول Dictionary إلى نص JSON؟

A)

```python
json.dump()
```

B)

```python
json.dumps()
```

C)

```python
json.load()
```

D)

```python
json.loads()
```

✅ الإجابة: B

---

## السؤال الثالث

أي دالة تقرأ JSON من ملف؟

A)

```python
json.load()
```

B)

```python
json.loads()
```

C)

```python
json.dump()
```

D)

```python
json.dumps()
```

✅ الإجابة: A

---

## السؤال الرابع

ما وظيفة `ensure_ascii=False`؟

A) ضغط الملف.

B) حذف المسافات.

C) الحفاظ على الأحرف غير الإنجليزية (مثل العربية) كما هي.

D) تشفير الملف.

✅ الإجابة: C

---

# Challenge

أنشئ نظامًا لإدارة الطلاب باستخدام JSON.

المطلوب:

1. إضافة طالب جديد.
2. حفظ جميع الطلاب داخل ملف `students.json`.
3. قراءة الملف عند تشغيل البرنامج.
4. البحث عن طالب بالاسم.
5. تعديل درجته.
6. حذف طالب.
7. إعادة حفظ الملف بعد كل تعديل.

**تحدٍ إضافي:** أضف تاريخ ووقت إنشاء كل طالب باستخدام مكتبة `datetime` واحفظه داخل ملف JSON بصيغة نصية مناسبة.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| JSON | تنسيق JSON |
| Serialize | تحويل كائن إلى JSON |
| Deserialize | تحويل JSON إلى كائن |
| dump | كتابة JSON إلى ملف |
| load | قراءة JSON من ملف |
| dumps | تحويل إلى نص JSON |
| loads | تحويل نص JSON إلى كائن |
| JSON Object | كائن JSON |
| JSON Array | مصفوفة JSON |
| Encoding | ترميز |

---

# الدرس القادم

**31 - Lambda Functions & Functional Programming**

ستتعلم كيفية كتابة الدوال المجهولة (Lambda Functions)، واستخدام `map()` و`filter()` و`reduce()`، والتعرف على أساسيات البرمجة الوظيفية (Functional Programming) في Python.