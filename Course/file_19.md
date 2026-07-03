# 19-Strings.md

> مستوى الدرس: مبتدئ → متوسط
>
> مدة القراءة: 75-90 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم ماهية النصوص (Strings).
- الوصول إلى الأحرف باستخدام الفهارس (Indexing).
- استخدام التقطيع (Slicing).
- استخدام أشهر دوال النصوص.
- البحث داخل النصوص.
- استبدال النصوص.
- تقسيم ودمج النصوص.
- تنسيق النصوص باستخدام f-Strings.
- حل مشكلات عملية تعتمد على معالجة النصوص.

---

# مقدمة

في الدروس السابقة استخدمنا النصوص كثيرًا.

مثل:

```python
name = "Ahmed"

print(name)
```

لكن النصوص في Python أقوى بكثير من مجرد تخزين كلمات.

يمكنك:

- استخراج حرف معين.
- استخراج جزء من النص.
- البحث داخل النص.
- استبدال الكلمات.
- تحويل الأحرف إلى كبيرة أو صغيرة.
- إزالة الفراغات.
- تقسيم النص إلى أجزاء.

كل ذلك باستخدام أدوات مدمجة داخل Python.

---

# ما هو String؟

الـ String هو سلسلة من الأحرف.

قد يحتوي على:

- حروف.
- أرقام.
- رموز.
- مسافات.

مثال:

```python
name = "Python"
```

---

# إنشاء النصوص

```python
name = "Ahmed"

city = 'Cairo'
```

الطريقتان صحيحتان.

---

# النص متعدد الأسطر

```python
message = """
Welcome

To

Python
"""
```

---

# طول النص

نستخدم:

```python
len()
```

مثال:

```python
text = "Python"

print(len(text))
```

الناتج:

```
6
```

---

# Indexing

كل حرف داخل النص له رقم يسمى Index.

```
P  y  t  h  o  n

0  1  2  3  4  5
```

---

# الوصول إلى حرف

```python
text = "Python"

print(text[0])
```

الناتج:

```
P
```

---

```python
print(text[3])
```

الناتج:

```
h
```

---

# الفهارس السالبة

يمكن العد من النهاية.

```
P  y  t  h  o  n

-6 -5 -4 -3 -2 -1
```

---

مثال:

```python
print(text[-1])
```

الناتج:

```
n
```

---

# Slicing

التقطيع يسمح باستخراج جزء من النص.

الصيغة:

```python
text[start:end]
```

---

مثال:

```python
text = "Programming"

print(text[0:7])
```

الناتج:

```
Program
```

---

مثال:

```python
print(text[3:8])
```

الناتج:

```
gramm
```

---

إذا حذفت البداية:

```python
print(text[:6])
```

الناتج:

```
Progra
```

---

إذا حذفت النهاية:

```python
print(text[5:])
```

الناتج:

```
amming
```

---

نسخ النص بالكامل

```python
print(text[:])
```

---

# Step

يمكن تخطي الأحرف.

```python
text = "Python"

print(text[::2])
```

الناتج:

```
Pto
```

---

عكس النص

```python
print(text[::-1])
```

الناتج:

```
nohtyP
```

---

# النصوص غير قابلة للتعديل

❌

```python
text = "Python"

text[0] = "J"
```

سيظهر خطأ.

لأن Strings في Python غير قابلة للتعديل (Immutable).

---

الحل:

```python
text = "J" + text[1:]

print(text)
```

الناتج:

```
Jython
```

---

# أشهر الدوال

---

## upper()

تحويل إلى أحرف كبيرة.

```python
text = "python"

print(text.upper())
```

الناتج:

```
PYTHON
```

---

## lower()

```python
text = "PYTHON"

print(text.lower())
```

---

## title()

```python
text = "python programming"

print(text.title())
```

الناتج:

```
Python Programming
```

---

## capitalize()

```python
text = "python"

print(text.capitalize())
```

الناتج:

```
Python
```

---

# إزالة الفراغات

```python
text = "   Python   "

print(text.strip())
```

---

إزالة من اليسار

```python
text.lstrip()
```

---

إزالة من اليمين

```python
text.rstrip()
```

---

# البحث

```python
text = "Python Programming"

print(text.find("Programming"))
```

الناتج:

```
7
```

إذا لم يجد النص:

```
-1
```

---

# التحقق

```python
text = "Python"

print("Py" in text)
```

الناتج:

```
True
```

---

```python
print("Java" in text)
```

الناتج:

```
False
```

---

# startswith()

```python
text = "Python"

print(text.startswith("Py"))
```

---

# endswith()

```python
print(text.endswith("on"))
```

---

# replace()

```python
text = "I love Java"

print(text.replace("Java", "Python"))
```

الناتج:

```
I love Python
```

---

# split()

تقسم النص.

```python
text = "Ahmed Ali Cairo"

print(text.split())
```

الناتج:

```python
['Ahmed', 'Ali', 'Cairo']
```

---

# join()

```python
words = ["Python", "is", "awesome"]

print(" ".join(words))
```

الناتج:

```
Python is awesome
```

---

# العد

```python
text = "banana"

print(text.count("a"))
```

الناتج:

```
3
```

---

# f-Strings

```python
name = "Ahmed"

age = 20

print(f"My name is {name}")
```

---

يمكن إجراء عمليات حسابية.

```python
a = 10

b = 5

print(f"Sum = {a+b}")
```

الناتج:

```
Sum = 15
```

---

# Escape Characters

```python
print("Hello\nWorld")
```

الناتج:

```
Hello

World
```

---

```python
print("Hello\tWorld")
```

---

```python
print("\"Python\"")
```

---

```python
print("\\")
```

---

# مثال عملي

حساب عدد الأحرف.

```python
text = input("Enter text: ")

print(len(text))
```

---

# مثال

معرفة هل البريد الإلكتروني صحيح.

```python
email = input("Email: ")

if "@" in email:

    print("Valid")

else:

    print("Invalid")
```

> **ملاحظة:** هذا مثال تعليمي مبسط فقط، والتحقق الحقيقي من البريد الإلكتروني يحتاج قواعد أكثر.

---

# مثال

عد الكلمات.

```python
sentence = input("Sentence: ")

words = sentence.split()

print(len(words))
```

---

# مثال

عكس النص.

```python
text = input("Text: ")

print(text[::-1])
```

---

# أخطاء شائعة

## نسيان أن الفهرسة تبدأ من صفر

```
Python

012345
```

---

## محاولة تعديل حرف مباشرة

```python
text[0]="A"
```

هذا غير مسموح.

---

## الخلط بين find و index

- `find()` تعيد `-1` إذا لم تجد النص.
- `index()` ترفع خطأ إذا لم تجد النص.

---

# أفضل الممارسات

✅ استخدم `strip()` عند استقبال مدخلات من المستخدم لإزالة المسافات الزائدة.

---

✅ استخدم `lower()` أو `casefold()` عند مقارنة النصوص إذا كنت لا تريد أن تؤثر حالة الأحرف على النتيجة.

مثال:

```python
if username.lower() == "admin":
    print("Welcome")
```

---

✅ استخدم `f-Strings` بدلًا من دمج النصوص باستخدام `+` عندما يكون ذلك مناسبًا.

---

# مشروع صغير

برنامج يحلل النص.

```python
text = input("Enter a sentence: ").strip()

print(f"Characters: {len(text)}")
print(f"Words: {len(text.split())}")
print(f"Uppercase: {text.upper()}")
print(f"Lowercase: {text.lower()}")
print(f"Reversed: {text[::-1]}")
```

---

# ملخص

- النصوص من أكثر أنواع البيانات استخدامًا.
- يمكن الوصول إلى الأحرف باستخدام الفهارس.
- يستخدم Slicing لاستخراج أجزاء من النص.
- النصوص غير قابلة للتعديل مباشرة.
- توفر Python عددًا كبيرًا من الدوال لمعالجة النصوص بسهولة.

---

# Quiz

## السؤال الأول

ما ناتج:

```python
text = "Python"

print(text[2])
```

A) P

B) t

C) h

D) y

✅ الإجابة: B

---

## السؤال الثاني

ما ناتج:

```python
text = "Python"

print(text[::-1])
```

A)

```
Python
```

B)

```
Pnohty
```

C)

```
nohtyP
```

D)

```
Error
```

✅ الإجابة: C

---

## السؤال الثالث

أي دالة تحول النص إلى أحرف كبيرة؟

A) lower()

B) title()

C) upper()

D) capitalize()

✅ الإجابة: C

---

## السؤال الرابع

ما ناتج:

```python
len("Python")
```

A) 5

B) 6

C) 7

D) 8

✅ الإجابة: B

---

# Challenge

أنشئ برنامجًا يطلب من المستخدم إدخال جملة، ثم يعرض:

1. عدد الأحرف.
2. عدد الكلمات.
3. أول حرف وآخر حرف.
4. الجملة بالكامل بأحرف كبيرة.
5. الجملة بالكامل بأحرف صغيرة.
6. الجملة مع إزالة الفراغات الزائدة.
7. الجملة معكوسة.
8. هل تحتوي على كلمة `"Python"` (بدون حساسية لحالة الأحرف).

**تحدٍ إضافي:** احسب عدد مرات ظهور كل حرف من حروف العلة الإنجليزية (`a, e, i, o, u`) داخل الجملة.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| String | نص |
| Character | حرف |
| Index | فهرس |
| Slicing | تقطيع |
| Immutable | غير قابل للتعديل |
| Escape Character | محرف هروب |
| Split | تقسيم |
| Join | دمج |
| Replace | استبدال |
| Search | بحث |

---

# الدرس القادم

**20 - Lists (القوائم)**

ستتعلم أحد أهم هياكل البيانات في Python، وكيفية تخزين عدد غير محدود من العناصر داخل قائمة، وإضافة العناصر وحذفها وتعديلها والبحث فيها، مع تطبيقات عملية كثيرة مثل إدارة الطلاب والمنتجات والمهام.