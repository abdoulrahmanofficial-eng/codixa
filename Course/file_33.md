# 33-Iterators-and-Generators.md

> مستوى الدرس: متقدم
>
> مدة القراءة: 150-180 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم Iterables.
- فهم Iterators.
- استخدام الدالتين `iter()` و `next()`.
- إنشاء Iterator خاص بك.
- فهم Generators.
- استخدام `yield`.
- معرفة الفرق بين `return` و `yield`.
- فهم Lazy Evaluation.
- تحسين استهلاك الذاكرة في البرامج الكبيرة.

---

# مقدمة

كل يوم تستخدم حلقات مثل:

```python
numbers = [1,2,3]

for number in numbers:

    print(number)
```

لكن هل تساءلت:

كيف تعمل حلقة `for` من الداخل؟

الإجابة:

تعتمد على:

```
Iterators
```

---

# ما هو Iterable؟

هو أي كائن يمكن المرور على عناصره باستخدام:

```python
for
```

مثل:

- List
- Tuple
- String
- Dictionary
- Set
- Range

---

مثال

```python
name = "Python"

for letter in name:

    print(letter)
```

---

# Iterable vs Iterator

| Iterable | Iterator |
|-----------|----------|
| يمكن إنشاء Iterator منه | يتحرك عنصرًا بعد عنصر |
| لا يحتفظ بالحالة الحالية | يحتفظ بالموقع الحالي |
| يستخدم مع `iter()` | يستخدم مع `next()` |

---

# إنشاء Iterator

```python
numbers = [10,20,30]

iterator = iter(numbers)
```

---

# next()

```python
print(next(iterator))
```

الناتج

```
10
```

---

مرة أخرى

```python
print(next(iterator))
```

```
20
```

---

ثم

```python
print(next(iterator))
```

```
30
```

---

بعد انتهاء العناصر

```python
next(iterator)
```

سيظهر:

```
StopIteration
```

---

# كيف تعمل for؟

تقريبًا:

```python
iterator = iter(numbers)

while True:

    try:

        item = next(iterator)

        print(item)

    except StopIteration:

        break
```

---

# إنشاء Iterator خاص

```python
class Counter:

    def __init__(self,max_number):

        self.current = 1

        self.max_number = max_number

    def __iter__(self):

        return self

    def __next__(self):

        if self.current <= self.max_number:

            number = self.current

            self.current += 1

            return number

        raise StopIteration
```

---

الاستخدام

```python
counter = Counter(5)

for number in counter:

    print(number)
```

الناتج

```
1

2

3

4

5
```

---

# ما هو Generator؟

هو طريقة أسهل لإنشاء Iterator.

بدلاً من كتابة:

```python
__iter__()

__next__()
```

يمكن استخدام:

```
yield
```

---

# أول Generator

```python
def numbers():

    yield 1

    yield 2

    yield 3
```

---

الاستخدام

```python
generator = numbers()

print(next(generator))

print(next(generator))

print(next(generator))
```

---

# Generator مع for

```python
for number in numbers():

    print(number)
```

---

# الفرق بين return و yield

```python
def example():

    return 5
```

تنتهي الدالة مباشرة.

---

```python
def example():

    yield 5

    yield 10
```

تتوقف مؤقتًا ثم تكمل من نفس المكان عند الطلب التالي.

---

# مثال

```python
def countdown(number):

    while number > 0:

        yield number

        number -= 1
```

---

الاستخدام

```python
for value in countdown(5):

    print(value)
```

الناتج

```
5

4

3

2

1
```

---

# Generator Expression

بدلًا من:

```python
numbers = []

for number in range(10):

    numbers.append(number*2)
```

---

يمكن:

```python
generator = (

    number*2

    for number in range(10)
)
```

---

قراءة البيانات

```python
for item in generator:

    print(item)
```

---

# List Comprehension

```python
numbers = [

    x*x

    for x in range(5)
]
```

---

Generator Expression

```python
numbers = (

    x*x

    for x in range(5)
)
```

---

الفرق

القائمة تنشئ جميع العناصر مباشرة.

أما Generator فينشئ العناصر عند الحاجة فقط.

---

# Lazy Evaluation

Generators لا تنشئ البيانات دفعة واحدة.

بل عند الطلب فقط.

وهذا يقلل استهلاك الذاكرة.

---

# مثال

بدلًا من إنشاء مليون رقم داخل قائمة:

```python
numbers = [

    x

    for x in range(1000000)
]
```

---

يمكن

```python
numbers = (

    x

    for x in range(1000000)
)
```

وسيتم إنشاء كل عنصر عند الحاجة إليه فقط.

---

# مثال عملي

قراءة ملف كبير.

بدلاً من:

```python
lines = file.readlines()
```

يمكن:

```python
for line in file:

    print(line)
```

قراءة الملف سطرًا بسطر، وهو أكثر كفاءة.

---

# Generator لإنتاج الأعداد الزوجية

```python
def even_numbers(limit):

    number = 2

    while number <= limit:

        yield number

        number += 2
```

---

الاستخدام

```python
for number in even_numbers(10):

    print(number)
```

---

# Generator لسلسلة فيبوناتشي

```python
def fibonacci(limit):

    a = 0

    b = 1

    while a <= limit:

        yield a

        a, b = b, a + b
```

---

الاستخدام

```python
for number in fibonacci(50):

    print(number)
```

---

# أخطاء شائعة

## استخدام next() بعد انتهاء البيانات

سيؤدي إلى:

```
StopIteration
```

يمكن التعامل معه باستخدام `try` و`except` إذا لزم الأمر.

---

## محاولة إعادة استخدام Generator بعد انتهائه

Generator يستهلك عناصره أثناء المرور عليها.

إذا أردت استخدامه مرة أخرى، أنشئ Generator جديدًا.

---

## استخدام List بدل Generator مع البيانات الضخمة

قد يستهلك ذلك ذاكرة كبيرة دون حاجة.

---

# أفضل الممارسات

✅ استخدم Generator عند التعامل مع كميات كبيرة من البيانات.

---

✅ استخدم `yield` بدلاً من بناء قوائم ضخمة إذا لم تكن بحاجة لجميع العناصر في وقت واحد.

---

✅ استخدم List عندما تحتاج للوصول العشوائي للعناصر أو لإعادة استخدامها عدة مرات.

---

# مشروع صغير

```python
def read_numbers():

    for number in range(1,11):

        yield number


for number in read_numbers():

    print(number)
```

---

# مشروع متقدم

إنشاء Generator لإرجاع مربعات الأعداد.

```python
def squares(limit):

    for number in range(limit):

        yield number ** 2


for value in squares(10):

    print(value)
```

---

# ملخص

- Iterable هو أي كائن يمكن المرور على عناصره.
- Iterator يحتفظ بالحالة الحالية ويستخدم `next()`.
- Generator هو Iterator يتم إنشاؤه باستخدام `yield`.
- `yield` توقف تنفيذ الدالة مؤقتًا وتستكمل لاحقًا.
- Generators توفر استهلاكًا أقل للذاكرة بفضل Lazy Evaluation.

---

# Quiz

## السؤال الأول

أي دالة تنشئ Iterator من Iterable؟

A)

```python
next()
```

B)

```python
iter()
```

C)

```python
yield()
```

D)

```python
range()
```

✅ الإجابة: B

---

## السؤال الثاني

أي كلمة مفتاحية تستخدم لإنشاء Generator؟

A)

```python
return
```

B)

```python
yield
```

C)

```python
break
```

D)

```python
continue
```

✅ الإجابة: B

---

## السؤال الثالث

ما الذي يحدث عند استدعاء `next()` بعد انتهاء عناصر الـ Iterator؟

A) يعيد `None`.

B) يبدأ من جديد.

C) يطلق `StopIteration`.

D) يحذف الـ Iterator.

✅ الإجابة: C

---

## السؤال الرابع

ما أهم ميزة للـ Generators؟

A) زيادة حجم الذاكرة.

B) تنفيذ أسرع دائمًا.

C) إنشاء البيانات عند الحاجة وتقليل استهلاك الذاكرة.

D) تعمل فقط مع القوائم.

✅ الإجابة: C

---

# Challenge

أنشئ Generator باسم:

```python
prime_numbers(limit)
```

يقوم بإرجاع جميع الأعداد الأولية حتى الحد الذي يدخله المستخدم باستخدام `yield`.

ثم:

1. اطبع أول 20 عددًا أوليًا.
2. استخدم `next()` عدة مرات يدويًا.
3. استخدم حلقة `for` لإكمال بقية الأعداد.
4. قارن استهلاك الذاكرة بين Generator وقائمة تحتوي على نفس الأعداد.

**تحدٍ إضافي:** أنشئ Generator لا نهائيًا (Infinite Generator) يولد الأعداد الطبيعية بدءًا من 1، ثم استخدم شرطًا لإيقاف الحلقة بعد عدد معين من العناصر.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Iterable | كائن قابل للتكرار |
| Iterator | مكرر |
| Generator | مولد |
| yield | إرجاع مؤقت مع حفظ الحالة |
| next() | الحصول على العنصر التالي |
| iter() | إنشاء Iterator |
| Lazy Evaluation | التقييم عند الحاجة |
| StopIteration | استثناء انتهاء العناصر |
| Generator Expression | تعبير Generator |
| Memory Efficient | موفر للذاكرة |

---

# الدرس القادم

**34 - Modules & Packages (Advanced)**

ستتعلم كيفية تنظيم المشاريع الاحترافية، وإنشاء Modules وPackages خاصة بك، واستخدام `__name__` و`__all__`، وإدارة الاستيراد (Imports) بطريقة صحيحة لبناء مشاريع Python كبيرة وقابلة للصيانة.