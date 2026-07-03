# 16-Conditional-Statements.md

> مستوى الدرس: مبتدئ
>
> مدة القراءة: 50-60 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم معنى الجمل الشرطية.
- استخدام `if`.
- استخدام `else`.
- استخدام `elif`.
- كتابة شروط مركبة باستخدام `and` و `or`.
- إنشاء برامج تتخذ قرارات بناءً على مدخلات المستخدم.
- تجنب أشهر الأخطاء المتعلقة بالشروط.

---

# مقدمة

حتى الآن كانت برامجنا تنفذ جميع الأسطر بالتسلسل.

لكن ماذا لو أردنا أن ينفذ البرنامج جزءًا معينًا فقط عند تحقق شرط؟

مثلًا:

- إذا كانت درجة الطالب أكبر من أو تساوي 50 → اعرض "ناجح".
- إذا كان عمر المستخدم أقل من 18 → اعرض "غير مسموح".
- إذا كانت كلمة المرور صحيحة → اسمح بالدخول.

هنا نستخدم **الجمل الشرطية (Conditional Statements)**.

---

# ما هي الجملة الشرطية؟

الجملة الشرطية هي وسيلة تجعل البرنامج يختار بين أكثر من مسار حسب نتيجة شرط معين.

إذا كان الشرط صحيحًا (`True`) ينفذ جزءًا من الكود.

وإذا كان خاطئًا (`False`) ينتقل إلى جزء آخر.

---

# الصيغة الأساسية لـ if

```python
if condition:
    # Code
```

لاحظ وجود النقطتين `:` بعد الشرط.

---

# أول مثال

```python
age = 20

if age >= 18:
    print("Access Granted")
```

الناتج:

```
Access Granted
```

لأن الشرط صحيح.

---

# عندما يكون الشرط غير صحيح

```python
age = 15

if age >= 18:
    print("Access Granted")
```

لن يظهر أي شيء.

لأن الشرط لم يتحقق.

---

# استخدام else

إذا أردت تنفيذ كود عندما يكون الشرط غير صحيح، استخدم `else`.

```python
age = 15

if age >= 18:
    print("Access Granted")
else:
    print("Access Denied")
```

الناتج:

```
Access Denied
```

---

# مخطط التنفيذ

```
        هل الشرط صحيح؟
              │
      ┌───────┴────────┐
      │                │
    نعم               لا
      │                │
      ▼                ▼
نفذ كود if      نفذ كود else
```

---

# مثال عملي

```python
password = input("Enter Password: ")

if password == "1234":
    print("Login Successful")
else:
    print("Wrong Password")
```

---

# استخدام elif

أحيانًا يكون لدينا أكثر من احتمال.

مثال:

```python
score = int(input("Enter Score: "))

if score >= 90:
    print("Excellent")

elif score >= 75:
    print("Very Good")

elif score >= 60:
    print("Good")

else:
    print("Failed")
```

---

# كيف يعمل elif؟

يفحص الشروط بالترتيب.

بمجرد أن يجد أول شرط صحيح، يتوقف ولا يفحص الشروط التالية.

---

# مثال

إذا كانت الدرجة:

```
95
```

سيطبع:

```
Excellent
```

ولن يفحص باقي الشروط.

---

# مثال آخر

برنامج لمعرفة إشارة الرقم.

```python
number = int(input("Enter Number: "))

if number > 0:
    print("Positive")

elif number < 0:
    print("Negative")

else:
    print("Zero")
```

---

# استخدام أكثر من شرط

يمكن دمج الشروط باستخدام `and`.

```python
age = 20

if age >= 18 and age <= 30:
    print("Allowed")
```

يجب أن يكون الشرطان صحيحين.

---

# استخدام or

```python
day = input("Day: ")

if day == "Friday" or day == "Saturday":
    print("Weekend")
```

يكفي أن يتحقق أحد الشرطين.

---

# استخدام not

```python
is_logged_in = False

if not is_logged_in:
    print("Please Login")
```

---

# المقارنة بين النصوص

```python
name = input("Enter Name: ")

if name == "Ahmed":
    print("Welcome Ahmed")
```

لاحظ أن المقارنة حساسة لحالة الأحرف.

```text
Ahmed
```

ليست مثل:

```text
ahmed
```

---

# الشروط المتداخلة (Nested If)

يمكن وضع شرط داخل شرط آخر.

```python
age = int(input("Age: "))

has_id = True

if age >= 18:

    if has_id:
        print("Access Granted")
    else:
        print("You need an ID")

else:
    print("You are under 18")
```

يفضل عدم الإكثار من التداخل إذا كان يمكن تبسيط الشروط.

---

# مشروع 1

برنامج يحدد نجاح الطالب.

```python
score = int(input("Score: "))

if score >= 50:
    print("Passed")
else:
    print("Failed")
```

---

# مشروع 2

برنامج يحسب خصمًا.

```python
price = float(input("Price: "))

if price >= 1000:
    discount = price * 0.10
else:
    discount = 0

final_price = price - discount

print(f"Final Price = {final_price}")
```

---

# مشروع 3

برنامج لمعرفة هل العدد زوجي.

```python
number = int(input("Number: "))

if number % 2 == 0:
    print("Even")
else:
    print("Odd")
```

---

# مشروع 4

برنامج يحدد أكبر رقم بين رقمين.

```python
a = int(input("First Number: "))
b = int(input("Second Number: "))

if a > b:
    print(f"{a} is greater")
elif b > a:
    print(f"{b} is greater")
else:
    print("Both numbers are equal")
```

---

# أهمية المسافات البادئة (Indentation)

في Python، تعتمد الكتل البرمجية على المسافات البادئة.

الصحيح:

```python
if age >= 18:
    print("Allowed")
```

الخطأ:

```python
if age >= 18:
print("Allowed")
```

سيظهر خطأ لأن `print()` ليست داخل كتلة `if`.

---

# أخطاء شائعة

## استخدام = بدل ==

❌

```python
if age = 18:
```

الصحيح:

```python
if age == 18:
```

---

## نسيان النقطتين

❌

```python
if age >= 18
```

الصحيح:

```python
if age >= 18:
```

---

## ترتيب الشروط بشكل خاطئ

❌

```python
if score >= 50:
    print("Passed")

elif score >= 90:
    print("Excellent")
```

الشرط الثاني لن يصل إليه البرنامج إذا كانت الدرجة 90، لأن الشرط الأول تحقق بالفعل.

الصحيح:

```python
if score >= 90:
    print("Excellent")

elif score >= 50:
    print("Passed")
```

ابدأ دائمًا بالأكثر تحديدًا أو الأعلى قيمة إذا كانت الشروط متداخلة.

---

# أفضل الممارسات

✅ اجعل الشروط واضحة وبسيطة.

---

✅ استخدم أسماء متغيرات تصف معناها.

---

✅ تجنب التداخل الزائد في الشروط.

---

✅ اختبر جميع الاحتمالات (صحيح، خطأ، وقيم الحدود مثل 50 أو 0).

---

# ملخص

- تستخدم `if` لتنفيذ كود عند تحقق شرط.
- تستخدم `else` لتنفيذ كود عند عدم تحقق الشرط.
- تستخدم `elif` للتعامل مع أكثر من احتمال.
- يمكن دمج الشروط باستخدام `and` و`or` و`not`.
- تعتمد Python على المسافات البادئة لتحديد الكتل البرمجية.

---

# Quiz

## السؤال الأول

ما الكلمة المفتاحية المستخدمة للتحقق من شرط؟

A) loop

B) if

C) input

D) print

✅ الإجابة: B

---

## السؤال الثاني

ما الكلمة المستخدمة إذا لم يتحقق الشرط؟

A) elif

B) while

C) else

D) break

✅ الإجابة: C

---

## السؤال الثالث

ما ناتج الكود إذا كانت قيمة `score = 95`؟

```python
if score >= 90:
    print("Excellent")
elif score >= 75:
    print("Very Good")
else:
    print("Good")
```

A) Good

B) Very Good

C) Excellent

D) لا شيء

✅ الإجابة: C

---

## السؤال الرابع

أي معامل منطقي يتطلب تحقق جميع الشروط؟

A) or

B) not

C) and

D) ==

✅ الإجابة: C

---

# Challenge

أنشئ برنامجًا يطلب من المستخدم:

- الاسم.
- العمر.
- الدرجة.

ثم:

1. إذا كان العمر أقل من 18، اعرض رسالة تفيد بأنه لا يمكنه التسجيل.
2. إذا كان العمر 18 أو أكثر، تحقق من الدرجة:
   - 90 فأكثر → Excellent.
   - من 75 إلى أقل من 90 → Very Good.
   - من 50 إلى أقل من 75 → Passed.
   - أقل من 50 → Failed.
3. استخدم `f-Strings` لعرض رسالة ترحيب باسم المستخدم مع النتيجة النهائية.

**تحدٍ إضافي:** أضف شرطًا يتحقق من أن الدرجة تقع بين 0 و100، وإذا لم تكن كذلك اعرض رسالة خطأ.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Condition | شرط |
| Conditional Statement | جملة شرطية |
| If | إذا |
| Else | وإلا |
| Elif | وإلا إذا |
| Nested If | شرط متداخل |
| Boolean | قيمة منطقية |
| Indentation | المسافات البادئة |
| Comparison | مقارنة |
| Decision Making | اتخاذ القرار |

---

# الدرس القادم

**17 - Loops (الحلقات التكرارية)**

ستتعلم كيف تجعل البرنامج يكرر تنفيذ الأوامر تلقائيًا باستخدام `while` و`for`، وكيف تتحكم في التكرار باستخدام `break` و`continue`، مع العديد من التطبيقات العملية.