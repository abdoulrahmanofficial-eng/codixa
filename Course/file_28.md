# 28-Virtual-Environments-and-Pip.md

> مستوى الدرس: متوسط
>
> مدة القراءة: 90-120 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مشكلة تعارض إصدارات المكتبات.
- إنشاء Virtual Environment.
- تفعيل وإلغاء تفعيل البيئة الافتراضية.
- استخدام pip باحتراف.
- تثبيت وتحديث وإزالة المكتبات.
- إنشاء ملفات requirements.txt.
- مشاركة المشاريع مع الآخرين بسهولة.
- التعرف على أفضل الممارسات لإدارة المشاريع.

---

# مقدمة

تخيل أن لديك مشروعين.

المشروع الأول يحتاج:

```
Django 4.2
```

والمشروع الثاني يحتاج:

```
Django 5.2
```

إذا قمت بتثبيت إصدار واحد فقط على جهازك فقد يتوقف أحد المشروعين عن العمل.

لهذا السبب نستخدم:

```
Virtual Environment
```

---

# ما هي Virtual Environment؟

هي بيئة معزولة لكل مشروع.

تحتوي على:

- Python Interpreter
- المكتبات الخاصة بالمشروع

ولا تؤثر على المشاريع الأخرى.

---

# لماذا نستخدمها؟

بدون Virtual Environment

```
Python

↓

جميع المشاريع

↓

جميع المكتبات مختلطة
```

---

مع Virtual Environment

```
Project A

↓

venv

↓

Libraries
```

---

```
Project B

↓

venv

↓

Libraries
```

كل مشروع مستقل تمامًا.

---

# إنشاء مشروع

```
MyProject/
```

---

الدخول للمجلد

```bash
cd MyProject
```

---

# إنشاء البيئة

```bash
python -m venv venv
```

سيتم إنشاء مجلد:

```
venv/
```

---

# هيكل البيئة

```
MyProject/

    venv/

    main.py
```

---

# تفعيل البيئة

## Windows (PowerShell)

```powershell
venv\Scripts\Activate.ps1
```

---

## Windows (Command Prompt)

```cmd
venv\Scripts\activate
```

---

## macOS / Linux

```bash
source venv/bin/activate
```

---

بعد التفعيل ستلاحظ غالبًا ظهور اسم البيئة في بداية سطر الأوامر، مثل:

```
(venv)
```

---

# إلغاء التفعيل

```bash
deactivate
```

---

# التحقق من Python

```bash
python --version
```

---

# التحقق من pip

```bash
pip --version
```

---

# تثبيت مكتبة

```bash
pip install requests
```

---

تثبيت إصدار معين

```bash
pip install requests==2.32.3
```

---

تثبيت أحدث إصدار

```bash
pip install --upgrade requests
```

---

# إزالة مكتبة

```bash
pip uninstall requests
```

---

# عرض المكتبات المثبتة

```bash
pip list
```

---

# معلومات عن مكتبة

```bash
pip show requests
```

---

# حفظ المكتبات

```bash
pip freeze
```

يعرض جميع الحزم وإصداراتها.

---

لحفظها داخل ملف:

```bash
pip freeze > requirements.txt
```

---

سيكون الملف مثل:

```
requests==2.32.3

Flask==3.1.0
```

---

# تثبيت جميع المكتبات

```bash
pip install -r requirements.txt
```

---

# لماذا requirements.txt مهم؟

لأنه يسمح لأي شخص بتنزيل جميع المكتبات المطلوبة بنفس الإصدارات تقريبًا.

---

# تحديث pip

```bash
python -m pip install --upgrade pip
```

---

# إنشاء مشروع جديد

```
Project/

    venv/

    main.py

    requirements.txt
```

---

# تجاهل venv في Git

لا ترفع البيئة الافتراضية إلى GitHub.

أضف داخل:

```
.gitignore
```

السطر:

```
venv/
```

---

# تثبيت أكثر من مكتبة

```bash
pip install flask requests python-dotenv
```

---

# إزالة جميع المكتبات

يفضل إنشاء بيئة جديدة بدلًا من حذف كل مكتبة يدويًا.

---

# الفرق بين pip و Python

Python

↓

لغة البرمجة.

---

pip

↓

مدير الحزم.

---

# مثال عملي

إنشاء مشروع.

```bash
mkdir MyApp

cd MyApp

python -m venv venv
```

---

تفعيل البيئة.

```bash
venv\Scripts\activate
```

أو على macOS / Linux:

```bash
source venv/bin/activate
```

---

تثبيت مكتبة.

```bash
pip install requests
```

---

إنشاء الملف.

```python
import requests

response = requests.get("https://example.com")

print(response.status_code)
```

---

حفظ المكتبات.

```bash
pip freeze > requirements.txt
```

---

# أخطاء شائعة

## نسيان تفعيل البيئة

قد يؤدي إلى تثبيت المكتبات في Python العام بدلًا من البيئة الخاصة بالمشروع.

---

## رفع مجلد venv إلى GitHub

هذا يزيد حجم المشروع دون حاجة.

---

## نسيان requirements.txt

سيصعب على الآخرين تشغيل المشروع.

---

## تثبيت المكتبات عالميًا دائمًا

يفضل استخدام Virtual Environment لكل مشروع مستقل.

---

# أفضل الممارسات

✅ أنشئ Virtual Environment لكل مشروع.

---

✅ استخدم أسماء واضحة للمشاريع.

---

✅ حدث `requirements.txt` بعد إضافة أو تحديث المكتبات.

---

✅ أضف `venv/` إلى `.gitignore`.

---

# مشروع صغير

أنشئ مشروعًا باسم:

```
WeatherApp
```

الخطوات:

1. أنشئ Virtual Environment.
2. فعّل البيئة.
3. ثبّت مكتبة `requests`.
4. أنشئ ملف `main.py`.
5. استورد المكتبة داخل الملف.
6. أنشئ `requirements.txt`.
7. أضف `venv/` إلى `.gitignore`.

> لا تنسَ استخدام واجهة برمجة تطبيقات (API) مناسبة إذا أردت جلب بيانات الطقس الحقيقية.

---

# ملخص

- Virtual Environment تعزل كل مشروع عن غيره.
- يستخدم `pip` لإدارة المكتبات.
- استخدم `requirements.txt` لمشاركة تبعيات المشروع.
- لا ترفع مجلد `venv` إلى Git.
- احرص على تفعيل البيئة قبل تثبيت الحزم.

---

# Quiz

## السؤال الأول

ما الهدف الأساسي من Virtual Environment؟

A) زيادة سرعة Python.

B) عزل مكتبات كل مشروع عن الآخر.

C) ضغط الملفات.

D) حذف المكتبات.

✅ الإجابة: B

---

## السؤال الثاني

أي أمر ينشئ Virtual Environment؟

A)

```bash
pip install venv
```

B)

```bash
python -m venv venv
```

C)

```bash
venv create
```

D)

```bash
python install venv
```

✅ الإجابة: B

---

## السؤال الثالث

أي أمر ينشئ ملف `requirements.txt`؟

A)

```bash
pip list
```

B)

```bash
pip freeze > requirements.txt
```

C)

```bash
pip export
```

D)

```bash
pip save
```

✅ الإجابة: B

---

## السؤال الرابع

أي ملف يستخدم لتجاهل مجلد `venv` عند رفع المشروع إلى Git؟

A)

```
config.txt
```

B)

```
ignore.txt
```

C)

```
.gitignore
```

D)

```
settings.py
```

✅ الإجابة: C

---

# Challenge

أنشئ مشروع Python جديد من الصفر.

1. أنشئ مجلد المشروع.
2. أنشئ Virtual Environment.
3. فعّل البيئة.
4. ثبّت المكتبات التالية:
   - requests
   - python-dotenv
   - rich
5. أنشئ ملف `main.py`.
6. أنشئ `requirements.txt`.
7. أنشئ `.gitignore` وأضف إليه:
   - `venv/`
   - `__pycache__/`
   - `*.pyc`

**تحدٍ إضافي:** جرّب إنشاء البيئة مرة أخرى على جهاز آخر أو داخل مجلد جديد، ثم ثبّت جميع الحزم باستخدام:

```bash
pip install -r requirements.txt
```

وتأكد من أن المشروع يعمل بنفس الطريقة.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Virtual Environment | بيئة افتراضية |
| pip | مدير الحزم |
| Package | حزمة |
| Dependency | تبعية |
| requirements.txt | ملف التبعيات |
| Activate | تفعيل |
| Deactivate | إلغاء التفعيل |
| Upgrade | تحديث |
| Install | تثبيت |
| Uninstall | إزالة |

---

# الدرس القادم

**29 - Working with APIs**

ستتعلم كيفية التواصل مع واجهات برمجة التطبيقات (APIs)، وإرسال طلبات HTTP باستخدام مكتبة `requests`، واستقبال بيانات JSON وتحليلها، واستخدام APIs حقيقية لبناء تطبيقات مثل تطبيقات الطقس، وأسعار العملات، والذكاء الاصطناعي.