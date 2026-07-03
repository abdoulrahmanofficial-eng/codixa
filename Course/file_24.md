# 24-File-Handling.md

> مستوى الدرس: متوسط
>
> مدة القراءة: 100-120 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم كيفية التعامل مع الملفات في Python.
- إنشاء الملفات وفتحها.
- قراءة الملفات بعدة طرق.
- الكتابة داخل الملفات.
- إضافة بيانات دون حذف المحتوى السابق.
- استخدام `with` لإدارة الملفات.
- التعامل مع مسارات الملفات (Paths).
- استخدام مكتبة `pathlib`.
- التعامل مع ملفات CSV.
- إنشاء تطبيقات تعتمد على تخزين البيانات داخل الملفات.

---

# مقدمة

حتى الآن كانت جميع البيانات تختفي بمجرد إغلاق البرنامج.

مثال:

```python
name = input("Name: ")
```

بعد إغلاق البرنامج، سيتم فقدان الاسم.

لكن ماذا لو أردنا حفظ البيانات؟

مثل:

- بيانات الطلاب.
- كلمات الملاحظات.
- قائمة المهام.
- نتائج الامتحانات.

الحل هو **File Handling**.

---

# ما هو الملف؟

الملف (File) هو مكان لتخزين البيانات على القرص الصلب حتى بعد إغلاق البرنامج.

أمثلة:

```
students.txt

notes.txt

data.csv

config.json
```

---

# فتح ملف

نستخدم:

```python
open()
```

الصيغة:

```python
file = open("students.txt")
```

---

# أوضاع فتح الملفات

| الوضع | الوصف |
|--------|--------|
| `"r"` | قراءة الملف |
| `"w"` | كتابة (يحذف المحتوى القديم إذا كان الملف موجودًا) |
| `"a"` | إضافة في نهاية الملف |
| `"x"` | إنشاء ملف جديد فقط إذا لم يكن موجودًا |
| `"rb"` | قراءة ملف ثنائي (Binary) |
| `"wb"` | كتابة ملف ثنائي |

> إذا لم تحدد الوضع، فسيستخدم Python الوضع `"r"` افتراضيًا.

---

# قراءة الملف بالكامل

إذا كان الملف يحتوي على:

```
Ahmed

Sara

Ali
```

الكود:

```python
file = open("students.txt", "r")

content = file.read()

print(content)

file.close()
```

---

# لماذا نستخدم close()؟

لأن الملف يظل مفتوحًا حتى يتم إغلاقه.

لكن توجد طريقة أفضل.

---

# استخدام with

```python
with open("students.txt", "r") as file:

    content = file.read()

    print(content)
```

عند انتهاء الكتلة، يتم إغلاق الملف تلقائيًا حتى إذا حدث خطأ.

وهذه هي الطريقة الموصى بها دائمًا.

---

# قراءة سطر واحد

```python
with open("students.txt") as file:

    print(file.readline())
```

---

# قراءة عدة أسطر

```python
print(file.readlines())
```

الناتج:

```python
[
    "Ahmed\n",
    "Sara\n",
    "Ali\n"
]
```

---

# المرور على الملف

```python
with open("students.txt") as file:

    for line in file:

        print(line.strip())
```

استخدام `strip()` يزيل محرف السطر الجديد (`\n`).

---

# الكتابة داخل الملف

```python
with open("notes.txt", "w") as file:

    file.write("Hello Python")
```

إذا كان الملف موجودًا، سيتم حذف محتواه السابق واستبداله.

---

# كتابة عدة أسطر

```python
with open("notes.txt", "w") as file:

    file.write("Ahmed\n")

    file.write("Sara\n")

    file.write("Ali\n")
```

---

# الإضافة دون حذف المحتوى

```python
with open("notes.txt", "a") as file:

    file.write("Mona\n")
```

---

# إنشاء ملف جديد

```python
with open("new_file.txt", "x") as file:

    file.write("Welcome")
```

إذا كان الملف موجودًا بالفعل، سيظهر:

```
FileExistsError
```

---

# مؤشر الملف

بعد القراءة:

```python
file.read()
```

يصبح المؤشر في نهاية الملف.

إذا نفذت:

```python
file.read()
```

مرة أخرى، ستحصل على:

```
""
```

لأنك وصلت إلى نهاية الملف.

---

# seek()

للعودة إلى بداية الملف.

```python
file.seek(0)
```

---

# tell()

يعرض موضع المؤشر الحالي.

```python
print(file.tell())
```

---

# التعامل مع المسارات

يفضل استخدام `pathlib` بدلًا من كتابة المسارات يدويًا.

```python
from pathlib import Path

path = Path("students.txt")
```

---

# التحقق من وجود ملف

```python
from pathlib import Path

path = Path("students.txt")

print(path.exists())
```

---

# إنشاء مجلد

```python
from pathlib import Path

Path("data").mkdir(exist_ok=True)
```

---

# حذف ملف

```python
from pathlib import Path

path = Path("notes.txt")

if path.exists():
    path.unlink()
```

---

# قراءة ملف CSV

نفترض أن الملف:

```
name,grade

Ahmed,90

Sara,95
```

---

الكود:

```python
import csv

with open("students.csv", newline="", encoding="utf-8") as file:

    reader = csv.reader(file)

    for row in reader:

        print(row)
```

الناتج:

```python
['name', 'grade']

['Ahmed', '90']

['Sara', '95']
```

---

# كتابة CSV

```python
import csv

with open("students.csv", "w", newline="", encoding="utf-8") as file:

    writer = csv.writer(file)

    writer.writerow(["Name", "Grade"])

    writer.writerow(["Ahmed", 90])

    writer.writerow(["Sara", 95])
```

---

# التعامل مع الترميز (Encoding)

عند العمل مع اللغة العربية، استخدم غالبًا:

```python
encoding="utf-8"
```

مثال:

```python
with open("notes.txt", "r", encoding="utf-8") as file:

    print(file.read())
```

---

# مثال عملي

حفظ أسماء الطلاب.

```python
with open("students.txt", "a", encoding="utf-8") as file:

    while True:

        name = input("Student Name (or exit): ")

        if name.lower() == "exit":
            break

        file.write(name + "\n")
```

---

# مثال

قراءة جميع الأسماء.

```python
with open("students.txt", encoding="utf-8") as file:

    for name in file:

        print(name.strip())
```

---

# مثال

نسخ ملف.

```python
with open("source.txt", "r", encoding="utf-8") as source:

    with open("copy.txt", "w", encoding="utf-8") as destination:

        destination.write(source.read())
```

---

# أخطاء شائعة

## فتح ملف غير موجود

```python
open("test.txt")
```

قد يظهر:

```
FileNotFoundError
```

---

## نسيان إغلاق الملف

استخدم دائمًا:

```python
with open(...)
```

بدلًا من استدعاء `close()` يدويًا.

---

## استخدام `"w"` بدل `"a"`

سيؤدي إلى حذف جميع البيانات السابقة.

---

## تجاهل الترميز

قد تظهر أحرف غير صحيحة عند التعامل مع العربية إذا لم يكن الترميز مناسبًا.

---

# أفضل الممارسات

✅ استخدم `with` دائمًا.

---

✅ استخدم `pathlib` لإدارة المسارات.

---

✅ استخدم `encoding="utf-8"` عند التعامل مع النصوص.

---

✅ تحقق من وجود الملف قبل حذفه أو قراءته إذا كان ذلك مطلوبًا.

---

# مشروع صغير

برنامج لحفظ الملاحظات.

```python
from pathlib import Path

Path("notes.txt").touch(exist_ok=True)

with open("notes.txt", "a", encoding="utf-8") as file:

    note = input("Enter Note: ")

    file.write(note + "\n")

print("\nSaved Notes:\n")

with open("notes.txt", "r", encoding="utf-8") as file:

    print(file.read())
```

---

# ملخص

- تستخدم `open()` لفتح الملفات.
- استخدم `with` لإدارة الملفات بطريقة آمنة.
- استخدم `"r"` للقراءة، `"w"` للكتابة، `"a"` للإضافة، و`"x"` للإنشاء.
- استخدم `pathlib` للتعامل مع المسارات.
- استخدم `csv` للتعامل مع ملفات CSV.
- احرص على استخدام `encoding="utf-8"` عند التعامل مع النصوص العربية.

---

# Quiz

## السؤال الأول

أي وضع يستخدم لإضافة بيانات دون حذف المحتوى الحالي؟

A) `"r"`

B) `"w"`

C) `"a"`

D) `"x"`

✅ الإجابة: C

---

## السؤال الثاني

أي طريقة هي الأفضل لفتح الملفات؟

A)

```python
file = open(...)
```

B)

```python
with open(...) as file:
```

C)

```python
read()
```

D)

```python
file.open()
```

✅ الإجابة: B

---

## السؤال الثالث

أي مكتبة حديثة تستخدم لإدارة المسارات؟

A) os

B) sys

C) pathlib

D) random

✅ الإجابة: C

---

## السؤال الرابع

ما وظيفة `seek(0)`؟

A) حذف الملف.

B) الانتقال إلى نهاية الملف.

C) إعادة مؤشر القراءة إلى بداية الملف.

D) إغلاق الملف.

✅ الإجابة: C

---

# Challenge

أنشئ برنامجًا لإدارة سجل درجات الطلاب.

1. اسمح للمستخدم بإضافة طالب جديد (الاسم والدرجة).
2. احفظ البيانات داخل ملف CSV.
3. اقرأ جميع البيانات من الملف واعرضها في جدول بسيط.
4. احسب متوسط الدرجات.
5. اعرض أعلى درجة وأقل درجة.
6. تعامل مع الأخطاء مثل عدم وجود الملف أو إدخال درجات غير صحيحة باستخدام `try` و`except`.

**تحدٍ إضافي:** أضف إمكانية البحث عن طالب بالاسم وتعديل درجته ثم إعادة حفظ الملف.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| File | ملف |
| File Handling | التعامل مع الملفات |
| Read | قراءة |
| Write | كتابة |
| Append | إضافة |
| Path | مسار |
| Encoding | ترميز |
| CSV | ملف قيم مفصولة بفواصل |
| File Pointer | مؤشر الملف |
| Context Manager | مدير السياق (`with`) |

---

# الدرس القادم

**25 - Modules & Packages**

ستتعلم كيفية تقسيم البرامج الكبيرة إلى ملفات متعددة، واستيراد الوحدات (Modules)، وإنشاء الحزم (Packages)، واستخدام مكتبات Python القياسية مثل `math` و`random` و`datetime`، وهي خطوة أساسية لبناء مشاريع احترافية قابلة للتوسع.