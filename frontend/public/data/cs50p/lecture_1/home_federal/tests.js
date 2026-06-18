export function runTests(code) {
  // Reject TODO/FIXME/placeholder code
  if (/\b(TODO|FIXME|HACK|XXX|PLACEHOLDER)\b/i.test(code)) {
    return { passed: false, message: "❌ Code contains incomplete TODO/FIXME markers." };
  }

  const cleanCode = code
    .split("\n")
    .map((line) => line.replace(/#.*$/, ""))
    .join("\n");
  const normalized = cleanCode.toLowerCase().replace(/\s/g, "");

  if (normalized.length === 0) {
    return { passed: false, message: "❌ Code cannot be empty or comments only." };
  }
  // Verify input() is used to read greeting
  if (!normalized.includes("input(")) {
    return { passed: false, message: "❌ Expected code to read input with input()." };
  }
  // Verify greeting check for 'hello'
  if (!normalized.includes("hello")) {
    return { passed: false, message: "❌ Expected code to check for a greeting starting with 'hello'." };
  }
  // Verify correct output amounts
  if (!normalized.includes("$0") || !normalized.includes("$20") || !normalized.includes("$100")) {
    return { passed: false, message: "❌ Expected code to output $0, $20, and $100." };
  }
  // Verify proper string method for checking the start
  if (!normalized.includes("startswith(") && !normalized.includes("[0]")) {
    return { passed: false, message: "❌ Expected code to inspect the start of the greeting (e.g. .startswith())." };
  }
  return { passed: true, message: "✅ All test cases passed!" };
}
