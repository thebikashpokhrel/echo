# **Documentation**

## **Introduction**

Echo is an interpreted programming language developed in TypeScript. It is designed for simplicity, flexibility, and readability. This documentation provides a comprehensive guide to its syntax, features, and usage.

---

## **Table of Contents**

1. Getting Started
2. Syntax Overview
3. Data Types
4. Variables and Constants
5. Functions
6. Control Structures
7. Objects and Arrays
8. Built-in Functions
9. Error Handling
10. Examples
11. Development Tools
12. Future Enhancements

---

## **1. Getting Started**

### Installation

To use Echo, install the interpreter using npm:

```bash
npm install -g echo-lang
```

### Running Echo Code

Save your Echo code in a `.echo` file and execute it with:

```bash
echo run myProgram.echo
```

---

## **2. Syntax Overview**

Echo's syntax is lightweight and expressive. Below are key examples:

### Hello World:

```echo
echo("Hello, World!");
```

### Comments:

- Single-line: `# This is a comment`
- Multi-line:
  ```echo
  # This is a
  # multi-line comment
  ```

---

## **3. Data Types**

Echo supports the following data types:

- **Numbers**: Positive and Negative integers (e.g., `42`, `-10`).
- **Strings**: Text enclosed in quotes (e.g., `"Hello"`).
- **Booleans**: `true` or `false`.
- **Arrays**: Dynamic lists (e.g., `array(1, 2, 3)`).
- **Objects**: Key-value pairs (e.g., `{name: "Echo", version: 1.0}`).

---

## **4. Variables and Constants**

### Declaring Variables:

```js
let x = 5;
let name = "Echo";
```

### Declaring Constants:

```js
const PI = 3.14159;
```

---

## **5. Functions**

Define reusable code blocks with the `def` keyword:

### Syntax:

```py
def functionName(parameters){
    # Function body
    return value;  # Optional
}
```

### Example:

```py
def add(a, b){
    return a + b;
}
echo(add(3, 4));  # Outputs: 7
```

---

## **6. Control Structures**

### If-Else:

```py
if (condition) {
    # Code block
} elif (otherCondition) {
    # Code block
} else {
    # Code block
}
```

### Loops:

#### For Loop:

```js
for (let i = 0; i < 5; i = i + 1) {
  echo(i);
}
```

#### While Loop:

```js
let count = 0;
while (count < 5) {
  echo(count);
  count = count + 1;
}
```

---

## **7. Objects and Arrays**

### Arrays:

```js
let nums = array(1, 2, 3);
nums.append(4);
echo(nums[0]);  # Outputs: 1
```

### Objects:

```js
let person = {
    name: {
        first: "John",
        last: "Doe"
    },
    age: 30
};
echo(person.name.first);  # Outputs: John
```

---

## **8. Built-in Functions**

### Input/Output:

- `read(prompt)`: Reads input from the user.
- `echo(value)`: Prints output to the console.

### Type Conversion:

- `toNumber(value)`: Converts a string to a number.
- `type(value)`: Returns the type of a value.

---

## **10. Examples**

### Factorial Function:

```py
def factorial(n) {
    if (n < 0) {
        echo("Cannot calculate factorial of a negative number");
        return;
    } elif (n == 0 or n == 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}
echo(factorial(5));  # Outputs: 120
```

### Fibonacci Sequence:

```js
def fibo(n) {
    if (n <= 0) {
        echo("Please provide n > 0");
        return -1;
    } elif (n == 1 or n == 2) {
        return 1;
    } else {
        return fibo(n - 1) + fibo(n - 2);
    }
}
echo(fibo(6));  # Outputs: 8
```

---

## **12. Future Enhancements**

1. **Unary Operators**: Introduce support for unary operators like `++`, `+=`, and `-` to enhance arithmetic and assignment operations.

2. **Object Functions**: Enable key-value pairs in objects to contain functions, allowing method-like behavior directly within objects.

3. **Floating Point Support**: Expand numerical capabilities by fully supporting floating-point values for precise calculations.

4. **Improved Error Reporting**: Enhance error messages with detailed context to assist in debugging and development.

## **13. Contributing**

Echo is a hobby project, and contributions are always welcome! 🚀 Whether you want to suggest features, fix bugs, or improve documentation, feel free to submit a pull request or open an issue.
