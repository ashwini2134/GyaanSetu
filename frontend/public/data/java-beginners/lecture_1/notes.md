# Methods & Multiplication Table

## 1. What is a Method?
A method is a block of code which only runs when it is called. You can pass data, known as parameters, into a method.

## 2. Creating a Method
```java
void printTable(int number) {
  for(int i=1; i<=10; i++) {
    System.out.printf("%d * %d = %d", number, i, number * i).println();
  }
}
```

## 3. Return Values
Methods can return values using the `return` keyword.
```java
int multiply(int a, int b) {
  return a * b;
}
```