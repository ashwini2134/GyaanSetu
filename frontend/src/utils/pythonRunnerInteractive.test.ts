import { describe, it, expect, beforeEach } from 'vitest';
import { runValidationTest } from './pythonRunnerInteractive';
import { runPython, normalizeNumbers, stripPrompts } from './pythonRunner';

describe('Interactive Python Runner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('runs basic prints and variables', () => {
    const code = `
x = 5
y = 10
print(x + y)
`;
    const res = runValidationTest(code, []);
    expect(res.error).toBeNull();
    expect(res.stdout.trim()).toBe('15');
  });

  it('runs interactive inputs in order', () => {
    const code = `
name = input("Name? ")
age = input("Age? ")
print("Hello " + name + " aged " + age)
`;
    const res = runValidationTest(code, ['Alice', '25']);
    expect(res.error).toBeNull();
    expect(res.stdout.trim()).toBe('Hello Alice aged 25');
  });

  it('handles tuple unpackings/multiple assignments', () => {
    const code = `
choices, correct = (["a", "b"], "a")
print(choices)
print(correct)
`;
    const res = runValidationTest(code, []);
    expect(res.error).toBeNull();
    const lines = res.stdout.trim().split('\n');
    expect(lines[0].trim()).toBe("[a, b]");
    expect(lines[1].trim()).toBe('a');
  });

  it('handles range loop with nested len() call', () => {
    const code = `
tasks = [10, 20, 30]
for i in range(len(tasks)):
    print(i)
`;
    const res = runValidationTest(code, []);
    expect(res.error).toBeNull();
    const lines = res.stdout.trim().split('\n').map(s => s.trim());
    expect(lines).toContain('0');
    expect(lines).toContain('1');
    expect(lines).toContain('2');
  });

  it('handles try-except block without syntax errors', () => {
    const code = `
try:
    print("trying")
    raise ValueError("err")
except:
    print("caught")
`;
    const res = runValidationTest(code, []);
    expect(res.error).toBeNull();
    expect(res.stdout.split('\n').map(s => s.trim()).filter(Boolean)).toContain('trying');
    expect(res.stdout.split('\n').map(s => s.trim()).filter(Boolean)).toContain('caught');
  });

  it('handles function call assignments', () => {
    const code = `
def load_students():
    students = {}
    try:
        with open("students.txt", "r") as f:
            for line in f:
                if line.strip():
                    name, grade = line.strip().split(",")
                    students[name] = grade
    except:
        pass
    return students

def save_students(students):
    with open("students.txt", "w") as f:
        for name, grade in students.items():
            f.write(name + "," + grade + "\\n")

def main():
    students = load_students()
    print("Welcome to the Student Management System!")
    
    while True:
        print("\\n--- Menu ---")
        print("1. Add Student")
        print("2. View Students")
        print("3. Search Student")
        print("4. Delete Student")
        print("5. Save and Exit")
        
        choice = input("Enter choice (1-5): ").strip()
        
        if choice == "1":
            name = input("Enter student name: ").strip()
            grade = input("Enter student grade: ").strip()
            if name and grade:
                students[name] = grade
                print("Added student " + name)
        elif choice == "2":
            if not students:
                print("No student records found.")
            else:
                print("Student Records:")
                for name, grade in students.items():
                    print("- " + name + ": " + grade)
        elif choice == "3":
            name = input("Enter student name to search: ").strip()
            if name in students:
                print("Found student " + name + ": grade is " + students[name])
            else:
                print("Student not found.")
        elif choice == "4":
            name = input("Enter student name to delete: ").strip()
            if name in students:
                del students[name]
                print("Deleted student " + name)
            else:
                print("Student not found.")
        elif choice == "5":
            save_students(students)
            print("Records saved. Goodbye!")
            break
        else:
            print("Invalid choice, please select 1-5.")
`;
    const res = runValidationTest(code, ['5']);
    expect(res.error).toBeNull();
  });

  it('handles full todo_list starter code', () => {
    const code = `# To-Do List Application
# Manage tasks and persist their status to "todo.txt".

def load_tasks():
    tasks = []
    try:
        with open("todo.txt", "r") as f:
            for line in f:
                if line.strip():
                    parts = line.strip().split(",")
                    title = parts[0]
                    completed = parts[1]
                    tasks.append({
                        "title": title,
                        "completed": completed
                    })
    except:
        pass
    return tasks

def save_tasks(tasks):
    with open("todo.txt", "w") as f:
        for t in tasks:
            f.write(t["title"] + "," + t["completed"] + "\\n")

def main():
    tasks = load_tasks()
    print("Welcome to To-Do List Manager!")
    
    while True:
        print("\\n--- Menu ---")
        print("1. Add Task")
        print("2. View Tasks")
        print("3. Mark Task Complete")
        print("4. Delete Task")
        print("5. Save and Exit")
        
        choice = input("Enter choice (1-5): ").strip()
        
        if choice == "1":
            title = input("Enter task title: ").strip()
            if title:
                tasks.append({
                    "title": title,
                    "completed": "0"
                })
                print("Added task: " + title)
        elif choice == "2":
            if not tasks:
                print("No tasks found.")
            else:
                print("Tasks:")
                for t in tasks:
                    status = "[x]" if t["completed"] == "1" else "[ ]"
                    print(status + " " + t["title"])
        elif choice == "3":
            title = input("Enter task title to complete: ").strip()
            found = False
            for t in tasks:
                if t["title"].lower() == title.lower():
                    t["completed"] = "1"
                    print("Marked task as completed: " + t["title"])
                    found = True
                    break
            if not found:
                print("Task not found.")
        elif choice == "4":
            title = input("Enter task title to delete: ").strip()
            found = False
            for i in range(len(tasks)):
                if tasks[i]["title"].lower() == title.lower():
                    tasks.pop(i)
                    print("Deleted task: " + title)
                    found = True
                    break
            if not found:
                print("Task not found.")
        elif choice == "5":
            save_tasks(tasks)
            print("Tasks saved. Goodbye!")
            break
        else:
            print("Invalid choice, please select 1-5.")
`;
    const res = runValidationTest(code, ['5']);
    expect(res.error).toBeNull();
  });

  it('handles empty string inputs without error', () => {
    const code = `
val = input("Value? ")
print("Value: " + val)
`;
    const res = runValidationTest(code, ['']);
    expect(res.error).toBeNull();
    expect(res.stdout.trim()).toBe('Value:');
  });

  it('persists virtual files to localStorage', () => {
    const code = `
with open("test.txt", "w") as f:
    f.write("hello world")

with open("test.txt", "r") as f:
    content = f.read()
    print(content)
`;
    const res = runValidationTest(code, []);
    expect(res.error).toBeNull();
    expect(res.stdout.trim()).toBe('hello world');
    expect(localStorage.getItem('fa_file_test.txt')).toBe('hello world');
  });

  it('handles empty dictionary literal {}', () => {
    const code = `
d = {}
print(type(d))
print(len(d))
`;
    const res = runPython(code, []);
    expect(res.error).toBeNull();
    expect(res.output.trim().split('\n').map(s => s.trim())).toEqual([
      "<class 'dict'>",
      "0"
    ]);
  });

  it('distinguishes str() and repr() formatting and quotes keys', () => {
    const code = `
s = "hello"
d = {"the": 3}
print(str(s))
print(repr(s))
print(str(d))
print(repr(d))
`;
    const res = runPython(code, []);
    expect(res.error).toBeNull();
    expect(res.output.trim().split('\n').map(s => s.trim())).toEqual([
      "hello",
      "'hello'",
      "{'the': 3}",
      "{'the': 3}"
    ]);
  });

  it('handles string formatting % operator and augmented assignments', () => {
    const code = `
s = "%dC" % 32
print(s)
s += " and %s" % "hot"
print(s)
val = 85.123
s = "%.2f" % val
print(s)
`;
    const res = runPython(code, []);
    expect(res.error).toBeNull();
    expect(res.output.trim().split('\n').map(s => s.trim())).toEqual([
      "32C",
      "32C and hot",
      "85.12"
    ]);
  });

  it('handles file readlines()', () => {
    const code = `
with open("test_lines.txt", "w") as f:
    f.write("line 1\\nline 2\\nline 3")

with open("test_lines.txt", "r") as f:
    lines = f.readlines()
    print(lines)
`;
    const res = runPython(code, []);
    expect(res.error).toBeNull();
    expect(res.output.trim()).toBe("['line 1\\n', 'line 2\\n', 'line 3']");
  });

  it('handles Largest of Three with inputs 5, 12, 7', () => {
    const code = `
a = int(input("First: "))
b = int(input("Second: "))
c = int(input("Third: "))
if a >= b and a >= c:
    print("Largest:", a)
elif b >= a and b >= c:
    print("Largest:", b)
else:
    print("Largest:", c)
`;
    const res = runPython(code, ["5", "12", "7"]);
    expect(res.error).toBeNull();
    expect(res.output.trim()).toBe("First: Second: Third: Largest: 12");
  });

  it('verifies normalizeNumbers helper', () => {
    expect(normalizeNumbers("9.0")).toBe("9");
    expect(normalizeNumbers("9")).toBe("9");
    expect(normalizeNumbers("32.0F")).toBe("32F");
    expect(normalizeNumbers("0C = 32.0F")).toBe("0C = 32F");
    expect(normalizeNumbers("Triangle b=6,h=3: 9.0")).toBe("Triangle b=6,h=3: 9");
    expect(normalizeNumbers("Average: 85.00")).toBe("Average: 85");
  });

  it('handles Leap Year Checker with parenthesized logical expression', () => {
    const code = `
year = int(input("Enter year: "))
if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0):
    print("Leap year")
else:
    print("Not a leap year")
`;
    const res2024 = runPython(code, ["2024"]);
    expect(res2024.error).toBeNull();
    expect(res2024.output.trim()).toBe("Enter year: Leap year");

    const res2023 = runPython(code, ["2023"]);
    expect(res2023.error).toBeNull();
    expect(res2023.output.trim()).toBe("Enter year: Not a leap year");

    const res2000 = runPython(code, ["2000"]);
    expect(res2000.error).toBeNull();
    expect(res2000.output.trim()).toBe("Enter year: Leap year");

    const res1900 = runPython(code, ["1900"]);
    expect(res1900.error).toBeNull();
    expect(res1900.output.trim()).toBe("Enter year: Not a leap year");
  });

  it('verifies stripPrompts helper', () => {
    const prompts = ["First: ", "Second: ", "Third: "];
    expect(stripPrompts("First: Second: Third: Largest: 12", prompts)).toBe("Largest: 12");
    expect(stripPrompts("First: Second: Third: Largest: 12", ["First: ", "Third: "])).toBe("Second: Largest: 12");
  });
});
