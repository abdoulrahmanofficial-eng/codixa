# 31-Lambda-Functions-and-Functional-Programming.md

> مستوى الدرس: متوسط → متقدم
>
> مدة القراءة: 120-150 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم Lambda Functions.
- معرفة متى تستخدم Lambda ومتى لا تستخدمها.
- استخدام `map()`.
- استخدام `filter()`.
- استخدام `reduce()`.
- استخدام `sorted()` مع `key`.
- التعرف على أساسيات Functional Programming.
- كتابة كود مختصر وأكثر احترافية.

---

# مقدمة

حتى الآن كنا نكتب الدوال بهذا الشكل:

```python
def square(number):

    return number ** 2
```

لكن أحيانًا نحتاج دالة صغيرة جدًا تُستخدم مرة واحدة فقط.

هنا يأتي دور:

```
Lambda Functions
```

---

# ما هي Lambda؟

هي دالة مجهولة (Anonymous Function).

ليس لها اسم.

وتستخدم غالبًا عندما تكون الدالة بسيطة وتُستخدم مرة واحدة.

---

# الصيغة العامة

```python
lambda arguments: expression
```

---

# مثال

```python
square = lambda x: x ** 2

print(square(5))
```

الناتج:

```
25
```

---

بدون Lambda

```python
def square(x):

    return x ** 2
```

---

# أكثر من متغير

```python
add = lambda a, b: a + b

print(add(5,7))
```

---

# شرط داخل Lambda

```python
maximum = lambda a, b: a if a > b else b

print(maximum(10,20))
```

---

# متى تستخدم Lambda؟

✅ عندما تكون الدالة قصيرة جدًا.

---

❌ لا تستخدمها إذا أصبح الكود معقدًا أو صعب القراءة.

---

# map()

تستخدم لتطبيق دالة على جميع عناصر القائمة.

---

مثال

```python
numbers = [1,2,3,4]

result = map(

    lambda x: x*2,

    numbers

)

print(list(result))
```

الناتج:

```
[2,4,6,8]
```

---

بدون Lambda

```python
def double(x):

    return x * 2

result = map(double,numbers)
```

---

# مثال

```python
names = [

    "ahmed",

    "sara",

    "ali"
]

result = map(

    str.title,

    names

)

print(list(result))
```

---

# filter()

تستخدم لاختيار العناصر التي تحقق شرطًا.

---

مثال

```python
numbers = [

    1,

    2,

    3,

    4,

    5,

    6
]

even = filter(

    lambda x: x % 2 == 0,

    numbers

)

print(list(even))
```

الناتج:

```
[2,4,6]
```

---

# مثال

```python
students = [

    90,

    50,

    80,

    40
]

passed = filter(

    lambda grade: grade >= 60,

    students

)

print(list(passed))
```

---

# reduce()

تستخدم لتحويل مجموعة عناصر إلى قيمة واحدة.

توجد داخل:

```python
functools
```

---

```python
from functools import reduce

numbers = [

    1,

    2,

    3,

    4
]

result = reduce(

    lambda a,b: a+b,

    numbers

)

print(result)
```

الناتج:

```
10
```

---

# مثال

حساب حاصل الضرب.

```python
from functools import reduce

numbers = [

    2,

    3,

    4
]

print(

    reduce(

        lambda x,y: x*y,

        numbers
    )
)
```

---

# sorted()

يمكن استخدام Lambda معها.

---

لدينا:

```python
students = [

    {

        "name":"Ahmed",

        "grade":80

    },

    {

        "name":"Sara",

        "grade":95

    },

    {

        "name":"Ali",

        "grade":70

    }

]
```

---

الترتيب

```python
students = sorted(

    students,

    key=lambda student: student["grade"]

)

print(students)
```

---

ترتيب تنازلي

```python
students = sorted(

    students,

    key=lambda student: student["grade"],

    reverse=True
)
```

---

# استخدام key

مثال

```python
names = [

    "Ahmed",

    "Ali",

    "Mohamed"
]

result = sorted(

    names,

    key=len
)

print(result)
```

---

# List Comprehension أم map؟

بدلًا من:

```python
map(

    lambda x:x*2,

    numbers
)
```

يمكن استخدام:

```python
[x*2 for x in numbers]
```

وفي كثير من الحالات يكون أكثر وضوحًا.

---

# Functional Programming

تعتمد على:

- الدوال.
- تجنب تغيير البيانات قدر الإمكان.
- كتابة كود قابل لإعادة الاستخدام.

Python تدعم هذا الأسلوب، لكنها ليست لغة وظيفية بالكامل.

---

# مثال عملي

```python
products = [

    {

        "name":"Laptop",

        "price":1000

    },

    {

        "name":"Mouse",

        "price":50

    },

    {

        "name":"Keyboard",

        "price":100

    }

]

expensive = filter(

    lambda product: product["price"] > 100,

    products

)

for product in expensive:

    print(product["name"])
```

---

# مثال

زيادة الأسعار.

```python
prices = [

    100,

    200,

    300
]

new_prices = map(

    lambda price: price*1.1,

    prices

)

print(list(new_prices))
```

---

# أخطاء شائعة

## جعل Lambda معقدة جدًا

إذا احتاجت إلى أكثر من تعبير أو أصبحت صعبة القراءة، فاستخدم `def`.

---

## نسيان تحويل map و filter إلى قائمة

في Python 3 تعيدان كائنًا قابلًا للتكرار (Iterator).

```python
list(result)
```

لعرض النتائج بسهولة.

---

## استخدام reduce بدون داعٍ

إذا كانت هناك دالة جاهزة مثل:

```python
sum()

max()

min()
```

فغالبًا تكون أوضح.

---

# أفضل الممارسات

✅ استخدم Lambda للدوال القصيرة فقط.

---

✅ استخدم List Comprehension عندما تكون أوضح.

---

✅ استخدم `sorted(key=...)` بدلًا من كتابة خوارزميات ترتيب يدويًا.

---

✅ اجعل الكود مقروءًا حتى لو كان أطول قليلًا.

---

# مشروع صغير

برنامج لإدارة درجات الطلاب.

```python
students = [

    {

        "name":"Ahmed",

        "grade":90

    },

    {

        "name":"Sara",

        "grade":70

    },

    {

        "name":"Ali",

        "grade":98

    }

]

passed = filter(

    lambda student: student["grade"] >= 80,

    students
)

passed = sorted(

    passed,

    key=lambda student: student["grade"],

    reverse=True
)

for student in passed:

    print(

        student["name"],

        student["grade"]
    )
```

---

# ملخص

- Lambda هي دوال مجهولة قصيرة.
- `map()` تطبق دالة على جميع العناصر.
- `filter()` تختار العناصر التي تحقق شرطًا.
- `reduce()` تجمع العناصر في قيمة واحدة.
- يمكن استخدام `sorted(key=...)` لترتيب البيانات بسهولة.
- لا تستخدم Lambda إذا أثرت على وضوح الكود.

---

# Quiz

## السؤال الأول

ما هي Lambda؟

A) Class.

B) مكتبة.

C) دالة مجهولة.

D) Loop.

✅ الإجابة: C

---

## السؤال الثاني

أي دالة تستخدم لاختيار العناصر التي تحقق شرطًا؟

A) map()

B) filter()

C) reduce()

D) sort()

✅ الإجابة: B

---

## السؤال الثالث

من أين يتم استيراد `reduce()`؟

A)

```python
math
```

B)

```python
random
```

C)

```python
functools
```

D)

```python
os
```

✅ الإجابة: C

---

## السؤال الرابع

ما وظيفة `key` في `sorted()`؟

A) حذف العناصر.

B) تحديد طريقة المقارنة أثناء الترتيب.

C) إنشاء قائمة جديدة.

D) تحويل القائمة إلى JSON.

✅ الإجابة: B

---

# Challenge

أنشئ قائمة تحتوي على بيانات موظفين:

- الاسم.
- القسم.
- الراتب.

ثم:

1. استخدم `filter()` لاختيار الموظفين الذين تزيد رواتبهم عن 10000.
2. استخدم `map()` لإضافة زيادة 10% على رواتبهم.
3. استخدم `sorted()` لترتيبهم تنازليًا حسب الراتب الجديد.
4. استخدم `reduce()` لحساب إجمالي الرواتب بعد الزيادة.

**تحدٍ إضافي:** نفذ نفس الحل مرة باستخدام `lambda` ومرة أخرى باستخدام دوال عادية (`def`)، ثم قارن أيهما أكثر وضوحًا.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Lambda Function | دالة مجهولة |
| Anonymous Function | دالة بدون اسم |
| Functional Programming | البرمجة الوظيفية |
| map | تطبيق دالة على جميع العناصر |
| filter | تصفية العناصر |
| reduce | اختزال العناصر إلى قيمة واحدة |
| Iterator | كائن قابل للتكرار |
| Key Function | دالة تحديد مفتاح الترتيب |
| List Comprehension | إنشاء القوائم بالصياغة المختصرة |
| Expression | تعبير |

---

# الدرس القادم

**32 - Decorators**

ستتعلم واحدة من أقوى ميزات Python، وهي **Decorators**، وكيفية تعديل سلوك الدوال دون تغيير الكود الأصلي، مع استخدامات عملية مثل تسجيل العمليات (Logging)، والتحقق من الصلاحيات، وقياس زمن التنفيذ.