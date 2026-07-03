# 09-Pseudocode.md

> مستوى الدرس: مبتدئ
>
> مدة القراءة: 20-25 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم معنى Pseudocode.
- معرفة الفرق بين Algorithm و Pseudocode.
- كتابة حلول للمشكلات بطريقة احترافية.
- تحويل الخوارزمية إلى كود بسهولة.

---

# مقدمة

في الدرس السابق تعلمنا أن أي برنامج يبدأ بخوارزمية.

لكن...

كتابة الخوارزمية باللغة العربية قد تصبح صعبة عندما يكبر المشروع.

لهذا يستخدم المبرمجون شيئًا يسمى:

> **Pseudocode**

وهو خطوة بين الخوارزمية والكود الحقيقي.

---

# ما هو Pseudocode؟

Pseudo تعني "وهمي" أو "غير حقيقي".

Code تعني "كود".

إذن:

Pseudocode = كود وهمي.

هو طريقة لكتابة الحل باستخدام كلمات تشبه لغات البرمجة، لكن بدون الالتزام بقواعد لغة معينة.

---

# لماذا نستخدمه؟

لأنه:

- أسهل من الكود الحقيقي.
- أوضح من الخوارزمية التقليدية.
- يساعد على التفكير في الحل.
- يسهل تحويله إلى أي لغة برمجة.

---

# مقارنة

## Algorithm

```
ابدأ

اقرأ الرقم الأول

اقرأ الرقم الثاني

اجمع الرقمين

اعرض الناتج

انتهى
```

---

## Pseudocode

```text
START

INPUT number1

INPUT number2

sum = number1 + number2

OUTPUT sum

END
```

---

## Python

```python
number1 = int(input())

number2 = int(input())

sum = number1 + number2

print(sum)
```

لاحظ أن الـ Pseudocode قريب جدًا من الكود الحقيقي.

---

# أشهر الكلمات المستخدمة

| الكلمة | معناها |
|---------|--------|
| START | بداية |
| END | نهاية |
| INPUT | إدخال بيانات |
| OUTPUT | عرض البيانات |
| IF | إذا |
| ELSE | وإلا |
| WHILE | طالما |
| FOR | كرر |
| SET | تعيين قيمة |
| CALL | استدعاء دالة |

---

# مثال 1

المطلوب:

جمع رقمين.

```text
START

INPUT firstNumber

INPUT secondNumber

SET result = firstNumber + secondNumber

OUTPUT result

END
```

---

# مثال 2

المطلوب:

حساب مساحة مستطيل.

```text
START

INPUT length

INPUT width

SET area = length * width

OUTPUT area

END
```

---

# مثال 3

المطلوب:

معرفة هل الطالب ناجح.

```text
START

INPUT grade

IF grade >= 50

OUTPUT "Passed"

ELSE

OUTPUT "Failed"

END IF

END
```

---

# مثال 4

المطلوب:

معرفة هل الرقم موجب.

```text
START

INPUT number

IF number > 0

OUTPUT "Positive"

ELSE

OUTPUT "Negative"

END IF

END
```

---

# مثال 5

المطلوب:

حساب متوسط ثلاث درجات.

```text
START

INPUT grade1

INPUT grade2

INPUT grade3

SET average = (grade1 + grade2 + grade3) / 3

OUTPUT average

END
```

---

# كيف نحول Pseudocode إلى كود؟

لنأخذ المثال السابق.

Pseudocode

```text
INPUT age

OUTPUT age
```

Python

```python
age = int(input())

print(age)
```

---

# مثال أكبر

Pseudocode

```text
START

INPUT age

IF age >= 18

OUTPUT "Adult"

ELSE

OUTPUT "Child"

END IF

END
```

Python

```python
age = int(input())

if age >= 18:
    print("Adult")
else:
    print("Child")
```

لاحظ أن الفكرة واحدة، لكن الصياغة تختلف.

---

# قواعد كتابة Pseudocode

✅ استخدم أسماء متغيرات واضحة.

---

✅ اكتب الخطوات بالترتيب.

---

✅ لا تعتمد على لغة برمجة معينة.

---

✅ اجعل الحل سهل القراءة.

---

# أخطاء شائعة

❌ كتابة كود Python داخل الـ Pseudocode.

---

❌ استخدام أسماء غير مفهومة مثل:

```
x

y

z
```

بدلاً من:

```
studentAge

studentName

totalMarks
```

---

❌ نسيان START أو END.

---

❌ القفز مباشرة للكود بدون كتابة الحل.

---

# نصائح احترافية

عندما تصبح المشكلات أكبر...

ابدأ دائمًا بـ:

```
Algorithm

↓

Pseudocode

↓

Flowchart

↓

Programming Code
```

هذه الطريقة يستخدمها كثير من المبرمجين عند تصميم الأنظمة الكبيرة.

---

# ملخص

- Pseudocode هو كود وهمي يصف الحل.
- لا يرتبط بلغة برمجة معينة.
- يسهل تحويله إلى أي لغة.
- يساعد على تنظيم التفكير وتقليل الأخطاء.

---

# Quiz

## السؤال الأول

ما هو Pseudocode؟

A) لغة برمجة.

B) نظام تشغيل.

C) طريقة لكتابة الحل تشبه الكود الحقيقي.

D) برنامج لتحرير الأكواد.

✅ الإجابة: C

---

## السؤال الثاني

أي كلمة تستخدم لقراءة البيانات؟

A) OUTPUT

B) PRINT

C) INPUT

D) SHOW

✅ الإجابة: C

---

## السؤال الثالث

هل يمكن تحويل Pseudocode إلى أكثر من لغة برمجة؟

A) نعم.

B) لا.

✅ الإجابة: A

---

## السؤال الرابع

أيهما أقرب إلى الكود الحقيقي؟

A) Algorithm التقليدية.

B) Pseudocode.

C) الرسم البياني.

D) لغة الآلة.

✅ الإجابة: B

---

# Challenge

اكتب Pseudocode للبرامج التالية:

### 1. حساب محيط دائرة.

### 2. معرفة أكبر رقم بين رقمين.

### 3. حساب مجموع خمسة أرقام.

### 4. تحويل الدرجات المئوية إلى فهرنهايت.

### 5. معرفة هل العدد يقبل القسمة على 2.

بعد ذلك حاول تحويل أول مثال إلى لغة Python بنفسك.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Pseudocode | الكود الوهمي |
| Input | إدخال |
| Output | إخراج |
| Variable | متغير |
| Assignment | إسناد قيمة |
| Condition | شرط |
| Loop | حلقة تكرار |
| Function | دالة |
| Algorithm | خوارزمية |
| Program | برنامج |

---

# الدرس القادم

**10 - Flowcharts (مخططات التدفق)**

ستتعلم كيف يحول المبرمجون الخوارزميات إلى رسومات توضح سير تنفيذ البرنامج، وهي مهارة مهمة في تحليل وتصميم الأنظمة قبل كتابة الكود.