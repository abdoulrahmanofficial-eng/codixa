# 22-Dictionaries.md

> مستوى الدرس: مبتدئ → متوسط
>
> مدة القراءة: 90-110 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم Dictionaries.
- إنشاء Dictionary والتعامل معه.
- إضافة البيانات وتعديلها وحذفها.
- الوصول إلى القيم بأكثر من طريقة.
- استخدام أشهر دوال القواميس.
- المرور على المفاتيح والقيم.
- إنشاء Dictionaries متداخلة.
- فهم الفرق بين List و Tuple و Set و Dictionary.
- بناء تطبيقات عملية تعتمد على القواميس.

---

# مقدمة

حتى الآن تعلمنا:

- Variables
- Lists
- Tuples
- Sets

لكن جميع هذه الأنواع تعتمد على **الفهرس (Index)** للوصول إلى البيانات.

ماذا لو أردنا تخزين بيانات طالب؟

```
الاسم

العمر

المدينة

الدرجة
```

يمكننا استخدام List:

```python
student = ["Ahmed", 20, "Cairo", 95]
```

لكن كيف سنعرف أن:

```
20
```

هو العمر؟

أو أن:

```
95
```

هي الدرجة؟

الأفضل هو استخدام **Dictionary**.

---

# ما هو Dictionary؟

Dictionary هو هيكل بيانات يخزن المعلومات على شكل:

```
Key → Value
```

مثل:

```
Name → Ahmed

Age → 20

City → Cairo
```

كل قيمة لها مفتاح خاص بها.

---

# إنشاء Dictionary

```python
student = {

    "name": "Ahmed",

    "age": 20,

    "city": "Cairo"
}
```

---

# الوصول إلى القيم

```python
print(student["name"])
```

الناتج:

```
Ahmed
```

---

```python
print(student["age"])
```

الناتج:

```
20
```

---

# استخدام get()

```python
print(student.get("city"))
```

---

إذا لم يكن المفتاح موجودًا:

```python
print(student.get("phone"))
```

الناتج:

```
None
```

---

يمكن تحديد قيمة افتراضية.

```python
print(student.get("phone", "Not Found"))
```

الناتج:

```
Not Found
```

---

# إضافة عنصر جديد

```python
student["grade"] = 95
```

---

الناتج:

```python
{

'name':'Ahmed',

'age':20,

'city':'Cairo',

'grade':95

}
```

---

# تعديل قيمة

```python
student["age"] = 21
```

---

# حذف عنصر

```python
del student["city"]
```

---

أو:

```python
student.pop("age")
```

---

# حذف آخر عنصر

```python
student.popitem()
```

> في الإصدارات الحديثة من Python، يحذف `popitem()` آخر زوج (مفتاح/قيمة) تمت إضافته.

---

# حذف جميع البيانات

```python
student.clear()
```

---

# معرفة المفاتيح

```python
student.keys()
```

---

# معرفة القيم

```python
student.values()
```

---

# معرفة الأزواج

```python
student.items()
```

---

# المرور على المفاتيح

```python
for key in student:

    print(key)
```

---

# المرور على القيم

```python
for value in student.values():

    print(value)
```

---

# المرور على المفتاح والقيمة

```python
for key, value in student.items():

    print(key, value)
```

---

الناتج:

```
name Ahmed

age 20

city Cairo
```

---

# التحقق من وجود مفتاح

```python
if "name" in student:

    print("Exists")
```

---

# نسخ Dictionary

```python
student2 = student.copy()
```

---

# دمج Dictionaries

```python
student.update({

    "grade":95,

    "city":"Alexandria"

})
```

إذا كان المفتاح موجودًا، سيتم تحديث قيمته.

إذا لم يكن موجودًا، سيتم إضافته.

---

# Dictionary متداخل

```python
students = {

    "student1": {

        "name":"Ahmed",

        "age":20

    },

    "student2": {

        "name":"Sara",

        "age":21

    }

}
```

---

الوصول إلى البيانات

```python
print(students["student1"]["name"])
```

الناتج:

```
Ahmed
```

---

# قائمة من Dictionaries

وهي من أكثر الأنماط استخدامًا في التطبيقات.

```python
students = [

    {

        "name":"Ahmed",

        "grade":90

    },

    {

        "name":"Sara",

        "grade":95

    }

]
```

---

المرور عليها

```python
for student in students:

    print(student["name"])
```

---

# مثال عملي

برنامج بيانات طالب.

```python
student = {}

student["name"] = input("Name: ")

student["age"] = int(input("Age: "))

student["grade"] = float(input("Grade: "))

print(student)
```

---

# مثال

طباعة البيانات بشكل منظم.

```python
for key, value in student.items():

    print(f"{key}: {value}")
```

---

# مثال

حساب متوسط درجات الطلاب.

```python
grades = {

    "Ahmed":90,

    "Sara":80,

    "Ali":100

}

average = sum(grades.values()) / len(grades)

print(average)
```

---

# مقارنة بين الهياكل

| النوع | يعتمد على Index | يقبل التعديل | يسمح بالتكرار |
|--------|-----------------|--------------|----------------|
| List | ✅ | ✅ | ✅ |
| Tuple | ✅ | ❌ | ✅ |
| Set | ❌ | ✅ | ❌ |
| Dictionary | ❌ (يعتمد على Key) | ✅ | المفاتيح لا تتكرر |

> **ملاحظة:** لا يمكن تكرار المفاتيح (Keys)، أما القيم (Values) فيمكن أن تتكرر.

---

# متى أستخدم Dictionary؟

عندما تكون البيانات عبارة عن خصائص مرتبطة ببعضها.

مثل:

- بيانات طالب.
- بيانات منتج.
- بيانات موظف.
- إعدادات التطبيق.
- استجابات API.
- ملفات JSON.

---

# أخطاء شائعة

## الوصول إلى مفتاح غير موجود

❌

```python
print(student["phone"])
```

قد يظهر:

```
KeyError
```

---

يفضل:

```python
student.get("phone")
```

---

## تكرار نفس المفتاح

```python
student = {

    "name":"Ahmed",

    "name":"Ali"
}
```

ستكون القيمة الأخيرة هي المستخدمة.

---

## استخدام List كمفتاح

❌

```python
{

[1,2]:"value"

}
```

غير مسموح لأن List قابلة للتعديل.

---

# أفضل الممارسات

✅ استخدم أسماء مفاتيح واضحة مثل:

```python
"name"

"email"

"price"

"quantity"
```

---

✅ استخدم `get()` عندما لا تكون متأكدًا من وجود المفتاح.

---

✅ استخدم `items()` عند الحاجة إلى المفتاح والقيمة معًا أثناء التكرار.

---

# مشروع صغير

برنامج لإدارة بيانات طالب.

```python
student = {

    "name": input("Name: "),

    "age": int(input("Age: ")),

    "grade": float(input("Grade: ")),

    "city": input("City: ")
}

print("\nStudent Information")

for key, value in student.items():

    print(f"{key}: {value}")
```

---

# ملخص

- Dictionary يخزن البيانات على شكل **Key → Value**.
- يتم الوصول إلى البيانات باستخدام المفتاح وليس الفهرس.
- المفاتيح يجب أن تكون فريدة.
- يمكن إضافة البيانات وتعديلها وحذفها بسهولة.
- يستخدم Dictionary بكثرة في تطوير التطبيقات الحقيقية.

---

# Quiz

## السؤال الأول

أي رمز يستخدم لإنشاء Dictionary؟

A)

```python
[]
```

B)

```python
()
```

C)

```python
{}
```

D)

```python
<>
```

✅ الإجابة: C

---

## السؤال الثاني

أي دالة تستخدم للحصول على قيمة مفتاح بدون ظهور خطأ إذا لم يكن موجودًا؟

A) value()

B) find()

C) get()

D) search()

✅ الإجابة: C

---

## السؤال الثالث

ما ناتج:

```python
student = {

    "name":"Ahmed"

}

print(student.get("age"))
```

A)

```
0
```

B)

```
Error
```

C)

```
None
```

D)

```
False
```

✅ الإجابة: C

---

## السؤال الرابع

أي دالة تعيد جميع أزواج المفتاح والقيمة؟

A) keys()

B) values()

C) items()

D) pairs()

✅ الإجابة: C

---

# Challenge

أنشئ برنامجًا لإدارة بيانات 5 طلاب.

لكل طالب خزّن:

- الاسم.
- العمر.
- الدرجة.
- المدينة.

ثم:

1. اعرض جميع الطلاب.
2. احسب متوسط الدرجات.
3. اعرض الطالب صاحب أعلى درجة.
4. اعرض أسماء الطلاب الذين حصلوا على 90 أو أكثر.
5. اسمح للمستخدم بالبحث عن طالب باستخدام اسمه وعرض بياناته إن وجدت.

**تحدٍ إضافي:** أضف خيارًا لتحديث درجة طالب معين بالاسم، ثم أعد عرض بياناته بعد التحديث.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Dictionary | قاموس |
| Key | مفتاح |
| Value | قيمة |
| Key-Value Pair | زوج مفتاح وقيمة |
| Nested Dictionary | قاموس متداخل |
| Items | الأزواج |
| Keys | المفاتيح |
| Values | القيم |
| Lookup | البحث باستخدام المفتاح |
| Mapping | ربط البيانات |

---

# الدرس القادم

**23 - Exception Handling (إدارة الأخطاء)**

ستتعلم كيف تجعل برامجك تتعامل مع الأخطاء بطريقة احترافية باستخدام `try` و`except` و`else` و`finally` و`raise`، بدلًا من توقف البرنامج عند حدوث أي خطأ، وهي مهارة أساسية في تطوير أي تطبيق حقيقي.