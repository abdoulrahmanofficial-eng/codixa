# 37-Advanced-OOP-Design-Patterns.md

> مستوى الدرس: متقدم جدًا
>
> مدة القراءة: 200-240 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم مفهوم Design Patterns.
- معرفة لماذا نستخدم أنماط التصميم.
- تطبيق أشهر أنماط OOP في Python.
- استخدام Singleton Pattern.
- استخدام Factory Pattern.
- استخدام Observer Pattern.
- استخدام Strategy Pattern.
- فهم Dependency Injection.
- كتابة كود قابل للتوسع والصيانة.

---

# مقدمة

في المشاريع الصغيرة، يمكنك كتابة كود بسيط.

لكن في المشاريع الكبيرة:

- آلاف الملفات
- مئات الكلاسات
- فريق عمل كامل

هنا نحتاج إلى طريقة منظمة للتفكير.

هذه الطريقة تسمى:

```
Design Patterns
```

---

# ما هي Design Patterns؟

هي حلول جاهزة لمشاكل برمجية متكررة في التصميم.

ليست كود جاهز، بل **طريقة تفكير وتنظيم**.

---

# لماذا نستخدمها؟

- تقليل التكرار
- تحسين تنظيم الكود
- تسهيل الصيانة
- تسهيل التعاون بين المطورين
- جعل المشروع قابل للتوسع

---

# 1) Singleton Pattern

## الفكرة

ضمان وجود **نسخة واحدة فقط** من الكلاس.

---

## مثال

```python
class Database:

    _instance = None

    def __new__(cls):

        if cls._instance is None:

            cls._instance = super().__new__(cls)

        return cls._instance
```

---

## الاستخدام

```python
db1 = Database()

db2 = Database()

print(db1 is db2)
```

الناتج:

```
True
```

---

## الاستخدام الحقيقي

- Database connection
- Logger
- Configuration manager

---

# 2) Factory Pattern

## الفكرة

إنشاء كائنات بدون تحديد الكلاس مباشرة.

---

## مثال

```python
class Car:

    def drive(self):

        print("Driving Car")


class Bike:

    def drive(self):

        print("Driving Bike")
```

---

## Factory

```python
class VehicleFactory:

    def create_vehicle(self, vehicle_type):

        if vehicle_type == "car":

            return Car()

        elif vehicle_type == "bike":

            return Bike()
```

---

## الاستخدام

```python
factory = VehicleFactory()

vehicle = factory.create_vehicle("car")

vehicle.drive()
```

---

## الفائدة

- فصل منطق الإنشاء عن الاستخدام
- مرونة في إضافة أنواع جديدة

---

# 3) Observer Pattern

## الفكرة

عندما يتغير شيء، يتم إعلام كل المشتركين تلقائيًا.

---

## مثال

```python
class Subject:

    def __init__(self):

        self.observers = []

    def subscribe(self, observer):

        self.observers.append(observer)

    def notify(self, message):

        for observer in self.observers:

            observer.update(message)
```

---

## Observer

```python
class Observer:

    def update(self, message):

        print("Received:", message)
```

---

## الاستخدام

```python
subject = Subject()

obs1 = Observer()

obs2 = Observer()

subject.subscribe(obs1)

subject.subscribe(obs2)

subject.notify("New Update")
```

---

## الاستخدام الحقيقي

- Notifications
- Event systems
- Social media feeds

---

# 4) Strategy Pattern

## الفكرة

تغيير السلوك (Algorithm) أثناء التشغيل.

---

## مثال

```python
class AddStrategy:

    def execute(self, a, b):

        return a + b


class MultiplyStrategy:

    def execute(self, a, b):

        return a * b
```

---

## Context

```python
class Calculator:

    def __init__(self, strategy):

        self.strategy = strategy

    def calculate(self, a, b):

        return self.strategy.execute(a, b)
```

---

## الاستخدام

```python
calc = Calculator(AddStrategy())

print(calc.calculate(5, 3))


calc.strategy = MultiplyStrategy()

print(calc.calculate(5, 3))
```

---

## الفائدة

- تغيير السلوك بدون تعديل الكود الأساسي
- مرونة عالية

---

# 5) Dependency Injection

## الفكرة

بدل أن ينشئ الكلاس الاعتماديات بنفسه، يتم تمريرها له من الخارج.

---

## مثال

```python
class Engine:

    def start(self):

        print("Engine started")
```

---

```python
class Car:

    def __init__(self, engine):

        self.engine = engine

    def start(self):

        self.engine.start()
```

---

## الاستخدام

```python
engine = Engine()

car = Car(engine)

car.start()
```

---

## الفائدة

- سهولة الاختبار
- مرونة عالية
- تقليل الترابط بين الكلاسات

---

# مقارنة سريعة

| Pattern | الاستخدام |
|---------|------------|
| Singleton | نسخة واحدة فقط |
| Factory | إنشاء كائنات |
| Observer | إشعارات وتحديثات |
| Strategy | تغيير السلوك |
| Dependency Injection | تمرير الاعتمادات |

---

# مثال عملي شامل

نظام بسيط لإشعارات المستخدمين

---

## Observer + Factory

```python
class EmailNotifier:

    def send(self, message):

        print("Email:", message)


class SMSNotifier:

    def send(self, message):

        print("SMS:", message)
```

---

## Factory

```python
class NotifierFactory:

    def create(self, type_):

        if type_ == "email":

            return EmailNotifier()

        return SMSNotifier()
```

---

## Observer System

```python
class User:

    def __init__(self, notifier):

        self.notifier = notifier

    def notify(self, message):

        self.notifier.send(message)
```

---

## الاستخدام

```python
factory = NotifierFactory()

notifier = factory.create("email")

user = User(notifier)

user.notify("Welcome!")
```

---

# أخطاء شائعة

## Singleton في كل مكان

❌ استخدامه بشكل مبالغ فيه يسبب مشاكل في الاختبار والتوسعة.

---

## Factory بدون داعي

❌ إذا كان الكود بسيط جدًا، قد يزيد التعقيد بدون فائدة.

---

## تجاهل Dependency Injection

❌ يجعل الكود صعب الاختبار والتعديل.

---

# أفضل الممارسات

✅ استخدم Design Patterns فقط عند الحاجة.

---

✅ لا تفرط في التعقيد.

---

✅ اجعل الكود واضحًا قبل أن يكون "ذكيًا".

---

✅ اختر Pattern يخدم المشكلة وليس العكس.

---

# مشروع صغير

نظام إدارة سيارات

- Factory لإنشاء السيارات
- Strategy لتغيير طريقة القيادة
- Dependency Injection للمحرك

---

```python
class GasEngine:

    def start(self):

        print("Gas engine started")
```

---

```python
class ElectricEngine:

    def start(self):

        print("Electric engine started")
```

---

```python
class Car:

    def __init__(self, engine):

        self.engine = engine

    def drive(self):

        self.engine.start()
```

---

```python
car = Car(GasEngine())

car.drive()
```

---

# ملخص

- Design Patterns هي حلول جاهزة لمشاكل متكررة.
- تساعد على تنظيم الكود في المشاريع الكبيرة.
- أهم الأنماط: Singleton, Factory, Observer, Strategy.
- Dependency Injection يجعل الكود أكثر مرونة.
- لا تستخدم Patterns بدون حاجة.

---

# Quiz

## السؤال الأول

ما هدف Singleton؟

A) إنشاء عدة كائنات

B) إنشاء نسخة واحدة فقط

C) تحسين السرعة

D) حذف الكائنات

✅ الإجابة: B

---

## السؤال الثاني

أي Pattern يستخدم لإنشاء كائنات؟

A) Observer

B) Factory

C) Strategy

D) Singleton

✅ الإجابة: B

---

## السؤال الثالث

ما وظيفة Observer؟

A) إنشاء كائنات

B) تغيير السلوك

C) إرسال إشعارات عند التغيير

D) حذف البيانات

✅ الإجابة: C

---

## السؤال الرابع

ما فائدة Dependency Injection؟

A) زيادة التعقيد

B) جعل الكود أقل مرونة

C) تقليل الترابط بين الكلاسات

D) تسريع Python

✅ الإجابة: C

---

# Challenge

أنشئ نظام متجر إلكتروني:

1. استخدم Factory لإنشاء المنتجات (Book, Phone, Laptop).
2. استخدم Strategy لتطبيق خصومات مختلفة.
3. استخدم Observer لإشعار المستخدم عند توفر منتج.
4. استخدم Dependency Injection لتمرير طرق الدفع (Card / PayPal).
5. اجعل النظام قابل للتوسعة بدون تعديل الكود الأساسي.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Design Pattern | نمط تصميم |
| Singleton | مفرد |
| Factory | مصنع |
| Observer | مراقب |
| Strategy | استراتيجية |
| Dependency Injection | حقن الاعتماديات |
| Coupling | الترابط |
| Cohesion | التماسك |
| Scalability | قابلية التوسع |
| Maintainability | قابلية الصيانة |

---

# الدرس القادم

**38 - API Design & RESTful Services**

ستتعلم كيفية تصميم APIs احترافية، فهم REST Architecture، استخدام HTTP Methods، بناء Endpoints منظمة، والتعامل مع JSON APIs بشكل احترافي في مشاريع Python وWeb.