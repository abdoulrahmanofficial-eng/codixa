# 18-Functions.md

> مستوى الدرس: مبتدئ → متوسط
>
> مدة القراءة: 60-75 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم الدوال (Functions).
- معرفة لماذا نستخدم الدوال في البرمجة.
- إنشاء دوال خاصة بك.
- استخدام المعاملات (Parameters).
- استخدام القيم المرجعة (Return Values).
- فهم الفرق بين `print()` و `return`.
- كتابة برامج أكثر تنظيمًا وقابلة لإعادة الاستخدام.

---

# مقدمة

حتى الآن كنا نكتب جميع التعليمات داخل ملف واحد.

مثلًا:

```python
print("Welcome")

name = input("Name: ")

print(name)

age = int(input("Age: "))

print(age)
```

كلما كبر البرنامج، أصبح الكود أطول وأصعب في القراءة والصيانة.

الحل هو **تقسيم البرنامج إلى دوال (Functions)**.

---

# ما هي الدالة؟

الدالة (Function) هي مجموعة من الأوامر تنفذ مهمة محددة ويمكن استدعاؤها أكثر من مرة.

بدلًا من كتابة نفس الكود في عدة أماكن، نكتبه مرة واحدة داخل دالة، ثم نستخدمها عند الحاجة.

---

# مثال من الحياة

تخيل أنك تمتلك ماكينة قهوة.

أنت لا تعرف كيف تعمل من الداخل.

كل ما تفعله هو الضغط على زر معين لتحصل على القهوة.

الدالة تعمل بنفس الفكرة.

أنت تستدعيها، وهي تنفذ المهمة المطلوبة ثم تعيد النتيجة.

---

# لماذا نستخدم الدوال؟

الدوال تجعل الكود:

- أكثر تنظيمًا.
- أسهل في القراءة.
- أسهل في الاختبار.
- أسهل في إعادة الاستخدام.
- أقل عرضة للأخطاء.

---

# دوال جاهزة في Python

لقد استخدمنا بالفعل عدة دوال مثل:

```python
print()

input()

len()

type()

int()

float()

str()
```

هذه كلها دوال جاهزة داخل Python.

---

# إنشاء أول دالة

نستخدم الكلمة المفتاحية:

```python
def
```

مثال:

```python
def say_hello():
    print("Hello, World!")
```

لاحظ أن الدالة لن تعمل بمجرد تعريفها.

---

# استدعاء الدالة

```python
def say_hello():
    print("Hello, World!")

say_hello()
```

الناتج:

```
Hello, World!
```

---

# استدعاء الدالة أكثر من مرة

```python
def welcome():
    print("Welcome!")

welcome()
welcome()
welcome()
```

الناتج:

```
Welcome!

Welcome!

Welcome!
```

---

# Parameters

أحيانًا نريد أن تستقبل الدالة بيانات.

مثال:

```python
def greet(name):
    print(f"Hello {name}")
```

---

# استخدام الدالة

```python
greet("Ahmed")

greet("Sara")

greet("Ali")
```

الناتج:

```
Hello Ahmed

Hello Sara

Hello Ali
```

---

# أكثر من Parameter

```python
def student_info(name, age):

    print(f"Name: {name}")

    print(f"Age: {age}")
```

---

الاستخدام:

```python
student_info("Ahmed", 20)
```

الناتج:

```
Name: Ahmed

Age: 20
```

---

# Return

حتى الآن كانت الدوال تطبع النتائج فقط.

لكن في أغلب الأحيان نريد أن تعيد قيمة.

هنا نستخدم:

```python
return
```

---

# مثال

```python
def add(a, b):

    return a + b
```

---

الاستخدام:

```python
result = add(10, 5)

print(result)
```

الناتج:

```
15
```

---

# الفرق بين print و return

## باستخدام print

```python
def add(a, b):
    print(a + b)
```

لا يمكن استخدام الناتج في عمليات أخرى بسهولة.

---

## باستخدام return

```python
def add(a, b):
    return a + b
```

يمكنك:

```python
result = add(10, 5)

print(result * 2)
```

الناتج:

```
30
```

لهذا السبب، يفضل استخدام `return` عندما تحتاج إلى إعادة قيمة.

---

# مثال: حساب مساحة مستطيل

```python
def rectangle_area(length, width):

    return length * width
```

---

الاستخدام:

```python
area = rectangle_area(5, 10)

print(area)
```

الناتج:

```
50
```

---

# القيم الافتراضية (Default Parameters)

يمكن إعطاء قيمة افتراضية للمعامل.

```python
def greet(name="Guest"):

    print(f"Hello {name}")
```

---

الاستخدام:

```python
greet()
```

الناتج:

```
Hello Guest
```

---

أو:

```python
greet("Ahmed")
```

الناتج:

```
Hello Ahmed
```

---

# إعادة أكثر من قيمة

```python
def calculate(a, b):

    return a + b, a - b
```

---

الاستخدام:

```python
sum_result, sub_result = calculate(10, 3)

print(sum_result)

print(sub_result)
```

الناتج:

```
13

7
```

---

# الدوال التي لا تستقبل Parameters

```python
def show_message():

    print("Learning Python")
```

---

# الدوال التي تستقبل Parameters ولا تعيد قيمة

```python
def welcome(name):

    print(f"Welcome {name}")
```

---

# الدوال التي تستقبل Parameters وتعيد قيمة

```python
def multiply(a, b):

    return a * b
```

---

# Variable Scope

المتغيرات داخل الدالة تسمى **Local Variables**.

مثال:

```python
def test():

    number = 10

    print(number)
```

لا يمكن استخدام:

```python
number
```

خارج الدالة.

---

# مثال عملي

برنامج لحساب متوسط ثلاث درجات.

```python
def average(a, b, c):

    return (a + b + c) / 3


math = 90
physics = 80
chemistry = 70

result = average(math, physics, chemistry)

print(result)
```

الناتج:

```
80.0
```

---

# مثال: معرفة هل العدد زوجي

```python
def is_even(number):

    return number % 2 == 0
```

الاستخدام:

```python
print(is_even(8))
```

الناتج:

```
True
```

---

# مثال: أكبر رقم

```python
def maximum(a, b):

    if a > b:
        return a

    return b
```

---

# أخطاء شائعة

## نسيان استدعاء الدالة

❌

```python
def hello():

    print("Hello")
```

لن يظهر شيء.

---

الصحيح:

```python
hello()
```

---

## نسيان return

❌

```python
def add(a, b):

    a + b
```

لن تعيد الدالة أي قيمة.

---

الصحيح:

```python
return a + b
```

---

## تمرير عدد خاطئ من المعاملات

❌

```python
greet()
```

إذا كانت الدالة تتطلب:

```python
greet(name)
```

سيظهر خطأ.

---

# أفضل الممارسات

✅ اجعل كل دالة تؤدي مهمة واحدة فقط.

---

✅ اختر أسماء دوال واضحة مثل:

```python
calculate_area()

find_max()

print_menu()
```

---

✅ استخدم `return` عندما تحتاج إلى إعادة قيمة.

---

✅ لا تجعل الدالة طويلة جدًا.

---

# مشروع صغير

برنامج آلة حاسبة باستخدام الدوال.

```python
def add(a, b):
    return a + b


def subtract(a, b):
    return a - b


def multiply(a, b):
    return a * b


def divide(a, b):
    return a / b


x = float(input("First Number: "))
y = float(input("Second Number: "))

print(add(x, y))
print(subtract(x, y))
print(multiply(x, y))
print(divide(x, y))
```

---

# ملخص

- الدالة مجموعة من الأوامر تؤدي مهمة محددة.
- تستخدم `def` لإنشاء الدوال.
- تستخدم `Parameters` لإرسال البيانات.
- تستخدم `return` لإعادة النتائج.
- الدوال تجعل البرامج أكثر تنظيمًا وأسهل في التطوير والصيانة.

---

# Quiz

## السؤال الأول

ما الكلمة المستخدمة لإنشاء دالة في Python؟

A) function

B) define

C) def

D) func

✅ الإجابة: C

---

## السؤال الثاني

ما الفرق الرئيسي بين `print()` و`return`؟

A) لا يوجد فرق.

B) `print()` تعرض النتيجة فقط، بينما `return` تعيد قيمة يمكن استخدامها لاحقًا.

C) `return` تطبع على الشاشة.

D) `print()` تنهي تنفيذ الدالة.

✅ الإجابة: B

---

## السؤال الثالث

ما ناتج:

```python
def square(x):
    return x * x

print(square(4))
```

A) 4

B) 8

C) 16

D) Error

✅ الإجابة: C

---

## السؤال الرابع

أين يمكن استخدام المتغير المحلي (Local Variable)؟

A) في أي مكان داخل البرنامج.

B) داخل الدالة التي تم تعريفه فيها فقط.

C) داخل جميع الملفات.

D) داخل أي حلقة فقط.

✅ الإجابة: B

---

# Challenge

أنشئ برنامجًا يحتوي على الدوال التالية:

1. `add(a, b)` لإرجاع مجموع رقمين.
2. `subtract(a, b)` لإرجاع الفرق.
3. `multiply(a, b)` لإرجاع حاصل الضرب.
4. `divide(a, b)` لإرجاع ناتج القسمة (مع التحقق من عدم القسمة على صفر).
5. `is_even(number)` لإرجاع `True` إذا كان العدد زوجيًا.

ثم أنشئ قائمة بسيطة (Menu) تطلب من المستخدم اختيار العملية التي يريد تنفيذها، واستدعِ الدالة المناسبة.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Function | دالة |
| Parameter | معامل |
| Argument | قيمة مُمررة |
| Return | إرجاع |
| Function Call | استدعاء الدالة |
| Local Variable | متغير محلي |
| Global Variable | متغير عام |
| Default Parameter | معامل افتراضي |
| Scope | نطاق المتغير |
| Reusability | إعادة الاستخدام |

---

# الدرس القادم

**19 - Strings (النصوص)**

ستتعلم كل ما يتعلق بالنصوص في Python، مثل الفهرسة (Indexing)، والتقطيع (Slicing)، وأشهر الدوال الخاصة بالنصوص، والتنسيق باستخدام `f-Strings`، وهي من أكثر المواضيع استخدامًا في تطوير التطبيقات الحقيقية.