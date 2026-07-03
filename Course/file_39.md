# 39-Databases-and-SQL-Fundamentals.md

> مستوى الدرس: مبتدئ → متوسط
>
> مدة القراءة: 180-230 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم ما هي قواعد البيانات.
- فهم الفرق بين SQL و NoSQL بشكل مبسط.
- إنشاء جداول (Tables).
- تنفيذ CRUD Operations.
- استخدام SELECT بشكل احترافي.
- استخدام WHERE و ORDER BY و LIMIT.
- فهم العلاقات بين الجداول.
- ربط SQL مع Python.
- بناء نظام بيانات بسيط قابل للاستخدام في المشاريع.

---

# مقدمة

في البرامج السابقة كنا نخزن البيانات في:

- Lists
- Dictionaries
- JSON Files

لكن هذه الطرق:

❌ لا تناسب البيانات الكبيرة  
❌ لا تدعم البحث السريع  
❌ لا تدعم العلاقات بين البيانات  

هنا يأتي دور:

```
Databases
```

---

# ما هي قاعدة البيانات؟

هي نظام لتخزين وتنظيم البيانات بطريقة تسمح بـ:

- السرعة
- البحث
- التعديل
- الحذف
- العلاقات بين البيانات

---

# أنواع قواعد البيانات

## 1) SQL Databases

تعتمد على الجداول (Tables)

أمثلة:

- MySQL
- PostgreSQL
- SQLite

---

## 2) NoSQL Databases

تعتمد على JSON-like documents

أمثلة:

- MongoDB
- Firebase

---

# في هذا الدرس سنركز على SQL

---

# ما هو SQL؟

SQL = Structured Query Language

لغة تستخدم للتعامل مع قواعد البيانات.

---

# شكل البيانات في SQL

تخيل جدول:

| id | name  | age |
|----|-------|-----|
| 1  | Ahmed | 20  |
| 2  | Sara  | 22  |

---

# إنشاء قاعدة بيانات

```sql
CREATE DATABASE school;
```

---

# استخدام قاعدة البيانات

```sql
USE school;
```

---

# إنشاء جدول

```sql
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT
);
```

---

# إضافة بيانات (INSERT)

```sql
INSERT INTO students (id, name, age)
VALUES (1, 'Ahmed', 20);
```

---

# إضافة أكثر من صف

```sql
INSERT INTO students (id, name, age)
VALUES 
(2, 'Sara', 22),
(3, 'Ali', 19);
```

---

# قراءة البيانات (SELECT)

```sql
SELECT * FROM students;
```

---

# اختيار أعمدة معينة

```sql
SELECT name, age FROM students;
```

---

# WHERE

```sql
SELECT * FROM students
WHERE age > 20;
```

---

# AND / OR

```sql
SELECT * FROM students
WHERE age > 18 AND age < 25;
```

---

# ORDER BY

```sql
SELECT * FROM students
ORDER BY age DESC;
```

---

# LIMIT

```sql
SELECT * FROM students
LIMIT 2;
```

---

# UPDATE

```sql
UPDATE students
SET age = 21
WHERE id = 1;
```

---

# DELETE

```sql
DELETE FROM students
WHERE id = 2;
```

---

# العلاقات بين الجداول

## مثال:

جدول الطلاب:

| id | name |
|----|------|

جدول الدرجات:

| id | student_id | grade |

---

# Primary Key

هو المفتاح الأساسي لكل صف.

```sql
id INT PRIMARY KEY
```

---

# Foreign Key

يربط بين جدولين.

```sql
student_id INT,
FOREIGN KEY (student_id) REFERENCES students(id)
```

---

# JOIN

## INNER JOIN

```sql
SELECT students.name, grades.grade
FROM students
JOIN grades
ON students.id = grades.student_id;
```

---

# LEFT JOIN

```sql
SELECT students.name, grades.grade
FROM students
LEFT JOIN grades
ON students.id = grades.student_id;
```

---

# GROUP BY

```sql
SELECT age, COUNT(*)
FROM students
GROUP BY age;
```

---

# HAVING

```sql
SELECT age, COUNT(*)
FROM students
GROUP BY age
HAVING COUNT(*) > 1;
```

---

# Index

لتسريع البحث:

```sql
CREATE INDEX idx_name
ON students(name);
```

---

# SQL Injection (مهم جدًا)

❌ خطير جدًا إذا لم يتم التعامل معه بشكل صحيح.

---

مثال سيء:

```python
query = "SELECT * FROM users WHERE name = '" + name + "'"
```

---

# الحل: Prepared Statements

```python
cursor.execute(
    "SELECT * FROM users WHERE name = ?",
    (name,)
)
```

---

# ربط SQL مع Python (SQLite)

```python
import sqlite3

conn = sqlite3.connect("school.db")

cursor = conn.cursor()
```

---

# إنشاء جدول من Python

```python
cursor.execute("""
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER
)
""")
```

---

# إدخال بيانات

```python
cursor.execute(
    "INSERT INTO students (name, age) VALUES (?, ?)",
    ("Ahmed", 20)
)

conn.commit()
```

---

# قراءة البيانات

```python
cursor.execute("SELECT * FROM students")

rows = cursor.fetchall()

for row in rows:

    print(row)
```

---

# تحديث البيانات

```python
cursor.execute(
    "UPDATE students SET age = ? WHERE id = ?",
    (25, 1)
)

conn.commit()
```

---

# حذف بيانات

```python
cursor.execute(
    "DELETE FROM students WHERE id = ?",
    (1,)
)

conn.commit()
```

---

# إغلاق الاتصال

```python
conn.close()
```

---

# Transaction

لتنفيذ مجموعة عمليات معًا:

```python
conn.commit()
```

أو التراجع:

```python
conn.rollback()
```

---

# قاعدة بيانات احترافية

```
users
products
orders
payments
```

---

# مثال نظام متجر

## Users

- id
- name
- email

---

## Products

- id
- name
- price

---

## Orders

- id
- user_id
- product_id

---

# أخطاء شائعة

## نسيان WHERE في UPDATE

❌ يحدث تعديل لكل البيانات

---

## استخدام نصوص مباشرة في SQL

❌ خطر SQL Injection

---

## عدم استخدام Index

❌ بطء في البحث

---

# أفضل الممارسات

✅ استخدم parameterized queries

---

✅ صمم الجداول قبل كتابة الكود

---

✅ استخدم العلاقات بين الجداول

---

✅ استخدم indexes عند الحاجة فقط

---

# مشروع صغير

نظام طلاب بسيط:

```python
import sqlite3

conn = sqlite3.connect("school.db")

cursor = conn.cursor()
```

---

## إنشاء جدول

```python
cursor.execute("""
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER
)
""")
```

---

## إضافة طالب

```python
cursor.execute(
    "INSERT INTO students (name, age) VALUES (?, ?)",
    ("Sara", 22)
)

conn.commit()
```

---

## عرض الطلاب

```python
cursor.execute("SELECT * FROM students")

print(cursor.fetchall())
```

---

# ملخص

- قواعد البيانات تخزن البيانات بشكل منظم.
- SQL تستخدم للتعامل مع الجداول.
- أهم العمليات: SELECT, INSERT, UPDATE, DELETE.
- العلاقات بين الجداول مهمة جدًا.
- يجب حماية SQL من Injection.
- Python يمكنه الاتصال بـ SQL بسهولة.

---

# Quiz

## السؤال الأول

ما معنى SQL؟

A) System Query Language

B) Structured Query Language

C) Simple Query List

D) Standard Query Logic

✅ الإجابة: B

---

## السؤال الثاني

أي أمر يستخدم لإضافة بيانات؟

A) SELECT

B) INSERT

C) UPDATE

D) DELETE

✅ الإجابة: B

---

## السؤال الثالث

ما وظيفة WHERE؟

A) حذف البيانات

B) فلترة البيانات

C) إنشاء جدول

D) ربط الجداول

✅ الإجابة: B

---

## السؤال الرابع

ما هو خطر SQL Injection؟

A) تسريع النظام

B) تحسين الأداء

C) تنفيذ أوامر خبيثة داخل قاعدة البيانات

D) حذف الجداول تلقائيًا

✅ الإجابة: C

---

# Challenge

أنشئ نظام إدارة مدرسة باستخدام SQLite:

1. جدول Students
2. جدول Courses
3. جدول Enrollments

المطلوب:

- CRUD كامل لكل جدول
- استخدام JOIN لعرض الطلاب مع الكورسات
- استخدام Transactions عند تسجيل طالب في كورس
- إضافة Index على اسم الطالب
- حماية كل الاستعلامات باستخدام parameterized queries

**تحدٍ إضافي:** أنشئ نظام تقارير يعرض:
- عدد الطلاب في كل كورس
- متوسط أعمار الطلاب
- أكثر الطلاب تسجيلًا في الكورسات

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Database | قاعدة بيانات |
| Table | جدول |
| Row | صف |
| Column | عمود |
| Primary Key | مفتاح أساسي |
| Foreign Key | مفتاح خارجي |
| Query | استعلام |
| JOIN | ربط جداول |
| Index | فهرس |
| Transaction | معاملة |

---

# الدرس القادم

**40 - ORMs & SQLAlchemy (Advanced Databases)**

ستتعلم كيف تتعامل مع قواعد البيانات بدون كتابة SQL مباشرة، باستخدام ORM، وبناء أنظمة احترافية في Python مثل SQLAlchemy وربطها مع APIs.