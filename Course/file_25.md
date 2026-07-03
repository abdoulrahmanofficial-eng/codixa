# 25-Modules-and-Packages.md

> مستوى الدرس: متوسط
>
> مدة القراءة: 100-120 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم Modules و Packages.
- إنشاء Modules خاصة بك.
- استيراد الملفات بطرق مختلفة.
- استخدام `import` و `from`.
- استخدام `as`.
- فهم كيفية عمل Packages.
- استخدام أشهر مكتبات Python القياسية.
- تنظيم المشاريع الكبيرة بطريقة احترافية.

---

# مقدمة

كل البرامج التي كتبناها حتى الآن كانت داخل ملف واحد.

لكن ماذا لو أصبح المشروع يحتوي على:

- 20,000 سطر.
- 50 شاشة.
- مئات الدوال.

هل سنكتب كل شيء داخل ملف واحد؟

بالطبع لا.

لهذا تستخدم Python:

- Modules
- Packages

---

# ما هو Module؟

الـ Module هو ملف Python عادي يحتوي على:

- متغيرات.
- دوال.
- Classes.

امتداده:

```
.py
```

مثال:

```
calculator.py
```

---

# إنشاء Module

ملف:

```python
calculator.py
```

المحتوى:

```python
def add(a, b):

    return a + b


def subtract(a, b):

    return a - b
```

---

# استخدام Module

```python
import calculator

print(calculator.add(10, 5))
```

الناتج:

```
15
```

---

# import

الصيغة العامة:

```python
import module_name
```

---

مثال

```python
import math

print(math.sqrt(25))
```

---

# from

بدلاً من كتابة:

```python
math.sqrt()
```

يمكن كتابة:

```python
from math import sqrt

print(sqrt(25))
```

---

# استيراد أكثر من عنصر

```python
from math import sqrt, pi
```

---

# as

لتغيير الاسم.

```python
import math as m

print(m.pi)
```

---

أو

```python
from math import sqrt as square_root
```

---

# لماذا نستخدم as؟

- اختصار الاسم.
- تجنب تعارض الأسماء.
- جعل الكود أوضح.

---

# import *

```python
from math import *
```

هذا يجعل جميع عناصر المكتبة متاحة مباشرة.

لكن لا يُنصح به في المشاريع الحقيقية لأنه قد يسبب تعارضًا بين الأسماء ويجعل مصدر الدوال غير واضح.

---

# __name__

كل ملف Python يحتوي على متغير خاص.

```python
print(__name__)
```

---

إذا شغلت الملف مباشرة:

```
__main__
```

أما إذا تم استيراده:

```
اسم الملف
```

---

# if __name__ == "__main__"

تستخدم لتشغيل جزء معين فقط عند تشغيل الملف مباشرة.

```python
def hello():

    print("Hello")


if __name__ == "__main__":

    hello()
```

---

# ما هي Package؟

هي مجلد يحتوي على Modules مترابطة.

مثال:

```
project/

    utils/

        math_tools.py

        text_tools.py
```

في الإصدارات الحديثة من Python، يكفي وجود المجلد في المسار المناسب ليُستخدم كحزمة، لكن قد تجد ملف `__init__.py` في كثير من المشاريع لتنظيم الحزمة أو تهيئتها.

---

# الاستيراد من Package

```python
from utils.math_tools import add
```

---

# تنظيم مشروع

```
project/

    main.py

    database.py

    users.py

    products.py

    auth.py
```

كل ملف مسؤول عن جزء محدد من المشروع.

---

# أشهر المكتبات القياسية

---

## math

للعمليات الرياضية.

```python
import math

print(math.pi)
```

---

```python
print(math.sqrt(64))
```

---

```python
print(math.factorial(5))
```

---

## random

للأرقام العشوائية.

```python
import random

print(random.randint(1,10))
```

---

اختيار عنصر عشوائي.

```python
colors = ["Red","Blue","Green"]

print(random.choice(colors))
```

---

خلط القائمة.

```python
random.shuffle(colors)
```

---

## datetime

للتاريخ والوقت.

```python
from datetime import datetime

now = datetime.now()

print(now)
```

---

عرض السنة.

```python
print(now.year)
```

---

عرض الشهر.

```python
print(now.month)
```

---

عرض اليوم.

```python
print(now.day)
```

---

تنسيق التاريخ.

```python
print(now.strftime("%Y-%m-%d"))
```

---

## os

للتعامل مع نظام التشغيل.

```python
import os

print(os.getcwd())
```

يعرض مجلد العمل الحالي.

---

## pathlib

الطريقة الحديثة للتعامل مع الملفات والمسارات.

```python
from pathlib import Path

path = Path("notes.txt")

print(path.exists())
```

---

## statistics

لإجراء عمليات إحصائية بسيطة.

```python
import statistics

numbers = [10,20,30]

print(statistics.mean(numbers))
```

---

## time

للوقت والانتظار.

```python
import time

print("Start")

time.sleep(2)

print("End")
```

---

# تثبيت مكتبات خارجية

المكتبات القياسية تأتي مع Python.

أما المكتبات الخارجية فتثبت باستخدام:

```bash
pip install package_name
```

مثال:

```bash
pip install requests
```

---

# معرفة المكتبات المثبتة

```bash
pip list
```

---

# مثال عملي

إنشاء آلة حاسبة داخل Module.

ملف:

```python
calculator.py
```

```python
def add(a,b):

    return a+b


def multiply(a,b):

    return a*b
```

---

الملف الرئيسي:

```python
import calculator

print(calculator.add(10,20))

print(calculator.multiply(3,4))
```

---

# مثال

اختيار طالب عشوائي.

```python
import random

students = [

    "Ahmed",

    "Sara",

    "Ali",

    "Mona"
]

print(random.choice(students))
```

---

# أخطاء شائعة

## نسيان اسم Module الصحيح

```python
import maths
```

بدلًا من:

```python
import math
```

---

## استيراد ملف غير موجود

سيظهر:

```
ModuleNotFoundError
```

---

## إنشاء ملف باسم مكتبة قياسية

إذا أنشأت ملفًا باسم:

```
random.py
```

فقد يمنع ذلك استيراد مكتبة `random` القياسية بشكل صحيح.

---

# أفضل الممارسات

✅ قسم المشروع إلى Modules صغيرة لكل مسؤولية.

---

✅ استخدم أسماء واضحة للملفات.

---

✅ تجنب `import *`.

---

✅ ضع كود التشغيل داخل:

```python
if __name__ == "__main__":
```

عندما يكون ذلك مناسبًا.

---

# مشروع صغير

هيكل مشروع بسيط.

```
project/

    main.py

    calculator.py
```

---

ملف:

```python
calculator.py
```

```python
def add(a,b):

    return a+b


def subtract(a,b):

    return a-b
```

---

ملف:

```python
main.py
```

```python
import calculator

print(calculator.add(10,5))

print(calculator.subtract(10,5))
```

---

# ملخص

- Module هو ملف Python يحتوي على كود قابل لإعادة الاستخدام.
- Package هي مجموعة Modules داخل مجلد.
- يمكن الاستيراد باستخدام `import` أو `from`.
- تستخدم `as` لتغيير الاسم.
- توفر Python مكتبات قياسية قوية مثل `math` و`random` و`datetime`.
- تقسيم المشروع إلى ملفات متعددة يجعل الكود أكثر تنظيمًا وسهولة في الصيانة.

---

# Quiz

## السؤال الأول

ما هو Module؟

A) قاعدة بيانات.

B) ملف Python يحتوي على كود.

C) مجلد.

D) متغير.

✅ الإجابة: B

---

## السؤال الثاني

أي كلمة تستخدم لاستيراد مكتبة؟

A) include

B) use

C) import

D) package

✅ الإجابة: C

---

## السؤال الثالث

أي مكتبة تستخدم لتوليد أرقام عشوائية؟

A) math

B) random

C) time

D) os

✅ الإجابة: B

---

## السؤال الرابع

ما وظيفة `as`؟

A) حذف المكتبة.

B) تغيير اسم العنصر المستورد داخل الكود.

C) تثبيت مكتبة.

D) إنشاء Package.

✅ الإجابة: B

---

# Challenge

أنشئ مشروعًا يتكون من ثلاثة ملفات:

- `calculator.py`
- `student.py`
- `main.py`

المطلوب:

1. أنشئ دوال للجمع والطرح داخل `calculator.py`.
2. أنشئ دالة لطباعة بيانات طالب داخل `student.py`.
3. استورد الدوال في `main.py` واستخدمها.
4. استخدم مكتبة `random` لاختيار طالب عشوائي من قائمة.
5. استخدم `datetime` لطباعة تاريخ ووقت تشغيل البرنامج.

**تحدٍ إضافي:** أعد تنظيم المشروع داخل Package باسم `utils`، ثم عدّل أوامر الاستيراد بحيث تعمل من داخل الحزمة.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Module | وحدة (ملف Python) |
| Package | حزمة |
| Import | استيراد |
| Alias | اسم مستعار |
| Standard Library | المكتبة القياسية |
| Third-Party Library | مكتبة خارجية |
| Namespace | نطاق الأسماء |
| Entry Point | نقطة بدء التنفيذ |
| Dependency | اعتماد / تبعية |
| Reusable Code | كود قابل لإعادة الاستخدام |

---

# الدرس القادم

**26 - Object-Oriented Programming (OOP) - Part 1**

ستبدأ في تعلم البرمجة كائنية التوجه، وستتعرف على مفاهيم **Class** و**Object** و**Attributes** و**Methods**، وكيفية تصميم كائنات تمثل العالم الحقيقي، وهي من أهم المهارات المطلوبة في تطوير البرمجيات الحديثة.