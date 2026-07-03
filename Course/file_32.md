# 32-Decorators.md

> مستوى الدرس: متقدم
>
> مدة القراءة: 140-180 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم ما هو Decorator.
- معرفة لماذا نستخدم Decorators.
- فهم أن الدوال في Python هي First-Class Objects.
- إنشاء Decorators خاصة بك.
- استخدام أكثر من Decorator.
- تمرير Arguments داخل Decorators.
- استخدام `functools.wraps`.
- التعرف على أشهر Decorators المدمجة في Python.
- استخدام Decorators في المشاريع الحقيقية.

---

# مقدمة

تخيل أن لديك 100 دالة.

وتريد قبل تشغيل كل دالة:

- التحقق من تسجيل الدخول.
- قياس زمن التنفيذ.
- كتابة Log.
- التحقق من الصلاحيات.

هل ستكتب نفس الكود داخل جميع الدوال؟

بالطبع لا.

الحل هو:

```
Decorators
```

---

# ما هو Decorator؟

Decorator هو دالة تقوم بتعديل أو إضافة سلوك لدالة أخرى **دون تعديل الكود الأصلي لهذه الدالة**.

---

# First-Class Objects

في Python:

الدوال تعتبر كائنات.

أي يمكن:

- تخزينها داخل متغير.
- تمريرها كوسيط.
- إرجاعها من دالة.

---

# مثال

```python
def hello():

    print("Hello")


message = hello

message()
```

الناتج:

```
Hello
```

---

# تمرير دالة

```python
def greet():

    print("Welcome")


def execute(function):

    function()


execute(greet)
```

---

# إرجاع دالة

```python
def outer():

    def inner():

        print("Inside")

    return inner


result = outer()

result()
```

---

# إنشاء أول Decorator

```python
def decorator(function):

    def wrapper():

        print("Before")

        function()

        print("After")

    return wrapper
```

---

# الاستخدام

```python
def hello():

    print("Hello")


hello = decorator(hello)

hello()
```

الناتج:

```
Before

Hello

After
```

---

# الطريقة المختصرة

بدلًا من:

```python
hello = decorator(hello)
```

نستخدم:

```python
@decorator

def hello():

    print("Hello")
```

---

# Decorator مع Arguments

```python
def decorator(function):

    def wrapper(name):

        print("Start")

        function(name)

        print("End")

    return wrapper
```

---

الاستخدام

```python
@decorator

def hello(name):

    print(f"Hello {name}")


hello("Ahmed")
```

---

# استخدام *args و **kwargs

حتى يعمل الـ Decorator مع أي عدد من الوسائط.

```python
def decorator(function):

    def wrapper(*args, **kwargs):

        print("Before")

        result = function(*args, **kwargs)

        print("After")

        return result

    return wrapper
```

---

# لماذا نعيد result؟

حتى لا نفقد القيمة التي تعيدها الدالة الأصلية.

---

# functools.wraps

بدون:

```python
@wraps
```

قد تتغير بعض معلومات الدالة مثل اسمها ووثائقها (Docstring).

---

الاستخدام

```python
from functools import wraps

def decorator(function):

    @wraps(function)

    def wrapper(*args, **kwargs):

        return function(*args, **kwargs)

    return wrapper
```

---

# أكثر من Decorator

```python
@decorator1

@decorator2

def hello():

    print("Hello")
```

يتم تطبيق `decorator2` أولًا، ثم `decorator1` على النتيجة.

---

# مثال

```python
def stars(function):

    def wrapper():

        print("*****")

        function()

        print("*****")

    return wrapper


def title(function):

    def wrapper():

        print("Program")

        function()

    return wrapper


@title

@stars

def hello():

    print("Hello")


hello()
```

---

# Decorator لقياس الزمن

```python
import time

from functools import wraps

def timer(function):

    @wraps(function)

    def wrapper(*args, **kwargs):

        start = time.perf_counter()

        result = function(*args, **kwargs)

        end = time.perf_counter()

        print(f"Execution Time: {end-start:.6f} seconds")

        return result

    return wrapper
```

---

# الاستخدام

```python
@timer

def calculate():

    total = sum(range(1_000_000))

    return total


calculate()
```

---

# Decorator للتحقق من الصلاحيات

```python
logged_in = True

def login_required(function):

    def wrapper():

        if logged_in:

            function()

        else:

            print("Access Denied")

    return wrapper
```

---

# الاستخدام

```python
@login_required

def dashboard():

    print("Dashboard")
```

---

# Decorator لتسجيل العمليات

```python
from functools import wraps

def logger(function):

    @wraps(function)

    def wrapper(*args, **kwargs):

        print(f"Running {function.__name__}")

        return function(*args, **kwargs)

    return wrapper
```

---

# Decorators المدمجة

Python تحتوي على عدة Decorators جاهزة.

من أشهرها:

- `@property`
- `@staticmethod`
- `@classmethod`

سندرسها بالتفصيل في الدروس القادمة.

---

# Decorator يقبل معاملات

يمكن إنشاء Decorator يقبل إعدادات.

```python
from functools import wraps

def repeat(times):

    def decorator(function):

        @wraps(function)

        def wrapper(*args, **kwargs):

            for _ in range(times):

                function(*args, **kwargs)

        return wrapper

    return decorator
```

---

الاستخدام

```python
@repeat(3)

def hello():

    print("Hello")


hello()
```

الناتج:

```
Hello

Hello

Hello
```

---

# أخطاء شائعة

## نسيان إعادة الدالة

❌

```python
def wrapper():

    function()
```

إذا كانت الدالة الأصلية تعيد قيمة، فيجب إعادة هذه القيمة أيضًا عند الحاجة.

---

## عدم استخدام *args و **kwargs

سيجعل Decorator يعمل مع عدد محدد من الوسائط فقط.

---

## نسيان wraps

قد يؤدي إلى فقدان اسم الدالة الأصلية وDocstring الخاصة بها.

---

# أفضل الممارسات

✅ استخدم Decorators لإعادة استخدام السلوك المشترك.

---

✅ استخدم `functools.wraps`.

---

✅ اجعل Decorators صغيرة وواضحة.

---

✅ لا تضع منطقًا معقدًا داخل Decorator إذا كان يمكن وضعه في مكان آخر بطريقة أوضح.

---

# مشروع صغير

```python
from functools import wraps

def logger(function):

    @wraps(function)

    def wrapper(*args, **kwargs):

        print(f"Starting {function.__name__}")

        result = function(*args, **kwargs)

        print(f"Finished {function.__name__}")

        return result

    return wrapper


@logger

def add(a, b):

    return a + b


print(add(5, 7))
```

---

# ملخص

- Decorator يضيف سلوكًا جديدًا للدوال دون تعديلها.
- تستخدم `@decorator` لتطبيق Decorator بسهولة.
- استخدم `*args` و`**kwargs` لدعم أي عدد من الوسائط.
- استخدم `functools.wraps` للحفاظ على معلومات الدالة الأصلية.
- تستخدم Decorators بكثرة في أطر العمل مثل Django وFlask وFastAPI.

---

# Quiz

## السؤال الأول

ما هو Decorator؟

A) نوع جديد من المتغيرات.

B) دالة تضيف أو تعدل سلوك دالة أخرى.

C) مكتبة.

D) Loop.

✅ الإجابة: B

---

## السؤال الثاني

أي رمز يستخدم لتطبيق Decorator؟

A)

```python
#
```

B)

```python
@
```

C)

```python
$
```

D)

```python
&
```

✅ الإجابة: B

---

## السؤال الثالث

ما فائدة `functools.wraps`؟

A) زيادة سرعة البرنامج.

B) الحفاظ على بيانات الدالة الأصلية مثل الاسم وDocstring.

C) حذف الأخطاء.

D) تحويل الدالة إلى Class.

✅ الإجابة: B

---

## السؤال الرابع

لماذا نستخدم `*args` و`**kwargs` داخل Decorator؟

A) لتقليل حجم الكود فقط.

B) لدعم أي عدد من الوسائط الموضعية والمُسمّاة.

C) لإنشاء Class.

D) لحذف الوسائط.

✅ الإجابة: B

---

# Challenge

أنشئ ثلاثة Decorators:

1. `timer` لقياس زمن التنفيذ.
2. `logger` لطباعة اسم الدالة قبل وبعد التنفيذ.
3. `repeat(times)` لتكرار تنفيذ الدالة عددًا معينًا من المرات.

ثم:

- طبّق الثلاثة معًا على دالة واحدة.
- اجعل الدالة تستقبل معاملات وتعيد قيمة.
- تأكد من استخدام `functools.wraps`.

**تحدٍ إضافي:** أنشئ Decorator باسم `cache_result` يقوم بحفظ نتائج الدالة في قاموس، بحيث إذا استُدعيت بنفس الوسائط مرة أخرى يعيد النتيجة مباشرة دون إعادة تنفيذ الدالة (مفهوم Memoization).

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Decorator | مزخرف / معدل الدوال |
| Wrapper | دالة مغلفة |
| First-Class Function | دالة تعامل ككائن |
| Higher-Order Function | دالة تستقبل أو تعيد دوالًا |
| Closure | إغلاق |
| *args | وسائط موضعية متعددة |
| **kwargs | وسائط مسماة متعددة |
| wraps | الحفاظ على بيانات الدالة |
| Memoization | تخزين النتائج لإعادة استخدامها |
| Execution Time | زمن التنفيذ |

---

# الدرس القادم

**33 - Iterators & Generators**

ستتعلم كيف تعمل الحلقات في Python من الداخل، وما هي **Iterators** و**Generators**، وكيف تستخدم `yield` لإنشاء تدفقات بيانات كبيرة بكفاءة عالية واستهلاك أقل للذاكرة.