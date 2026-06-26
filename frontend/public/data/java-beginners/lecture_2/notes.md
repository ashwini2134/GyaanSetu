# Java Platform Overview

## 1. JDK vs JRE vs JVM
- **JDK**: Java Development Kit. Includes tools for compiling and debugging.
- **JRE**: Java Runtime Environment. Includes JVM and libraries to run Java apps.
- **JVM**: Java Virtual Machine. Executes the bytecode.

## 2. Write Once, Run Anywhere
Java compiles source code into platform-independent bytecode.

## 3. Bytecode Example
```java
public class Main {
  public static void main(String[] args) {
    System.out.println("WORA!");
  }
}
```