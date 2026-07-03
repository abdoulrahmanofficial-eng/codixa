# 23-Exception-Handling.md

> مستوى الدرس: متوسط
>
> مدة القراءة: 90-110 دقيقة

---

# 🎯 أهداف الدرس

بعد الانتهاء من هذا الدرس ستكون قادرًا على:

- فهم معنى Exceptions.
- معرفة الفرق بين Syntax Errors و Runtime Errors.
- استخدام `try` و `except`.
- استخدام `else`.
- استخدام `finally`.
- التقاط أنواع محددة من الأخطاء.
- إنشاء أخطاء مخصصة باستخدام `raise`.
- كتابة برامج لا تتوقف عند حدوث أخطاء غير متوقعة.

---

# مقدمة

تخيل أن المستخدم أدخل:

```
abc
```

بدلًا من رقم.

ولدينا الكود التالي:

```python
number = int(input("Enter Number: "))
```

سيظهر:

```
ValueError
```

ويتوقف البرنامج.

هذا غير احترافي.

البرامج الاحترافية يجب أن تتعامل مع الأخطاء بدون أن تتوقف فجأة.

لهذا نستخدم:

```
Exception Handling
```

---

# ما هو Exception؟

الـ Exception هو خطأ يحدث أثناء تشغيل البرنامج (Runtime).

إذا لم تتم معالجته فسيتوقف البرنامج.

---

# أنواع الأخطاء

يوجد نوعان رئيسيان.

---

## أولًا: Syntax Error

خطأ في كتابة الكود.

مثال:

```python
if x > 5

    print(x)
```

نسينا:

```
:
```

لن يعمل البرنامج أساسًا.

---

## ثانيًا: Runtime Error

البرنامج يبدأ العمل ثم يحدث خطأ أثناء التنفيذ.

مثل:

```python
print(10 / 0)
```

الناتج:

```
ZeroDivisionError
```

---

# استخدام try

```python
try:

    number = int(input("Number: "))

    print(number)

except:

    print("Invalid Input")
```

---

إذا أدخل المستخدم:

```
abc
```

الناتج:

```
Invalid Input
```

ولن يتوقف البرنامج.

---

# كيف يعمل try؟

```
try

↓

نفذ الكود

↓

هل حدث خطأ؟

↓

لا

↓

استمر

↓

نعم

↓

انتقل إلى except
```

---

# التقاط نوع معين من الأخطاء

يفضل عدم استخدام:

```python
except:
```

لأنه يلتقط جميع الأخطاء.

الأفضل:

```python
try:

    number = int(input())

except ValueError:

    print("Please Enter A Number")
```

---

# أكثر من except

```python
try:

    number = int(input())

    print(10 / number)

except ValueError:

    print("Invalid Number")

except ZeroDivisionError:

    print("Cannot Divide By Zero")
```

---

# else

ينفذ فقط إذا لم يحدث أي خطأ.

```python
try:

    number = int(input())

except ValueError:

    print("Invalid")

else:

    print("Everything Is OK")
```

---

# finally

ينفذ دائمًا.

حتى إذا حدث خطأ.

```python
try:

    print(10/0)

except:

    print("Error")

finally:

    print("Finished")
```

الناتج:

```
Error

Finished
```

---

# لماذا finally مهمة؟

تستخدم لإغلاق الموارد.

مثل:

- الملفات.
- قواعد البيانات.
- الاتصالات بالشبكة.

حتى لو حدث خطأ.

---

# مثال عملي

```python
try:

    age = int(input("Age: "))

except ValueError:

    print("Age Must Be A Number")

else:

    print(f"Age = {age}")

finally:

    print("Program Ended")
```

---

# Exception As

يمكن معرفة رسالة الخطأ.

```python
try:

    print(10/0)

except Exception as error:

    print(error)
```

الناتج:

```
division by zero
```

---

# التقاط أكثر من نوع

```python
except (ValueError, TypeError):
```

---

# raise

يمكن إنشاء خطأ بنفسك.

```python
age = -5

if age < 0:

    raise ValueError("Age Cannot Be Negative")
```

---

# مثال

```python
password = input("Password: ")

if len(password) < 8:

    raise ValueError("Password Is Too Short")
```

---

# إنشاء دالة تتحقق من العمر

```python
def check_age(age):

    if age < 0:

        raise ValueError("Invalid Age")

    return age
```

---

# أشهر الأخطاء

---

## ValueError

```python
int("abc")
```

---

## ZeroDivisionError

```python
10/0
```

---

## IndexError

```python
numbers=[1]

numbers[5]
```

---

## KeyError

```python
student={}

student["name"]
```

---

## TypeError

```python
10 + "5"
```

---

## FileNotFoundError

```python
open("test.txt")
```

---

# مثال شامل

```python
try:

    x = int(input("First Number: "))

    y = int(input("Second Number: "))

    result = x / y

except ValueError:

    print("Please Enter Numbers Only")

except ZeroDivisionError:

    print("Division By Zero Is Not Allowed")

else:

    print(result)

finally:

    print("Calculator Closed")
```

---

# استخدام Exception

```python
try:

    ...

except Exception as e:

    print(e)
```

يفضل استخدامه في آخر سلسلة `except` إذا كنت تريد التقاط أي خطأ غير متوقع، وليس كبديل دائم للتعامل مع الأخطاء المعروفة.

---

# أخطاء شائعة

## استخدام except فقط

❌

```python
except:
```

يفضل تحديد نوع الخطأ كلما أمكن.

---

## تجاهل الخطأ

❌

```python
except:

    pass
```

قد يجعل اكتشاف الأخطاء لاحقًا صعبًا جدًا.

---

## استخدام try على كمية ضخمة من الكود

يفضل أن يحتوي try على أقل عدد ممكن من الأسطر التي قد تسبب الخطأ.

---

# أفضل الممارسات

✅ التقط الأخطاء المتوقعة فقط.

---

✅ استخدم رسائل واضحة للمستخدم.

---

✅ استخدم `finally` لإغلاق الموارد.

---

✅ استخدم `raise` للتحقق من صحة البيانات داخل الدوال.

---

# مشروع صغير

برنامج آلة حاسبة آمنة.

```python
try:

    number1 = float(input("First Number: "))

    number2 = float(input("Second Number: "))

    operation = input("Operation (+ - * /): ")

    if operation == "+":
        print(number1 + number2)

    elif operation == "-":
        print(number1 - number2)

    elif operation == "*":
        print(number1 * number2)

    elif operation == "/":
        print(number1 / number2)

    else:
        print("Invalid Operation")

except ValueError:

    print("Please Enter Valid Numbers")

except ZeroDivisionError:

    print("Cannot Divide By Zero")

finally:

    print("Program Finished")
```

---

# ملخص

- Exceptions هي أخطاء تحدث أثناء تشغيل البرنامج.
- `try` يحتوي الكود المتوقع أن يسبب خطأ.
- `except` يعالج الخطأ.
- `else` ينفذ إذا لم يحدث خطأ.
- `finally` ينفذ دائمًا.
- `raise` يستخدم لإنشاء أخطاء مخصصة والتحقق من صحة البيانات.

---

# Quiz

## السؤال الأول

أي كلمة تستخدم لبدء معالجة الأخطاء؟

A) catch

B) try

C) error

D) except

✅ الإجابة: B

---

## السؤال الثاني

أي جزء ينفذ دائمًا سواء حدث خطأ أم لا؟

A) except

B) else

C) finally

D) raise

✅ الإجابة: C

---

## السؤال الثالث

أي خطأ يحدث عند تنفيذ:

```python
10 / 0
```

A) ValueError

B) IndexError

C) ZeroDivisionError

D) TypeError

✅ الإجابة: C

---

## السؤال الرابع

ما وظيفة `raise`؟

A) إيقاف الحلقة.

B) إنشاء أو إطلاق Exception يدويًا.

C) طباعة الخطأ.

D) تجاهل الخطأ.

✅ الإجابة: B

---

# Challenge

أنشئ برنامجًا لإدارة حساب بنكي.

1. اطلب من المستخدم إدخال الرصيد الحالي.
2. اطلب قيمة السحب.
3. إذا كانت قيمة السحب أكبر من الرصيد، استخدم `raise` لإطلاق `ValueError`.
4. إذا أدخل المستخدم قيمة غير رقمية، تعامل معها باستخدام `try` و`except`.
5. إذا نجحت العملية، اعرض الرصيد الجديد.
6. استخدم `finally` لطباعة رسالة تفيد بانتهاء العملية.

**تحدٍ إضافي:** اسمح للمستخدم بتكرار العملية داخل حلقة `while` حتى يختار الخروج، مع الحفاظ على استمرار البرنامج حتى عند حدوث أخطاء.

---

# مصطلحات مهمة

| English | العربية |
|----------|----------|
| Exception | استثناء / خطأ أثناء التشغيل |
| Exception Handling | معالجة الأخطاء |
| Runtime Error | خطأ وقت التشغيل |
| Syntax Error | خطأ في كتابة الكود |
| Try | محاولة التنفيذ |
| Except | معالجة الخطأ |
| Else | ينفذ عند عدم وجود خطأ |
| Finally | ينفذ دائمًا |
| Raise | إطلاق استثناء |
| Traceback | تتبع الخطأ |

---

# الدرس القادم

**24 - File Handling (التعامل مع الملفات)**

ستتعلم كيفية إنشاء الملفات وقراءتها وكتابتها وتعديلها، واستخدام `with` لإدارة الملفات بطريقة آمنة، والتعامل مع ملفات النصوص وملفات CSV، وهي مهارة أساسية في أي تطبيق يتعامل مع البيانات.