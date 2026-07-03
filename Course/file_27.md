# 27-Object-Oriented-Programming-Part-2.md

> مستوى الدرس: متوسط → متقدم
>
> مدة القراءة: 140-170 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم الوراثة (Inheritance).
- استخدام `super()`.
- فهم التغليف (Encapsulation).
- التعرف على مستويات الوصول للبيانات.
- فهم تعدد الأشكال (Polymorphism).
- التعرف على التجريد (Abstraction).
- استخدام Abstract Classes.
- كتابة كود أكثر احترافية وقابلًا لإعادة الاستخدام.

---

# مقدمة

في الدرس السابق تعلمنا:

- Class
- Object
- Constructor
- Attributes
- Methods

الآن سنتعلم أهم أربع مفاهيم في OOP.

وتسمى:

```
The Four Pillars Of OOP
```

وهي:

- Encapsulation
- Inheritance
- Polymorphism
- Abstraction

هذه المفاهيم تستخدم في جميع لغات البرمجة الحديثة تقريبًا.

---

# أولًا: Inheritance

تعني:

أن Class جديدة يمكنها الاستفادة من Class موجودة بالفعل.

بدلًا من إعادة كتابة نفس الكود.

---

# مثال من الواقع

لدينا:

```
Animal
```

ومنها:

```
Dog

Cat

Bird
```

جميعها:

- تتحرك.
- تتنفس.
- تأكل.

إذن لماذا نكرر الكود؟

---

# إنشاء Class أساسية

```python
class Animal:

    def eat(self):

        print("Eating")
```

---

# إنشاء Class ترث منها

```python
class Dog(Animal):

    pass
```

---

الاستخدام

```python
dog = Dog()

dog.eat()
```

الناتج:

```
Eating
```

---

# إضافة Methods جديدة

```python
class Dog(Animal):

    def bark(self):

        print("Woof")
```

---

الاستخدام

```python
dog.bark()

dog.eat()
```

---

# الوراثة متعددة المستويات

```python
class A:

    pass


class B(A):

    pass


class C(B):

    pass
```

---

# التحقق من نوع الكائن

```python
dog = Dog()

print(isinstance(dog, Dog))

print(isinstance(dog, Animal))
```

الناتج:

```
True

True
```

---

# super()

تستخدم لاستدعاء عناصر الـ Parent Class.

---

مثال

```python
class Animal:

    def __init__(self,name):

        self.name = name
```

---

```python
class Dog(Animal):

    def __init__(self,name):

        super().__init__(name)
```

---

# مثال كامل

```python
class Animal:

    def __init__(self,name):

        self.name = name

    def speak(self):

        print("Animal Sound")


class Dog(Animal):

    def __init__(self,name):

        super().__init__(name)

    def bark(self):

        print("Woof")
```

---

# Method Overriding

يمكن إعادة تعريف Method داخل الـ Child.

```python
class Animal:

    def speak(self):

        print("Animal")
```

---

```python
class Dog(Animal):

    def speak(self):

        print("Woof")
```

---

الاستخدام

```python
dog = Dog()

dog.speak()
```

الناتج:

```
Woof
```

---

يمكن أيضًا استدعاء نسخة الأب داخل الدالة:

```python
class Dog(Animal):

    def speak(self):

        super().speak()

        print("Woof")
```

---

# ثانيًا: Encapsulation

تعني:

إخفاء تفاصيل التنفيذ الداخلية وحماية البيانات من التعديل غير المقصود.

في Python تعتمد هذه الفكرة غالبًا على **اتفاقيات التسمية**، وليست حماية صارمة كما في بعض اللغات الأخرى.

---

# Public Attribute

```python
class Student:

    def __init__(self):

        self.name = "Ahmed"
```

يمكن الوصول إليها مباشرة.

---

# Protected Attribute

يبدأ بشرطة سفلية واحدة.

```python
self._grade
```

هذه إشارة للمبرمجين بأنها للاستخدام الداخلي، لكن ما زال بالإمكان الوصول إليها.

---

# Private Attribute

```python
self.__password
```

تطبق Python ما يسمى **Name Mangling** لتقليل الوصول غير المقصود إليها.

---

مثال

```python
class Account:

    def __init__(self):

        self.__balance = 1000
```

---

محاولة الوصول مباشرة:

```python
account.__balance
```

ستؤدي إلى:

```
AttributeError
```

---

# Getter

```python
class Account:

    def __init__(self):

        self.__balance = 1000

    def get_balance(self):

        return self.__balance
```

---

# Setter

```python
class Account:

    def set_balance(self,amount):

        if amount >= 0:

            self.__balance = amount
```

---

الاستخدام

```python
account = Account()

account.set_balance(500)

print(account.get_balance())
```

---

# استخدام Property

الطريقة الحديثة في Python.

```python
class Account:

    def __init__(self):

        self.__balance = 0

    @property
    def balance(self):

        return self.__balance

    @balance.setter
    def balance(self,value):

        if value >= 0:

            self.__balance = value
```

---

الاستخدام

```python
account = Account()

account.balance = 500

print(account.balance)
```

---

# ثالثًا: Polymorphism

تعني:

وجود نفس الاسم لكن بسلوك مختلف.

---

مثال

```python
class Dog:

    def speak(self):

        print("Woof")


class Cat:

    def speak(self):

        print("Meow")
```

---

```python
animals = [

    Dog(),

    Cat()
]

for animal in animals:

    animal.speak()
```

الناتج:

```
Woof

Meow
```

لا نهتم بنوع الكائن، المهم أنه يوفر الدالة المطلوبة.

---

# مثال آخر

```python
print(len("Python"))

print(len([1,2,3]))
```

نفس الدالة.

لكنها تعمل بطريقة مختلفة حسب نوع البيانات.

---

# رابعًا: Abstraction

تعني:

إظهار ما يحتاجه المستخدم فقط.

وإخفاء التفاصيل الداخلية.

---

مثال

عند قيادة سيارة.

أنت تضغط دواسة الوقود.

ولا تحتاج لمعرفة كيف يعمل المحرك.

---

# Abstract Class

```python
from abc import ABC, abstractmethod
```

---

إنشاء Abstract Class

```python
from abc import ABC, abstractmethod

class Animal(ABC):

    @abstractmethod
    def speak(self):

        pass
```

---

الوراثة

```python
class Dog(Animal):

    def speak(self):

        print("Woof")
```

---

إذا لم تنفذ جميع الدوال المجردة فلن تتمكن من إنشاء كائن من الفئة الابنة.

---

# مثال شامل

```python
from abc import ABC, abstractmethod

class Shape(ABC):

    @abstractmethod
    def area(self):

        pass


class Rectangle(Shape):

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

---

# مقارنة المفاهيم

| المفهوم | الهدف |
|----------|--------|
| Inheritance | إعادة استخدام الكود |
| Encapsulation | حماية البيانات وتنظيم الوصول إليها |
| Polymorphism | نفس الواجهة مع سلوك مختلف |
| Abstraction | إخفاء تفاصيل التنفيذ |

---

# مثال عملي

```python
class Employee:

    def __init__(self,name):

        self.name = name

    def work(self):

        print("Working")


class Programmer(Employee):

    def work(self):

        print("Writing Code")


class Designer(Employee):

    def work(self):

        print("Designing UI")
```

---

الاستخدام

```python
employees = [

    Programmer("Ahmed"),

    Designer("Sara")
]

for employee in employees:

    employee.work()
```

---

# أخطاء شائعة

## نسيان استدعاء Constructor الأب

إذا كان الأب يحتاج إلى تهيئة بيانات، فاستخدم:

```python
super().__init__(...)
```

---

## استخدام Private Attribute مباشرة

يفضل استخدام Getter/Setter أو Properties عند الحاجة.

---

## عدم تنفيذ Abstract Method

سيؤدي إلى خطأ عند محاولة إنشاء الكائن.

---

# أفضل الممارسات

✅ استخدم الوراثة عندما توجد علاقة **is-a** حقيقية.

---

✅ لا تفرط في الوراثة إذا كان التركيب (Composition) أنسب.

---

✅ استخدم Properties بدلًا من Getter وSetter التقليديين في Python عندما يكون ذلك مناسبًا.

---

✅ اجعل الفئات مسؤولة عن مهمة واحدة قدر الإمكان.

---

# مشروع صغير

```python
from abc import ABC, abstractmethod

class Vehicle(ABC):

    @abstractmethod
    def move(self):

        pass


class Car(Vehicle):

    def move(self):

        print("Driving")


class Plane(Vehicle):

    def move(self):

        print("Flying")


vehicles = [

    Car(),

    Plane()
]

for vehicle in vehicles:

    vehicle.move()
```

---

# ملخص

- تسمح الوراثة بإعادة استخدام الكود.
- يستخدم `super()` للوصول إلى عناصر الفئة الأب.
- يساعد التغليف على تنظيم الوصول إلى البيانات.
- يسمح تعدد الأشكال باستخدام واجهة واحدة مع تطبيقات مختلفة.
- يوفر التجريد واجهات واضحة ويخفي تفاصيل التنفيذ.

---

# Quiz

## السؤال الأول

أي مفهوم يسمح بإعادة استخدام كود الفئة الأب؟

A) Encapsulation

B) Abstraction

C) Inheritance

D) Polymorphism

✅ الإجابة: C

---

## السؤال الثاني

ما وظيفة `super()`؟

A) حذف الكائن.

B) استدعاء عناصر الفئة الأب.

C) إنشاء Class.

D) إنشاء Object.

✅ الإجابة: B

---

## السؤال الثالث

أي مكتبة تستخدم لإنشاء Abstract Classes؟

A) math

B) abc

C) os

D) random

✅ الإجابة: B

---

## السؤال الرابع

أي مفهوم يعني أن نفس الدالة قد تتصرف بشكل مختلف حسب نوع الكائن؟

A) Encapsulation

B) Inheritance

C) Abstraction

D) Polymorphism

✅ الإجابة: D

---

# Challenge

أنشئ نظامًا لإدارة الموظفين.

1. أنشئ Abstract Class باسم `Employee`.
2. أنشئ دالة مجردة باسم `calculate_salary()`.
3. أنشئ فئتين:
   - `FullTimeEmployee`
   - `PartTimeEmployee`
4. نفذ `calculate_salary()` بطريقة مختلفة في كل فئة.
5. استخدم قائمة تحتوي على أنواع مختلفة من الموظفين، ثم اعرض رواتبهم باستخدام Polymorphism.

**تحدٍ إضافي:** أضف خاصية `salary` باستخدام `@property` مع التحقق من أن الراتب لا يكون سالبًا.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Inheritance | الوراثة |
| Parent Class | الفئة الأب |
| Child Class | الفئة الابنة |
| Override | إعادة تعريف |
| Encapsulation | التغليف |
| Polymorphism | تعدد الأشكال |
| Abstraction | التجريد |
| Abstract Class | فئة مجردة |
| Property | خاصية مُدارة |
| super() | استدعاء الفئة الأب |

---

# الدرس القادم

**28 - Virtual Environments & Pip**

ستتعلم كيفية إنشاء بيئات افتراضية (Virtual Environments)، وإدارة الحزم باستخدام `pip`، وإنشاء ملفات `requirements.txt`، وهي مهارات أساسية لبناء مشاريع Python احترافية ومشاركتها مع الآخرين.