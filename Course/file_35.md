# 35-File-Handling-Advanced.md

> مستوى الدرس: متقدم
>
> مدة القراءة: 170-210 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- التعامل مع الملفات بطريقة احترافية.
- استخدام مكتبة `pathlib`.
- استخدام مكتبة `shutil`.
- قراءة الملفات الضخمة بكفاءة.
- التعامل مع الملفات الثنائية.
- نسخ ونقل وحذف الملفات.
- إنشاء المجلدات وإدارتها.
- البحث داخل الملفات.
- إنشاء أدوات لإدارة الملفات.

---

# مقدمة

في الدروس السابقة تعلمنا:

- فتح الملفات.
- قراءة الملفات.
- كتابة الملفات.

لكن في المشاريع الحقيقية نحتاج إلى:

- التعامل مع آلاف الملفات.
- نقل الملفات.
- نسخ المجلدات.
- البحث داخل الملفات.
- قراءة ملفات كبيرة جدًا.

لهذا سنستخدم الأدوات الاحترافية الموجودة داخل Python.

---

# pathlib

تعتبر أفضل طريقة حديثة للتعامل مع المسارات.

```python
from pathlib import Path
```

---

# إنشاء Path

```python
from pathlib import Path

path = Path("data.txt")

print(path)
```

---

# معرفة وجود الملف

```python
from pathlib import Path

path = Path("data.txt")

print(path.exists())
```

---

# هل هو ملف؟

```python
print(path.is_file())
```

---

# هل هو مجلد؟

```python
print(path.is_dir())
```

---

# اسم الملف

```python
print(path.name)
```

الناتج

```
data.txt
```

---

# اسم الملف بدون الامتداد

```python
print(path.stem)
```

---

# الامتداد

```python
print(path.suffix)
```

---

# المسار الكامل

```python
print(path.resolve())
```

---

# إنشاء مجلد

```python
from pathlib import Path

Path("files").mkdir()
```

---

إذا كان موجودًا بالفعل

```python
Path("files").mkdir(exist_ok=True)
```

---

# إنشاء مجلدات متداخلة

```python
Path("a/b/c").mkdir(

    parents=True,

    exist_ok=True
)
```

---

# إنشاء ملف

```python
Path("notes.txt").touch()
```

---

# حذف ملف

```python
Path("notes.txt").unlink()
```

---

# حذف مجلد فارغ

```python
Path("folder").rmdir()
```

---

# قراءة النص

```python
text = Path("data.txt").read_text(

    encoding="utf-8"
)

print(text)
```

---

# كتابة النص

```python
Path("data.txt").write_text(

    "Hello",

    encoding="utf-8"
)
```

---

# البحث عن الملفات

```python
from pathlib import Path

for file in Path(".").iterdir():

    print(file)
```

---

# البحث حسب الامتداد

```python
for file in Path(".").glob("*.py"):

    print(file)
```

---

# البحث داخل جميع المجلدات

```python
for file in Path(".").rglob("*.py"):

    print(file)
```

---

# shutil

مكتبة لإدارة الملفات.

```python
import shutil
```

---

# نسخ ملف

```python
shutil.copy(

    "file.txt",

    "backup.txt"
)
```

---

# نسخ مع البيانات الوصفية

```python
shutil.copy2(

    "file.txt",

    "backup.txt"
)
```

---

# نقل ملف

```python
shutil.move(

    "file.txt",

    "folder/file.txt"
)
```

---

# حذف مجلد بالكامل

```python
shutil.rmtree("folder")
```

> استخدم هذا الأمر بحذر لأنه يحذف المجلد وجميع محتوياته.

---

# نسخ مجلد

```python
shutil.copytree(

    "project",

    "backup_project"
)
```

---

# قراءة الملفات الكبيرة

بدلاً من:

```python
content = file.read()
```

يمكن القراءة على أجزاء.

```python
with open(

    "big.txt",

    encoding="utf-8"

) as file:

    for line in file:

        print(line)
```

---

# القراءة على دفعات

```python
with open(

    "big.bin",

    "rb"

) as file:

    while chunk := file.read(4096):

        print(len(chunk))
```

---

# Binary Files

فتح ملف ثنائي.

```python
with open(

    "image.png",

    "rb"

) as file:

    data = file.read()
```

---

الكتابة

```python
with open(

    "copy.png",

    "wb"

) as file:

    file.write(data)
```

---

# البحث داخل ملف

```python
with open(

    "notes.txt",

    encoding="utf-8"

) as file:

    for number, line in enumerate(file, start=1):

        if "Python" in line:

            print(number, line.strip())
```

---

# حجم الملف

```python
from pathlib import Path

path = Path("video.mp4")

print(path.stat().st_size)
```

---

# تعديل اسم الملف

```python
Path("old.txt").rename(

    "new.txt"
)
```

---

# تغيير الامتداد

```python
path = Path("notes.txt")

path.rename(

    path.with_suffix(".md")
)
```

---

# ضغط مجلد

```python
import shutil

shutil.make_archive(

    "backup",

    "zip",

    "project"
)
```

---

# فك الضغط

```python
shutil.unpack_archive(

    "backup.zip",

    "output"
)
```

---

# مثال عملي

نسخ جميع ملفات Python.

```python
from pathlib import Path

import shutil

Path("backup").mkdir(

    exist_ok=True
)

for file in Path(".").glob("*.py"):

    shutil.copy2(

        file,

        Path("backup") / file.name
    )
```

---

# مثال

حساب عدد الأسطر.

```python
count = 0

with open(

    "main.py",

    encoding="utf-8"

) as file:

    for _ in file:

        count += 1

print(count)
```

---

# أخطاء شائعة

## استخدام read()

مع الملفات الضخمة قد يستهلك ذاكرة كبيرة.

---

## حذف مجلد بدون التأكد

```python
shutil.rmtree()
```

لا يمكن التراجع عنه بسهولة.

---

## نسيان إغلاق الملف

استخدم دائمًا:

```python
with open(...)
```

لضمان إغلاق الملف حتى في حالة حدوث خطأ.

---

# أفضل الممارسات

✅ استخدم `pathlib` بدلًا من التعامل مع المسارات كسلاسل نصية.

---

✅ اقرأ الملفات الكبيرة سطرًا بسطر أو على دفعات.

---

✅ استخدم `copy2()` إذا كنت تريد الحفاظ على البيانات الوصفية للملف.

---

✅ أنشئ نسخًا احتياطية قبل تنفيذ عمليات حذف جماعية.

---

# مشروع صغير

برنامج يبحث عن جميع ملفات Python داخل المشروع.

```python
from pathlib import Path

files = Path(".").rglob("*.py")

for file in files:

    print(file)
```

---

# مشروع احترافي

برنامج نسخ احتياطي.

المطلوب:

1. إنشاء مجلد Backup.
2. نسخ جميع ملفات المشروع.
3. ضغطها داخل ملف ZIP.
4. إضافة تاريخ النسخة الاحتياطية إلى اسم الملف.
5. عرض رسالة نجاح عند الانتهاء.

---

# ملخص

- `pathlib` هي الطريقة الحديثة للتعامل مع الملفات والمسارات.
- `shutil` توفر أدوات قوية للنسخ والنقل والحذف والأرشفة.
- استخدم القراءة على دفعات مع الملفات الكبيرة.
- استخدم أوضاع `rb` و`wb` مع الملفات الثنائية.
- احرص على استخدام `with open()` لإدارة الملفات بأمان.

---

# Quiz

## السؤال الأول

أي مكتبة تعتبر الطريقة الحديثة للتعامل مع المسارات؟

A)

```python
os
```

B)

```python
pathlib
```

C)

```python
sys
```

D)

```python
glob
```

✅ الإجابة: B

---

## السؤال الثاني

أي دالة تنسخ الملف مع الحفاظ على البيانات الوصفية؟

A)

```python
copy()
```

B)

```python
copy2()
```

C)

```python
move()
```

D)

```python
clone()
```

✅ الإجابة: B

---

## السؤال الثالث

أي وضع يستخدم لقراءة الملفات الثنائية؟

A)

```python
r
```

B)

```python
rb
```

C)

```python
rt
```

D)

```python
rw
```

✅ الإجابة: B

---

## السؤال الرابع

أي دالة تبحث عن الملفات داخل جميع المجلدات الفرعية؟

A)

```python
iterdir()
```

B)

```python
glob()
```

C)

```python
rglob()
```

D)

```python
walk()
```

✅ الإجابة: C

---

# Challenge

أنشئ برنامجًا لإدارة الملفات.

المطلوب:

1. البحث عن جميع ملفات `.txt` داخل مجلد معين.
2. نسخها إلى مجلد `Backup`.
3. إعادة تسمية كل ملف بإضافة التاريخ الحالي إلى اسمه.
4. ضغط مجلد `Backup` داخل ملف ZIP.
5. عرض تقرير بعدد الملفات التي تمت معالجتها وإجمالي حجمها.

**تحدٍ إضافي:** تجاهل الملفات التي يزيد حجمها عن 100 ميجابايت، وسجل أسماء الملفات التي تم تجاهلها داخل ملف `log.txt`.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Path | مسار |
| Directory | مجلد |
| File | ملف |
| Binary File | ملف ثنائي |
| Text File | ملف نصي |
| Copy | نسخ |
| Move | نقل |
| Archive | أرشفة |
| ZIP Archive | أرشيف مضغوط |
| Metadata | بيانات وصفية |

---

# الدرس القادم

**36 - Multithreading & Multiprocessing**

ستتعلم كيفية تشغيل أكثر من مهمة في الوقت نفسه باستخدام **Threads** و**Processes**، ومعرفة الفرق بينهما، وتأثير **GIL**، واختيار الحل المناسب لتحسين أداء تطبيقات Python.