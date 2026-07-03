# 40-ORMs-and-SQLAlchemy-Advanced.md

> مستوى الدرس: متقدم
>
> مدة القراءة: 190-240 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم ما هو ORM.
- معرفة الفرق بين SQL و ORM.
- استخدام SQLAlchemy في Python.
- إنشاء Models احترافية.
- تنفيذ CRUD بدون كتابة SQL مباشر.
- فهم العلاقات بين الجداول داخل ORM.
- استخدام Session بشكل صحيح.
- بناء نظام قاعدة بيانات كامل بطريقة احترافية.

---

# مقدمة

في الدرس السابق كنا نكتب SQL مباشرة:

```sql
SELECT * FROM students;
```

لكن في المشاريع الكبيرة:

❌ SQL يصبح طويلًا ومعقدًا  
❌ صعب الصيانة  
❌ يتكرر كثيرًا في الكود  

الحل هو:

```
ORM
```

---

# ما هو ORM؟

ORM = Object Relational Mapping

هو طريقة لتحويل:

```
Tables → Objects
```

بدل كتابة SQL، تتعامل مع Python Objects.

---

# مقارنة

## SQL

```sql
SELECT * FROM users;
```

---

## ORM

```python
session.query(User).all()
```

---

# ما هو SQLAlchemy؟

أشهر ORM في Python.

يستخدم في:

- Flask
- FastAPI
- Django (جزئيًا)
- مشاريع كبيرة جدًا

---

# تثبيت SQLAlchemy

```bash
pip install sqlalchemy
```

---

# إنشاء قاعدة بيانات

```python
from sqlalchemy import create_engine

engine = create_engine("sqlite:///school.db")
```

---

# إنشاء Base

```python
from sqlalchemy.orm import declarative_base

Base = declarative_base()
```

---

# إنشاء Model

```python
from sqlalchemy import Column, Integer, String

class Student(Base):

    __tablename__ = "students"

    id = Column(Integer, primary_key=True)

    name = Column(String)

    age = Column(Integer)
```

---

# إنشاء الجداول

```python
Base.metadata.create_all(engine)
```

---

# إنشاء Session

```python
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)

session = Session()
```

---

# إضافة بيانات

```python
student = Student(name="Ahmed", age=20)

session.add(student)

session.commit()
```

---

# إضافة أكثر من عنصر

```python
students = [

    Student(name="Sara", age=22),

    Student(name="Ali", age=19)
]

session.add_all(students)

session.commit()
```

---

# قراءة البيانات

```python
students = session.query(Student).all()

for student in students:

    print(student.name, student.age)
```

---

# فلترة البيانات

```python
student = session.query(Student).filter(Student.age > 20).all()
```

---

# جلب عنصر واحد

```python
student = session.query(Student).filter_by(name="Ahmed").first()
```

---

# تحديث البيانات

```python
student = session.query(Student).filter_by(id=1).first()

student.age = 25

session.commit()
```

---

# حذف البيانات

```python
student = session.query(Student).filter_by(id=1).first()

session.delete(student)

session.commit()
```

---

# العلاقات بين الجداول

## One to Many

Student → Many Grades

---

# مثال

```python
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship
```

---

## Grade Model

```python
class Grade(Base):

    __tablename__ = "grades"

    id = Column(Integer, primary_key=True)

    value = Column(Integer)

    student_id = Column(Integer, ForeignKey("students.id"))
```

---

## Relationship

```python
class Student(Base):

    __tablename__ = "students"

    id = Column(Integer, primary_key=True)

    name = Column(String)

    age = Column(Integer)

    grades = relationship("Grade", backref="student")
```

---

# استخدام العلاقة

```python
student = session.query(Student).first()

for grade in student.grades:

    print(grade.value)
```

---

# Cascade Delete

```python
grades = relationship(

    "Grade",

    backref="student",

    cascade="all, delete"
)
```

---

# Filtering Advanced

```python
from sqlalchemy import and_, or_
```

---

```python
session.query(Student).filter(

    and_(Student.age > 18, Student.age < 25)

).all()
```

---

# ترتيب البيانات

```python
session.query(Student).order_by(Student.age.desc()).all()
```

---

# Limit

```python
session.query(Student).limit(5).all()
```

---

# Count

```python
session.query(Student).count()
```

---

# ORM vs SQL

| SQL | ORM |
|-----|-----|
| صعب القراءة أحيانًا | سهل القراءة |
| سريع في الفهم المباشر | أسهل في المشاريع الكبيرة |
| يعتمد على نصوص | يعتمد على Objects |

---

# متى تستخدم ORM؟

✅ مشاريع كبيرة  
✅ APIs  
✅ أنظمة معقدة  
✅ فرق عمل  

---

# متى تستخدم SQL مباشرة؟

✅ استعلامات معقدة جدًا  
✅ تحسين أداء دقيق  
✅ تقارير ضخمة  

---

# Session Lifecycle

1. إنشاء session
2. تنفيذ عمليات
3. commit أو rollback
4. إغلاق session

---

```python
session.close()
```

---

# Rollback

```python
session.rollback()
```

---

# مثال مشروع كامل

## إنشاء طالب + درجة

```python
student = Student(name="Ahmed", age=20)

session.add(student)

session.commit()
```

---

```python
grade = Grade(value=90, student_id=student.id)

session.add(grade)

session.commit()
```

---

# Lazy Loading

العلاقات لا تُحمّل إلا عند الحاجة.

---

# Eager Loading

```python
from sqlalchemy.orm import joinedload

students = session.query(Student).options(

    joinedload(Student.grades)

).all()
```

---

# أخطاء شائعة

## نسيان commit

❌ البيانات لا تُحفظ

---

## فتح sessions كثيرة بدون إغلاق

❌ يؤدي لمشاكل في الأداء

---

## استخدام ORM في كل شيء بدون تفكير

❌ أحيانًا SQL أفضل

---

# أفضل الممارسات

✅ استخدم ORM لتنظيم الكود  
✅ استخدم SQL عند الحاجة للأداء  
✅ افصل Models عن Business Logic  
✅ استخدم Sessions بشكل صحيح  

---

# مشروع صغير

```python
Base.metadata.create_all(engine)

student = Student(name="Sara", age=22)

session.add(student)

session.commit()

students = session.query(Student).all()

for s in students:

    print(s.name)
```

---

# مشروع احترافي

نظام إدارة مدرسة:

- Students
- Teachers
- Courses
- Grades

---

## العلاقات:

- Student → Grades (One-to-Many)
- Teacher → Courses (One-to-Many)
- Students ↔ Courses (Many-to-Many)

---

# ملخص

- ORM يحول الجداول إلى كائنات.
- SQLAlchemy أقوى ORM في Python.
- Session هو المسؤول عن العمليات.
- العلاقات تجعل البيانات مترابطة.
- ORM يجعل الكود أنظف وأسهل.

---

# Quiz

## السؤال الأول

ما معنى ORM؟

A) Object Random Mapping

B) Object Relational Mapping

C) Open Resource Model

D) Online Record Manager

✅ الإجابة: B

---

## السؤال الثاني

ما وظيفة Session؟

A) تشغيل Python

B) إدارة العمليات على قاعدة البيانات

C) حذف الملفات

D) تشغيل السيرفر

✅ الإجابة: B

---

## السؤال الثالث

أي دالة تستخدم لإضافة بيانات؟

A) add()

B) insert()

C) create()

D) push()

✅ الإجابة: A

---

## السؤال الرابع

ما معنى relationship في ORM؟

A) حذف البيانات

B) ربط الجداول ببعضها

C) إنشاء API

D) تحسين السرعة

✅ الإجابة: B

---

# Challenge

أنشئ نظام جامعة باستخدام SQLAlchemy:

1. Models:
   - Students
   - Professors
   - Courses
   - Enrollments

2. العلاقات:
   - Students ↔ Courses (Many-to-Many)
   - Professors → Courses (One-to-Many)

3. المطلوب:
   - CRUD كامل
   - استخدام Relationships
   - استخدام Filtering
   - استخدام joinedload لتحسين الأداء
   - تطبيق Cascade Delete

**تحدٍ إضافي:** أضف نظام تسجيل درجات (Grades) مع حساب GPA لكل طالب تلقائيًا باستخدام ORM methods.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| ORM | تحويل الجداول إلى كائنات |
| SQLAlchemy | مكتبة ORM |
| Session | جلسة اتصال |
| Model | كلاس يمثل جدول |
| Query | استعلام |
| Relationship | علاقة بين الجداول |
| Lazy Loading | تحميل عند الحاجة |
| Eager Loading | تحميل مسبق |
| Commit | حفظ التغييرات |
| Rollback | إلغاء التغييرات |

---

# الدرس القادم

**41 - FastAPI Advanced Backend Development**

ستتعلم بناء API احترافية جدًا باستخدام FastAPI، مع Validation، Authentication، Dependency Injection، وربطها مع قواعد البيانات باستخدام SQLAlchemy بطريقة احترافية مثل الأنظمة الحقيقية.