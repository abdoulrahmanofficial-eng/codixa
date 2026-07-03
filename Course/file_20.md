# 20-Lists.md

> مستوى الدرس: مبتدئ → متوسط
>
> مدة القراءة: 90-110 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم القوائم (Lists).
- إنشاء القوائم والتعامل معها.
- الوصول إلى العناصر باستخدام الفهارس.
- تعديل العناصر وإضافتها وحذفها.
- استخدام أشهر دوال القوائم.
- المرور على عناصر القائمة باستخدام الحلقات.
- فهم الفرق بين القوائم والكائنات النصية.
- إنشاء تطبيقات عملية تعتمد على القوائم.

---

# مقدمة

حتى الآن، كنا نخزن قيمة واحدة داخل المتغير.

مثال:

```python
student = "Ahmed"
```

لكن ماذا لو أردنا تخزين:

- 100 طالب.
- 500 منتج.
- 1000 رقم.

هل سننشئ 1000 متغير؟

بالطبع لا.

لهذا نستخدم **Lists**.

---

# ما هي List؟

القائمة (List) هي مجموعة مرتبة من العناصر يمكن تخزينها داخل متغير واحد.

يمكن أن تحتوي على:

- أرقام.
- نصوص.
- قيم منطقية.
- قوائم أخرى.
- أو مزيج من كل ذلك.

---

# إنشاء قائمة

```python
numbers = [10, 20, 30, 40]
```

---

قائمة نصوص

```python
students = ["Ahmed", "Sara", "Ali"]
```

---

قائمة مختلطة

```python
data = ["Ahmed", 20, True, 95.5]
```

رغم أن Python تسمح بذلك، يفضل أن تحتوي القائمة على عناصر من نفس النوع عندما يكون ذلك منطقيًا.

---

# الفهرسة (Indexing)

كل عنصر له رقم يبدأ من:

```
0
```

مثال:

```python
students = ["Ahmed", "Sara", "Ali"]
```

```
Ahmed   Sara   Ali

0       1      2
```

---

الوصول إلى عنصر

```python
print(students[0])
```

الناتج:

```
Ahmed
```

---

آخر عنصر

```python
print(students[-1])
```

الناتج:

```
Ali
```

---

# تعديل عنصر

```python
students[1] = "Mona"

print(students)
```

الناتج:

```
['Ahmed', 'Mona', 'Ali']
```

على عكس Strings، فإن Lists **قابلة للتعديل (Mutable)**.

---

# طول القائمة

```python
students = ["Ahmed", "Sara", "Ali"]

print(len(students))
```

الناتج:

```
3
```

---

# إضافة عنصر

## append()

تضيف العنصر في نهاية القائمة.

```python
students = ["Ahmed", "Sara"]

students.append("Ali")

print(students)
```

الناتج:

```
['Ahmed', 'Sara', 'Ali']
```

---

## insert()

تضيف العنصر في مكان محدد.

```python
students.insert(1, "Mona")
```

الناتج:

```
['Ahmed', 'Mona', 'Sara']
```

---

# حذف العناصر

## remove()

يحذف أول عنصر مطابق للقيمة.

```python
students.remove("Sara")
```

---

## pop()

يحذف عنصرًا حسب الفهرس ويعيده.

```python
students.pop(0)
```

---

إذا لم تحدد فهرسًا:

```python
students.pop()
```

سيحذف آخر عنصر.

---

## del

```python
del students[1]
```

---

## clear()

يحذف جميع العناصر.

```python
students.clear()
```

---

# البحث

```python
students = ["Ahmed", "Sara", "Ali"]

print("Sara" in students)
```

الناتج:

```
True
```

---

# معرفة الفهرس

```python
students.index("Ali")
```

الناتج:

```
2
```

إذا لم تكن القيمة موجودة، ستظهر رسالة خطأ.

---

# عد العناصر

```python
numbers = [1, 2, 1, 3, 1]

print(numbers.count(1))
```

الناتج:

```
3
```

---

# ترتيب القائمة

```python
numbers = [8, 3, 5, 1]

numbers.sort()

print(numbers)
```

الناتج:

```
[1, 3, 5, 8]
```

---

ترتيب تنازلي

```python
numbers.sort(reverse=True)
```

---

# عكس القائمة

```python
numbers.reverse()
```

---

# نسخ القائمة

❌

```python
list1 = [1, 2, 3]

list2 = list1
```

هنا المتغيران يشيران إلى نفس القائمة.

إذا عدلت إحداهما، ستتغير الأخرى أيضًا.

---

الطريقة الصحيحة:

```python
list2 = list1.copy()
```

---

# التقطيع (Slicing)

```python
numbers = [10, 20, 30, 40, 50]

print(numbers[1:4])
```

الناتج:

```
[20, 30, 40]
```

---

# المرور على القائمة

```python
students = ["Ahmed", "Sara", "Ali"]

for student in students:

    print(student)
```

---

باستخدام الفهرس

```python
for i in range(len(students)):

    print(students[i])
```

---

# جمع العناصر

```python
numbers = [10, 20, 30]

print(sum(numbers))
```

الناتج:

```
60
```

---

# أكبر وأصغر عنصر

```python
numbers = [8, 3, 10]

print(max(numbers))

print(min(numbers))
```

---

# دمج قائمتين

```python
list1 = [1, 2]

list2 = [3, 4]

result = list1 + list2

print(result)
```

الناتج:

```
[1, 2, 3, 4]
```

---

# تكرار القائمة

```python
numbers = [1, 2]

print(numbers * 3)
```

الناتج:

```
[1, 2, 1, 2, 1, 2]
```

---

# القوائم المتداخلة

```python
matrix = [

    [1, 2],

    [3, 4]
]
```

الوصول إلى العنصر:

```python
print(matrix[1][0])
```

الناتج:

```
3
```

---

# مثال عملي

برنامج لإدارة الطلاب.

```python
students = []

students.append("Ahmed")

students.append("Sara")

students.append("Ali")

for student in students:

    print(student)
```

---

# مثال

حساب المتوسط.

```python
grades = [90, 85, 70, 100]

average = sum(grades) / len(grades)

print(average)
```

---

# مثال

إيجاد أكبر رقم.

```python
numbers = [5, 10, 3, 20]

print(max(numbers))
```

---

# أخطاء شائعة

## استخدام فهرس غير موجود

```python
numbers = [1, 2]

print(numbers[5])
```

سيظهر:

```
IndexError
```

---

## استخدام remove() لقيمة غير موجودة

سيظهر خطأ.

يمكن التحقق أولًا:

```python
if "Sara" in students:
    students.remove("Sara")
```

---

## نسيان copy()

قد يؤدي إلى تعديل قائمتين في الوقت نفسه دون قصد.

---

# أفضل الممارسات

✅ استخدم أسماء واضحة للقوائم مثل:

```python
students

products

grades
```

---

✅ تحقق من وجود العنصر قبل حذفه أو البحث عن فهرسه.

---

✅ استخدم `append()` لإضافة عنصر واحد في نهاية القائمة، واستخدم `extend()` إذا أردت إضافة عدة عناصر من قائمة أخرى.

---

# مشروع صغير

برنامج بسيط لإدارة قائمة مهام.

```python
tasks = []

tasks.append("Study Python")
tasks.append("Read Book")
tasks.append("Exercise")

print("Tasks:")

for task in tasks:
    print("-", task)

tasks.remove("Read Book")

print("\nUpdated Tasks:")

for task in tasks:
    print("-", task)
```

---

# ملخص

- القائمة هي مجموعة مرتبة وقابلة للتعديل من العناصر.
- تبدأ الفهارس من الصفر.
- يمكن إضافة العناصر باستخدام `append()` و`insert()`.
- يمكن حذف العناصر باستخدام `remove()` و`pop()` و`del()`.
- توفر Python العديد من الدوال المفيدة للتعامل مع القوائم مثل `sort()` و`reverse()` و`count()`.

---

# Quiz

## السؤال الأول

أي رمز يستخدم لإنشاء قائمة؟

A)

```python
()
```

B)

```python
{}
```

C)

```python
[]
```

D)

```python
<>
```

✅ الإجابة: C

---

## السؤال الثاني

ما الدالة التي تضيف عنصرًا في نهاية القائمة؟

A) insert()

B) append()

C) add()

D) push()

✅ الإجابة: B

---

## السؤال الثالث

ما ناتج:

```python
numbers = [10, 20, 30]

print(numbers[-1])
```

A) 10

B) 20

C) 30

D) Error

✅ الإجابة: C

---

## السؤال الرابع

أي دالة ترتب القائمة تصاعديًا؟

A) reverse()

B) order()

C) arrange()

D) sort()

✅ الإجابة: D

---

# Challenge

أنشئ برنامجًا لإدارة قائمة درجات الطلاب.

1. أنشئ قائمة فارغة.
2. اطلب من المستخدم إدخال 5 درجات وأضفها إلى القائمة.
3. اعرض جميع الدرجات.
4. اعرض أعلى درجة وأقل درجة.
5. احسب المتوسط.
6. رتب الدرجات تصاعديًا ثم تنازليًا.
7. اطبع عدد الدرجات التي تساوي 100 إن وجدت.

**تحدٍ إضافي:** اسمح للمستخدم بإدخال درجة جديدة، ثم أدرجها في المكان الصحيح بحيث تظل القائمة مرتبة.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| List | قائمة |
| Mutable | قابل للتعديل |
| Element | عنصر |
| Index | فهرس |
| Append | إضافة في النهاية |
| Insert | إدراج |
| Remove | حذف |
| Pop | إزالة وإرجاع عنصر |
| Sort | ترتيب |
| Slice | تقطيع |

---

# الدرس القادم

**21 - Tuples & Sets**

ستتعلم نوعين مهمين من هياكل البيانات في Python: **Tuples** لتخزين بيانات ثابتة لا تتغير، و**Sets** لتخزين عناصر فريدة وتنفيذ عمليات مثل الاتحاد والتقاطع، مع مقارنة شاملة بين Lists وTuples وSets ومتى تستخدم كل نوع.