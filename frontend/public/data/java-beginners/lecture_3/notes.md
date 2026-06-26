# Object Oriented Programming Basics

## 1. Classes and Objects
A Class is a blueprint, an Object is an instance.
```java
class Car {
  String color;
}
Car myCar = new Car();
```

## 2. Encapsulation
Hiding internal state and requiring all interaction to be performed through an object's methods.

## 3. Constructors
Special methods invoked when an object is created.
```java
class Car {
  public Car(String c) { this.color = c; }
}
```