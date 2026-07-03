# 26-Object-Oriented-Programming-Part-1.md

> مستوى الدرس: متوسط
>
> مدة القراءة: 120-150 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم البرمجة كائنية التوجه (OOP).
- معرفة الفرق بين Class و Object.
- إنشاء Classes خاصة بك.
- إنشاء Objects متعددة.
- استخدام Constructor (`__init__`).
- إنشاء Attributes.
- إنشاء Methods.
- استخدام `self`.
- فهم فوائد OOP في المشاريع الكبيرة.

---

# مقدمة

حتى الآن كنا نكتب البرامج بهذا الشكل:

```python
name = "Ahmed"

age = 20

grade = 95
```

لكن ماذا لو كان لدينا:

- 10,000 طالب.
- 5,000 منتج.
- 50,000 مستخدم.

هل سننشئ آلاف المتغيرات؟

بالطبع لا.

الحل هو:

```
Object-Oriented Programming
```

أو اختصارًا:

```
OOP
```

---

# ما هي OOP؟

هي طريقة لتنظيم البرامج باستخدام:

- Objects
- Classes

بدلًا من كتابة كل شيء داخل متغيرات ودوال منفصلة.

---

# مثال من الواقع

تخيل سيارة.

السيارة لها:

خصائص:

- اللون.
- السرعة.
- الشركة.

ولها وظائف:

- تشغيل.
- إيقاف.
- تسريع.

في البرمجة:

السيارة تصبح Object.

ووصف السيارة يصبح Class.

---

# ما هو Class؟

الـ Class هو:

> قالب (Blueprint) لإنشاء Objects.

---

مثال

```
Class

↓

Student
```

---

منه ننشئ:

```
Ahmed

Sara

Ali
```

كل واحد منهم Object.

---

# إنشاء Class

```python
class Student:

    pass
```

---

# إنشاء Object

```python
student1 = Student()

student2 = Student()
```

كل Object مستقل عن الآخر.

---

# طباعة Object

```python
print(student1)
```

ستظهر معلومات عن الكائن مثل موقعه في الذاكرة.

---

# Constructor

كل Class يمكن أن تحتوي على Constructor.

اسمه:

```python
__init__()
```

ويُستدعى تلقائيًا عند إنشاء الكائن.

---

# مثال

```python
class Student:

    def __init__(self):

        print("Student Created")
```

---

عند إنشاء الكائن:

```python
student = Student()
```

الناتج:

```
Student Created
```

---

# self

`self` يشير إلى الكائن الحالي الذي تعمل عليه الدالة.

تستخدم للوصول إلى خصائص وطرق (Methods) نفس الكائن.

---

# إنشاء Attributes

```python
class Student:

    def __init__(self):

        self.name = "Ahmed"

        self.age = 20
```

---

الوصول إليها

```python
student = Student()

print(student.name)
```

---

# تمرير بيانات

```python
class Student:

    def __init__(self, name, age):

        self.name = name

        self.age = age
```

---

الإنشاء

```python
student = Student("Ahmed",20)
```

---

الوصول

```python
print(student.name)

print(student.age)
```

---

# إنشاء أكثر من Object

```python
student1 = Student("Ahmed",20)

student2 = Student("Sara",22)

student3 = Student("Ali",19)
```

كل كائن يحتفظ ببياناته الخاصة.

---

# Methods

الدالة داخل Class تسمى Method.

---

مثال

```python
class Student:

    def __init__(self,name):

        self.name = name

    def say_hello(self):

        print("Hello")
```

---

الاستخدام

```python
student = Student("Ahmed")

student.say_hello()
```

---

يمكنها استخدام بيانات الكائن.

```python
class Student:

    def __init__(self,name):

        self.name = name

    def introduce(self):

        print(f"My Name Is {self.name}")
```

---

الاستخدام

```python
student = Student("Ahmed")

student.introduce()
```

الناتج:

```
My Name Is Ahmed
```

---

# أكثر من Method

```python
class Car:

    def start(self):

        print("Engine Started")

    def stop(self):

        print("Engine Stopped")
```

---

# تعديل البيانات

```python
student.name = "Ali"
```

---

# حذف خاصية

```python
del student.name
```

إذا حاولت الوصول إليها بعد ذلك سيظهر:

```
AttributeError
```

---

# حذف Object

```python
del student
```

بعدها لا يمكن استخدام الكائن مرة أخرى.

---

# مقارنة بين Class و Object

| Class | Object |
|--------|---------|
| قالب | نسخة من القالب |
| يحدد الشكل والسلوك | يحتوي على بيانات فعلية |
| ينشأ مرة واحدة غالبًا | يمكن إنشاء عدد كبير منه |

---

# مثال عملي

```python
class Book:

    def __init__(self,title,author):

        self.title = title

        self.author = author

    def display(self):

        print(f"{self.title} - {self.author}")
```

---

الاستخدام

```python
book1 = Book("Python Basics","Ahmed")

book2 = Book("Algorithms","Sara")

book1.display()

book2.display()
```

---

# مثال

```python
class Rectangle:

    def __init__(self,width,height):

        self.width = width

        self.height = height

    def area(self):

        return self.width * self.height
```

---

الاستخدام

```python
rectangle = Rectangle(10,5)

print(rectangle.area())
```

الناتج:

```
50
```

---

# أخطاء شائعة

## نسيان self

❌

```python
def hello():
```

الصحيح:

```python
def hello(self):
```

---

## نسيان تمرير القيم

```python
Student()
```

إذا كان الـ Constructor يتطلب:

```python
name

age
```

فسيظهر:

```
TypeError
```

---

## استخدام خاصية غير موجودة

```python
student.grade
```

إذا لم يتم تعريفها سيظهر:

```
AttributeError
```

---

# أفضل الممارسات

✅ اجعل اسم الـ Class يبدأ بحرف كبير (PascalCase).

```python
Student

Car

BankAccount
```

---

✅ اجعل أسماء الـ Methods بصيغة `snake_case`.

```python
calculate_area()

print_details()
```

---

✅ اجعل كل Class مسؤولًا عن شيء واحد فقط.

---

# مشروع صغير

```python
class Student:

    def __init__(self,name,grade):

        self.name = name

        self.grade = grade

    def display(self):

        print(f"Name: {self.name}")

        print(f"Grade: {self.grade}")


student1 = Student("Ahmed",95)

student2 = Student("Sara",88)

student1.display()

student2.display()
```

---

# ملخص

- Class هو قالب لإنشاء Objects.
- Object هو نسخة من الـ Class.
- يستخدم `__init__` لتهيئة الكائن عند إنشائه.
- يستخدم `self` للوصول إلى خصائص وطرق الكائن الحالي.
- تساعد OOP على تنظيم المشاريع الكبيرة وجعل الكود أكثر قابلية لإعادة الاستخدام.

---

# Quiz

## السؤال الأول

ما هو Class؟

A) متغير.

B) قالب لإنشاء Objects.

C) دالة.

D) حلقة.

✅ الإجابة: B

---

## السؤال الثاني

أي Method تُستدعى تلقائيًا عند إنشاء Object؟

A) start()

B) create()

C) __init__()

D) main()

✅ الإجابة: C

---

## السؤال الثالث

ما وظيفة `self`؟

A) حذف الكائن.

B) الإشارة إلى الكائن الحالي.

C) إنشاء Class.

D) استيراد مكتبة.

✅ الإجابة: B

---

## السؤال الرابع

أي اسم يتبع أفضل الممارسات لاسم Class؟

A) student

B) STUDENT

C) Student

D) student_class

✅ الإجابة: C

---

# Challenge

أنشئ Class باسم `Employee`.

يحتوي على:

- الاسم.
- العمر.
- الراتب.
- الوظيفة.

ثم:

1. أنشئ Constructor يستقبل هذه البيانات.
2. أنشئ Method لعرض بيانات الموظف.
3. أنشئ Method لحساب الراتب السنوي.
4. أنشئ ثلاثة Objects ببيانات مختلفة.
5. اعرض بيانات جميع الموظفين ورواتبهم السنوية.

**تحدٍ إضافي:** أضف Method لتحديث الراتب بنسبة مئوية (مثل زيادة 10%) ثم اعرض الراتب الجديد.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Object-Oriented Programming (OOP) | البرمجة كائنية التوجه |
| Class | فئة / قالب |
| Object | كائن |
| Constructor | المُهيئ |
| Attribute | خاصية |
| Method | دالة داخل Class |
| Instance | نسخة من الـ Class |
| Instance Variable | خاصية خاصة بكل كائن |
| self | مرجع إلى الكائن الحالي |
| Blueprint | مخطط / قالب |

---

# الدرس القادم

**27 - Object-Oriented Programming (OOP) - Part 2**

ستتعلم المفاهيم الأساسية الأربعة في OOP: **Encapsulation** و**Inheritance** و**Polymorphism** و**Abstraction**، بالإضافة إلى استخدام `super()` وطرق إعادة استخدام الكود وبناء هياكل برمجية احترافية.