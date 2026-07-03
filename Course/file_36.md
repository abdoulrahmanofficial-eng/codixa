# 36-Multithreading-and-Multiprocessing.md

> مستوى الدرس: متقدم جدًا
>
> مدة القراءة: 180-220 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم Concurrency و Parallelism.
- معرفة الفرق بين Thread و Process.
- استخدام مكتبة `threading`.
- استخدام مكتبة `multiprocessing`.
- فهم GIL في Python.
- اختيار الطريقة المناسبة لتحسين الأداء.
- تنفيذ مهام متعددة في نفس الوقت.
- التعامل مع حالات التزامن (Race Conditions).
- استخدام Locks لحماية البيانات.

---

# مقدمة

في البرامج العادية:

```
Task 1 → Task 2 → Task 3
```

كل شيء يتم بشكل تسلسلي.

لكن ماذا لو أردنا:

- تحميل ملفات
- معالجة بيانات
- إرسال طلبات API

في نفس الوقت؟

هنا نستخدم:

```
Multithreading / Multiprocessing
```

---

# الفرق بين Concurrency و Parallelism

## Concurrency

تنفيذ مهام متعددة بشكل متداخل (ليس بالضرورة في نفس اللحظة).

---

## Parallelism

تنفيذ مهام متعددة في نفس اللحظة فعليًا (على أنوية متعددة).

---

# Thread vs Process

| Thread | Process |
|--------|----------|
| خفيف الوزن | ثقيل الوزن |
| داخل نفس الذاكرة | ذاكرة مستقلة |
| أسرع في الإنشاء | أبطأ في الإنشاء |
| مناسب للـ I/O | مناسب للعمليات الثقيلة |

---

# Multithreading

## إنشاء Thread

```python
import threading

def print_numbers():

    for i in range(5):

        print(i)


thread = threading.Thread(target=print_numbers)

thread.start()

thread.join()
```

---

# start vs join

- `start()` → تشغيل الـ Thread
- `join()` → انتظار انتهاء الـ Thread

---

# مثال متعدد Threads

```python
import threading

def task(name):

    for i in range(3):

        print(name, i)


t1 = threading.Thread(target=task, args=("A",))

t2 = threading.Thread(target=task, args=("B",))

t1.start()

t2.start()

t1.join()

t2.join()
```

---

# متى نستخدم Thread؟

- تحميل ملفات
- طلبات API
- عمليات I/O
- قراءة ملفات كبيرة

---

# Race Condition

مشكلة تحدث عندما يصل أكثر من Thread لنفس البيانات.

---

مثال

```python
import threading

counter = 0

def increment():

    global counter

    for _ in range(100000):

        counter += 1


t1 = threading.Thread(target=increment)

t2 = threading.Thread(target=increment)

t1.start()

t2.start()

t1.join()

t2.join()

print(counter)
```

---

الناتج قد يكون خاطئًا بسبب التزامن.

---

# حل المشكلة باستخدام Lock

```python
import threading

counter = 0

lock = threading.Lock()

def increment():

    global counter

    for _ in range(100000):

        with lock:

            counter += 1
```

---

# multiprocessing

يستخدم لتشغيل العمليات الثقيلة على أنوية متعددة.

---

# مثال

```python
from multiprocessing import Process

def task():

    for i in range(5):

        print(i)


p1 = Process(target=task)

p2 = Process(target=task)

p1.start()

p2.start()

p1.join()

p2.join()
```

---

# الفرق في الأداء

- Thread → سريع مع I/O
- Process → أسرع مع CPU-heavy tasks

---

# GIL (Global Interpreter Lock)

Python تحتوي على قفل يمنع تنفيذ أكثر من Thread في نفس الوقت داخل نفس العملية.

---

## النتيجة:

- Threads لا تستفيد من تعدد الأنوية في العمليات الحسابية الثقيلة.
- multiprocessing هو الحل هنا.

---

# مثال عملي: حساب أعداد كبيرة

## باستخدام Thread

أداء محدود بسبب GIL

---

## باستخدام Process

```python
from multiprocessing import Process

def calculate():

    total = sum(range(10_000_000))

    print(total)


p1 = Process(target=calculate)

p2 = Process(target=calculate)

p1.start()

p2.start()

p1.join()

p2.join()
```

---

# Pool

طريقة أسهل لإدارة عدة عمليات.

```python
from multiprocessing import Pool

def square(x):

    return x * x


with Pool(4) as pool:

    result = pool.map(square, range(10))


print(result)
```

---

# ThreadPoolExecutor

طريقة حديثة لإدارة Threads.

```python
from concurrent.futures import ThreadPoolExecutor

def task(n):

    return n * 2


with ThreadPoolExecutor(max_workers=3) as executor:

    results = executor.map(task, range(5))


print(list(results))
```

---

# ProcessPoolExecutor

```python
from concurrent.futures import ProcessPoolExecutor

def task(n):

    return n * n


with ProcessPoolExecutor(max_workers=3) as executor:

    results = executor.map(task, range(5))


print(list(results))
```

---

# مقارنة سريعة

| الحالة | الأفضل |
|--------|--------|
| I/O (شبكات، ملفات) | Threading |
| CPU Heavy | Multiprocessing |
| مشاريع بسيطة | Threading |
| أداء عالي جدًا | Multiprocessing |

---

# مثال عملي: تحميل ملفات

```python
import threading

import time

def download(file):

    print("Downloading", file)

    time.sleep(2)

    print("Done", file)


files = ["a", "b", "c"]

threads = []

for file in files:

    t = threading.Thread(target=download, args=(file,))

    threads.append(t)

    t.start()

for t in threads:

    t.join()
```

---

# Daemon Threads

تُغلق تلقائيًا عند انتهاء البرنامج.

```python
thread = threading.Thread(target=task, daemon=True)
```

---

# أخطاء شائعة

## استخدام Threads للعمليات الثقيلة

يؤدي إلى أداء ضعيف بسبب GIL.

---

## نسيان join()

قد يؤدي إلى خروج البرنامج قبل انتهاء الـ Threads.

---

## تجاهل Race Conditions

يؤدي إلى نتائج غير صحيحة.

---

# أفضل الممارسات

✅ استخدم Threading للـ I/O فقط.

---

✅ استخدم Multiprocessing للعمليات الحسابية الثقيلة.

---

✅ استخدم Lock لحماية البيانات المشتركة.

---

✅ استخدم Executors بدل إدارة Threads يدويًا في المشاريع الحديثة.

---

# مشروع صغير

محاكاة تحميل 5 ملفات في نفس الوقت:

```python
import threading

import time

def download(file):

    print(f"Start {file}")

    time.sleep(2)

    print(f"Finish {file}")


files = [f"file_{i}" for i in range(5)]

threads = []

for file in files:

    t = threading.Thread(target=download, args=(file,))

    threads.append(t)

    t.start()

for t in threads:

    t.join()

print("All downloads finished")
```

---

# مشروع متقدم

حساب مربعات الأرقام باستخدام multiprocessing:

```python
from multiprocessing import Pool

def square(n):

    return n * n


if __name__ == "__main__":

    with Pool(4) as pool:

        result = pool.map(square, range(20))

    print(result)
```

---

# ملخص

- Concurrency = تنفيذ متداخل.
- Parallelism = تنفيذ فعلي متوازي.
- Threading مناسب للعمليات الخفيفة و I/O.
- Multiprocessing مناسب للعمليات الثقيلة.
- GIL يحد من أداء Threads في العمليات الحسابية.
- استخدم Locks لحماية البيانات المشتركة.

---

# Quiz

## السؤال الأول

أي نوع من التنفيذ يتم على أنوية متعددة فعليًا؟

A) Concurrency

B) Parallelism

C) Sequential

D) Blocking

✅ الإجابة: B

---

## السؤال الثاني

أي مكتبة تستخدم لإنشاء Threads؟

A) multiprocessing

B) threading

C) os

D) sys

✅ الإجابة: B

---

## السؤال الثالث

ما وظيفة Lock؟

A) زيادة السرعة

B) حماية البيانات المشتركة

C) حذف Threads

D) إنشاء Processes

✅ الإجابة: B

---

## السؤال الرابع

في أي حالة نستخدم multiprocessing؟

A) I/O

B) CPU-heavy tasks

C) طباعة نصوص فقط

D) ملفات صغيرة

✅ الإجابة: B

---

# Challenge

أنشئ برنامج يقوم بـ:

1. تحميل 10 ملفات (محاكاة باستخدام sleep).
2. تنفيذ التحميل باستخدام Threads.
3. تنفيذ نفس المهمة باستخدام Processes.
4. مقارنة الزمن بين الطريقتين.
5. استخدام Lock لحماية عداد مشترك.

**تحدٍ إضافي:** أنشئ نظام Queue بسيط لتوزيع المهام بين Threads بشكل متوازن.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Thread | خيط تنفيذ |
| Process | عملية |
| Concurrency | التزامن |
| Parallelism | التنفيذ المتوازي |
| GIL | قفل المفسر العام |
| Lock | قفل حماية |
| Race Condition | حالة سباق |
| Pool | مجموعة عمليات |
| Daemon Thread | خيط خلفي |
| Executor | مدير تنفيذ |

---

# الدرس القادم

**37 - Advanced OOP Design Patterns**

ستتعلم أهم أنماط التصميم (Design Patterns) مثل Singleton، Factory، Observer، Strategy، وكيفية استخدامها لبناء أنظمة احترافية قابلة للتوسع والصيانة في المشاريع الكبيرة.