# 34-Modules-and-Packages-Advanced.md

> مستوى الدرس: متقدم
>
> مدة القراءة: 150-190 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم كيفية تنظيم المشاريع الكبيرة.
- إنشاء Modules خاصة بك.
- إنشاء Packages احترافية.
- فهم آلية عمل `import`.
- استخدام `__name__`.
- استخدام `__all__`.
- استخدام Relative Imports و Absolute Imports.
- التعرف على `__init__.py`.
- بناء مشروع Python منظم وقابل للتطوير.

---

# مقدمة

في البرامج الصغيرة يمكن وضع كل شيء داخل ملف واحد.

لكن ماذا لو أصبح المشروع يحتوي على:

- 100 ملف.
- 500 Class.
- آلاف الدوال.

هل سنضعها جميعًا داخل ملف واحد؟

بالطبع لا.

لهذا نستخدم:

- Modules
- Packages

---

# ما هو Module؟

أي ملف Python ينتهي بـ:

```
.py
```

يعتبر Module.

مثال

```
math_utils.py
```

---

محتوى الملف

```python
def add(a,b):

    return a+b


def subtract(a,b):

    return a-b
```

---

الاستخدام

```python
import math_utils

print(

    math_utils.add(5,3)
)
```

---

# استيراد دالة

```python
from math_utils import add

print(add(10,20))
```

---

# استيراد أكثر من عنصر

```python
from math_utils import add, subtract
```

---

# استيراد كل شيء

```python
from math_utils import *
```

⚠️ لا ينصح بهذه الطريقة في المشاريع الكبيرة لأنها قد تسبب تعارضًا في الأسماء.

---

# Alias

```python
import math_utils as mu

print(mu.add(5,5))
```

---

# ما هو Package؟

هو مجلد يحتوي على مجموعة Modules مرتبطة ببعضها.

مثال

```
project/

    utils/

        math_utils.py

        string_utils.py
```

---

# __init__.py

قد يحتوي Package على ملف:

```
__init__.py
```

يستخدم لتهيئة الـ Package عند استيرادها، ويمكن أن يحدد ما يتم تصديره أو ينفذ كودًا تهيئيًا إذا لزم الأمر.

> في الإصدارات الحديثة من Python يمكن إنشاء بعض أنواع Packages بدون هذا الملف، لكن وجوده ما زال شائعًا ومفيدًا لتنظيم المشاريع.

---

# استيراد من Package

```python
from utils.math_utils import add

print(add(5,5))
```

---

# Absolute Import

```python
from project.utils.math_utils import add
```

يعتمد على المسار الكامل للحزمة.

---

# Relative Import

داخل Package نفسها:

```python
from .math_utils import add
```

---

الانتقال إلى Package الأب:

```python
from ..database import connection
```

---

# __name__

كل ملف Python يحتوي على متغير خاص:

```python
__name__
```

---

إذا تم تشغيل الملف مباشرة:

```python
print(__name__)
```

الناتج:

```
__main__
```

---

إذا تم استيراده من ملف آخر:

```python
math_utils
```

(أو اسم الـ Module حسب مكانها داخل المشروع).

---

# الاستخدام الشهير

```python
if __name__ == "__main__":

    print("Running")
```

يُنفذ هذا الجزء فقط إذا كان الملف هو نقطة تشغيل البرنامج، وليس عند استيراده.

---

# __all__

يمكن تحديد العناصر التي سيتم استيرادها عند استخدام:

```python
from module import *
```

---

مثال

```python
__all__ = [

    "add",

    "subtract"
]
```

---

# dir()

لعرض جميع العناصر داخل Module.

```python
import math

print(dir(math))
```

---

# help()

لعرض التوثيق.

```python
import math

help(math.sqrt)
```

---

# إنشاء Package كاملة

```
shop/

    __init__.py

    products.py

    customers.py

    orders.py
```

---

الاستخدام

```python
from shop.products import Product
```

---

# مثال عملي

ملف

```
calculator.py
```

```python
def multiply(a,b):

    return a*b
```

---

ملف

```
main.py
```

```python
from calculator import multiply

print(

    multiply(5,6)
)
```

---

# تنظيم مشروع

```
project/

    app/

    models/

    services/

    utils/

    tests/

    main.py
```

---

# إعادة تحميل Module

إذا عدلت Module أثناء جلسة Python التفاعلية فقد تحتاج إلى إعادة تحميلها.

```python
import importlib

import math_utils

importlib.reload(math_utils)
```

---

# البحث عن Modules

```python
import sys

print(sys.path)
```

يعرض المسارات التي يبحث فيها Python عن الـ Modules.

---

# إنشاء مكتبة خاصة

يمكنك إنشاء Package خاصة بك واستخدامها في عدة مشاريع.

مثال

```
my_library/

    __init__.py

    helpers.py

    validators.py
```

---

# أخطاء شائعة

## Circular Imports

إذا قام ملف A باستيراد B، وB يستورد A، فقد يحدث خطأ أو سلوك غير متوقع.

يفضل إعادة تنظيم الكود لتجنب ذلك.

---

## استخدام import *

يجعل الكود أقل وضوحًا وقد يسبب تعارضًا في الأسماء.

---

## وضع كل شيء في ملف واحد

يصعب صيانة المشروع مع نموه.

---

# أفضل الممارسات

✅ قسم المشروع حسب المسؤوليات.

---

✅ استخدم أسماء واضحة للـ Modules.

---

✅ استخدم Absolute Imports في أغلب المشاريع الكبيرة.

---

✅ اجعل كل Module مسؤولًا عن وظيفة محددة.

---

# مشروع صغير

```
school/

    __init__.py

    student.py

    teacher.py

    course.py

    main.py
```

---

ملف

```
student.py
```

```python
class Student:

    def __init__(self,name):

        self.name = name
```

---

ملف

```
main.py
```

```python
from student import Student

student = Student("Ahmed")

print(student.name)
```

---

# مشروع احترافي

```
ecommerce/

    app/

    database/

    api/

    models/

    services/

    utils/

    tests/

    config.py

    main.py
```

هذا النوع من الهيكلة يسهل تطوير المشروع وصيانته مع زيادة حجمه.

---

# ملخص

- كل ملف Python هو Module.
- Package هي مجموعة من الـ Modules داخل مجلد واحد.
- يستخدم `import` لاستيراد الوحدات.
- يساعد `if __name__ == "__main__":` على فصل كود التشغيل عن الكود القابل للاستيراد.
- استخدم تنظيمًا واضحًا للمجلدات والملفات في المشاريع الكبيرة.

---

# Quiz

## السؤال الأول

ما هو Module؟

A) قاعدة بيانات.

B) ملف Python.

C) Class.

D) Loop.

✅ الإجابة: B

---

## السؤال الثاني

ما هو Package؟

A) متغير.

B) مجلد يحتوي على Modules.

C) دالة.

D) مكتبة خارجية فقط.

✅ الإجابة: B

---

## السؤال الثالث

ما قيمة `__name__` عند تشغيل الملف مباشرة؟

A)

```
main
```

B)

```
Python
```

C)

```
__main__
```

D)

```
module
```

✅ الإجابة: C

---

## السؤال الرابع

أي نوع من الاستيراد يستخدم المسار الكامل؟

A) Relative Import

B) Absolute Import

C) Dynamic Import

D) Local Import

✅ الإجابة: B

---

# Challenge

أنشئ مشروعًا منظمًا لإدارة مكتبة.

الهيكل:

```
library/

    models/

    services/

    utils/

    data/

    main.py
```

المطلوب:

1. أنشئ Modules للكتب، والأعضاء، وعمليات الاستعارة.
2. استخدم Absolute Imports بين الوحدات.
3. أضف `__init__.py` حيث يلزم.
4. اجعل `main.py` نقطة تشغيل المشروع.
5. استخدم `if __name__ == "__main__":` لتشغيل البرنامج.

**تحدٍ إضافي:** أنشئ Package باسم `validators` تحتوي على دوال للتحقق من صحة بيانات الكتب والأعضاء، ثم أعد استخدامها في أكثر من Module.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Module | وحدة برمجية |
| Package | حزمة |
| Import | استيراد |
| Absolute Import | استيراد مطلق |
| Relative Import | استيراد نسبي |
| `__init__.py` | ملف تهيئة الحزمة |
| `__name__` | اسم الوحدة الحالية |
| `__main__` | نقطة تشغيل البرنامج |
| `__all__` | العناصر المصدرة |
| Namespace | نطاق الأسماء |

---

# الدرس القادم

**35 - File Handling (Advanced)**

ستتعلم تقنيات متقدمة للتعامل مع الملفات، مثل قراءة الملفات الضخمة بكفاءة، وإدارة الملفات والمجلدات باستخدام `pathlib` و`shutil`، والبحث داخل الملفات، والتعامل مع الملفات الثنائية (Binary Files)، وبناء أدوات احترافية لإدارة الملفات.