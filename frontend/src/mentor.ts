/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GYANSETU MENTOR - Problem-Aware Socratic Hints System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This system provides targeted, problem-specific Socratic hints based on:
 * - Course (cs50p, fundamentals-of-ai)
 * - Lecture number
 * - Problem slug
 * - Student code analysis
 * - Conceptual requirements
 * 
 * Behavior:\n * - Detects common Python mistakes without executing code
 * - Prevents false positives with context-aware analysis
 * - Recognizes comment spoofs vs actual implementations
 * - Provides guiding questions instead of direct answers
 * - Gives positive feedback for correct solutions
 * ═══════════════════════════════════════════════════════════════════════════════
 */


// ──────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────


export interface MentorContext {
  courseSlug: string;  // 'cs50p', 'fundamentals-of-ai'
  lectureNum: number;  // 0-9
  problemSlug: string; // 'indoor_voice', 'making_faces', etc.
  studentCode: string; // Raw student submission
  message: string;     // User's chat message (can be empty)
  historyCount?: number; // Number of messages in conversation
}

export interface CodeAnalysis {
  hasComments: boolean;
  codeWithoutComments: string;
  normalized: string;
  normalizedLower: string;
  hasFunctionDef: boolean;
  functionNames: string[];
  hasReturn: boolean;
  hasPrint: boolean;
  hasInput: boolean;
  hasImport: boolean;
  hasClass: boolean;
  isEmpty: boolean;
  hasTodo: boolean;
  keywords: Map<string, boolean>;
}

export interface HintResponse {
  type: 'positive' | 'correction' | 'guidance' | 'generic';
  hint: string;
  isCorrect?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// CODE ANALYSIS ENGINE
// ──────────────────────────────────────────────────────────────────────────────\n

function analyzeCode(code: string): CodeAnalysis {
  const hasComments = /#/.test(code);
  const codeWithoutComments = code.split("\n").map(line => line.replace(/#.*$/, "")).join("\n");
  const normalized = codeWithoutComments.toLowerCase().replace(/\s/g, "");
  const normalizedLower = normalized;
  
  return {
    hasComments,
    codeWithoutComments,
    normalized,
    normalizedLower,
    hasFunctionDef: /\bdef\s+\w+\s*\(/.test(codeWithoutComments),
    functionNames: [...new Set((codeWithoutComments.match(/\bdef\s+(\w+)/g) ?? []).map(m => m.replace(/\bdef\s+/, "")))],
    hasReturn: /\breturn\b/.test(codeWithoutComments),
    hasPrint: /\bprint\s*\(/.test(codeWithoutComments),
    hasInput: /\binput\s*\(/.test(codeWithoutComments),
    hasImport: /\bimport\b|\bfrom\b/.test(codeWithoutComments),
    hasClass: /\bclass\s+\w+/.test(codeWithoutComments),
    isEmpty: normalized.length === 0,
    hasTodo: /\b(TODO|FIXME|HACK|XXX|PLACEHOLDER)\b/i.test(code),
    keywords: new Map(),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// HELPER: Problem Classification
// ──────────────────────────────────────────────────────────────────────────────\n

const FUNCTION_PROBLEMS = [
  // Lecture 0
  "making_faces",
  "tip_calculator",
  // Lecture 1
  "meal_time",
  // Lecture 2
  "vanity_plates",
  // Lecture 3
  "fuel",
  "taqueria",
  "grocery",
  "outdated",
  // Lecture 4
  "emojize",
  "figlet",
  "adieu",
  "game",
  "guessing_game",
  "professor",
  "little_professor",
  "bitcoin",
  // Lecture 6
  "lines",
  "pizza",
  "scourgify",
  "shirt",
  // Lecture 7
  "numb3rs",
  "watch",
  "watch_on_youtube",
  "working",
  "working_9_to_5",
  "um",
  "response",
  // Lecture 8
  "jar",
  "cookie_jar",
  "seasons",
  "seasons_of_love",
  "shirtificate",
  "cs50_p_shirt",
  "cs50_shirtificate",
];


function requiresReturn(problemSlug: string): boolean {
  return FUNCTION_PROBLEMS.some(p => problemSlug.includes(p));
}

// ──────────────────────────────────────────────────────────────────────────────
// GLOBAL RULES (Applied to all problems)
// ──────────────────────────────────────────────────────────────────────────────\n

function checkGlobalRules(analysis: CodeAnalysis, problemSlug: string, rawCode: string): HintResponse | null {
  // 1. TODO/FIXME Detection
  if (analysis.hasTodo) {
    return {
      type: 'correction',
      hint: "I can see your code has TODO or FIXME markers. These indicate incomplete work. Can you finish implementing the logic?",
    };
  }

  // 2. Empty Code
  if (analysis.isEmpty) {
    return {
      type: 'guidance',
      hint: "How would you begin approaching this problem? What input does the specification require, and what output should your code produce?",
    };
  }

  // 3. Comment Spoof Detection
  // Check if keywords only exist in comments
  const spoofKeywords = ["lower", "replace", "emojize", "figlet", "validate", "convert", "count", "randint", "requests", "dictreader", "dictwriter", "imageops", "jar", "fpdf"];
  const rawLower = rawCode.toLowerCase();
  const cleanLower = analysis.codeWithoutComments.toLowerCase();
  const hasSpoofedKeyword = spoofKeywords.some(kw => rawLower.includes(kw) && !cleanLower.includes(kw));
  
  if (hasSpoofedKeyword || (cleanLower.replace(/\s/g, "").length === 0 && analysis.hasComments)) {
    return {
      type: 'correction',
      hint: "I can see the required logic mentioned in comments, but it doesn't appear to be implemented in executable code. Can you translate those notes into actual Python?",
    };
  }

  // 4. Syntax Errors
  const lines = analysis.codeWithoutComments.split("\n").map(l => l.trim());
  const missingColon = lines.some(l => 
    (l.startsWith("def ") || l.startsWith("if ") || l.startsWith("for ") || l.startsWith("while ") || l.startsWith("elif ") || l.startsWith("else ")) && 
    !l.endsWith(":") && 
    l.length > 0
  );
  
  if (missingColon) {
    return {
      type: 'correction',
      hint: "Are you missing a specific punctuation mark (like a colon `:`) at the end of a function, conditional, or loop definition?",
    };
  }

  // 5. Common Mistakes
  if (analysis.codeWithoutComments.includes("== True") || analysis.codeWithoutComments.includes("== False")) {
    return {
      type: 'correction',
      hint: "Do you need to explicitly compare against `True` or `False`, or does the expression already evaluate to a boolean?",
    };
  }

  if (/\bif\s+\w+\s*=\s*/.test(analysis.codeWithoutComments)) {
    return {
      type: 'correction',
      hint: "Are you assigning a value with `=` or comparing two values with `==`? Check which one makes sense here.",
    };
  }

  // 6. Unreachable Code
  if (/return.*\n\s+(?:print|return|[a-zA-Z_])/.test(analysis.codeWithoutComments)) {
    return {
      type: 'correction',
      hint: "Look at what happens after your return statement. Will that code ever execute?",
    };
  }

  // 7. Print vs Return (Only for function problems)
  if (requiresReturn(problemSlug) && analysis.hasFunctionDef && analysis.hasPrint && !analysis.hasReturn) {
    return {
      type: 'correction',
      hint: "Your function is printing a value, but the specification asks the function to **return** a value. What's the difference, and how should you modify your code?",
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 0: FUNDAMENTALS
// ──────────────────────────────────────────────────────────────────────────────\n

function hintLecture0(slug: string, analysis: CodeAnalysis, code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("indoor_voice")) {
    if (!normalized.includes(".lower(")) {
      return {
        type: 'guidance',
        hint: "What string method converts text to lowercase?",
      };
    }
    if (normalized.includes(".upper(")) {
      return {
        type: 'correction',
        hint: "I see you're converting the text's case, but is it to the case the specification requests?",
      };
    }
    if (!normalized.includes("input(")) {
      return {
        type: 'guidance',
        hint: "How do you read a line of text from the user in Python?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly uses `input()` to read text and `.lower()` to convert it to lowercase.",
      isCorrect: true,
    };
  }

  if (slug.includes("playback_speed")) {
    if (!normalized.includes(".replace(")) {
      return {
        type: 'guidance',
        hint: "How could you transform every space character into three periods?",
      };
    }
    if (!/\.replace\(["']\s["']\s*,\s*["']\.\.\.["']\)/.test(code)) {
      return {
        type: 'guidance',
        hint: "Are you replacing the space character with exactly three periods `...`?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly uses `.replace()` to convert spaces to ellipses.",
      isCorrect: true,
    };
  }

  if (slug.includes("making_faces")) {
    if (!/def\s+convert\s*\(/.test(code)) {
      return {
        type: 'guidance',
        hint: "The specification mentions a `convert()` function. Why might the problem want you to write a separate function rather than putting everything in the main code?",
      };
    }
    if (!code.includes("🙂") && !code.includes("🙁")) {
      return {
        type: 'guidance',
        hint: "How can you swap the text emoticons for emojis? What are the actual emoji characters you need?",
      };
    }
    if (code.includes("def convert") && analysis.hasPrint && !analysis.hasReturn) {
      return {
        type: 'correction',
        hint: "The specification asks the `convert()` function to **return** a transformed string. What should the function send back to the caller?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly defines a `convert()` function that returns emoji-replaced text.",
      isCorrect: true,
    };
  }

  if (slug.includes("einstein")) {
    if (!normalized.includes("300000000")) {
      return {
        type: 'guidance',
        hint: "What is the speed of light in meters per second? You'll need to store this as a constant in your code.",
      };
    }
    if (!normalized.includes("*") || !normalized.includes("input(")) {
      return {
        type: 'guidance',
        hint: "How do you calculate E = mc²? What operations do you need?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly uses the speed of light constant and applies the E=mc² formula.",
      isCorrect: true,
    };
  }

  if (slug.includes("tip_calculator")) {
    if (!normalized.includes("float(")) {
      return {
        type: 'guidance',
        hint: "Dollar amounts and percentages are decimal numbers. How do you convert text strings to floats?",
      };
    }
    if (!code.includes("def dollars_to_float") || !code.includes("def percent_to_float")) {
      return {
        type: 'guidance',
        hint: "The specification asks for two helper functions. What are they, and what should each return?",
      };
    }
    if (!normalized.includes("/100")) {
      return {
        type: 'guidance',
        hint: "When converting a percentage to a decimal, what operation do you perform?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly defines conversion functions and calculates the tip properly.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 1: CONDITIONALS
// ──────────────────────────────────────────────────────────────────────────────\n

function hintLecture1(slug: string, analysis: CodeAnalysis, code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("deep_thought")) {
    if (!normalized.includes("42")) {
      return {
        type: 'guidance',
        hint: "What is the Great Answer that the user should provide? How do you check for it?",
      };
    }
    if (!normalized.includes("forty-two") && !normalized.includes("fortytwo") && !normalized.includes("forty two")) {
      return {
        type: 'guidance',
        hint: "The specification asks to accept the answer in multiple formats. What variations of the number 42 should your code accept?",
      };
    }
    if (!code.includes("==") && !/\bmatch\b/.test(code) && !/\bin\b/.test(code)) {
      return {
        type: 'guidance',
        hint: "How can you check if the user's input matches (or contains) your expected answer?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly accepts multiple formats of the answer (42, forty-two, etc.).",
      isCorrect: true,
    };
  }

  if (slug.includes("home_federal")) {
    if (!normalized.includes("hello")) {
      return {
        type: 'guidance',
        hint: "How should your code respond to different greetings? What is the first greeting your code checks for?",
      };
    }
    if (!normalized.includes("startswith") && !code.includes("[0]")) {
      return {
        type: 'guidance',
        hint: "What if the greeting starts with 'h' but isn't exactly 'hello'? How can you check just the first character?",
      };
    }
    if (!normalized.includes("0") || !normalized.includes("20") || !normalized.includes("100")) {
      return {
        type: 'guidance',
        hint: "Are you outputting all three required bank fees ($0, $20, and $100)?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly classifies greetings and outputs the appropriate fees.",
      isCorrect: true,
    };
  }

  if (slug.includes("file_extensions")) {
    if (!normalized.includes("endswith") && !normalized.includes("split") && !normalized.includes("rsplit")) {
      return {
        type: 'guidance',
        hint: "How can you extract or identify the file extension from a filename string?",
      };
    }
    const requiredMimes = ["jpeg", "pdf", "txt", "gif", "png", "zip"];
    const hasAllMimes = requiredMimes.every(m => normalized.includes(m));
    if (!hasAllMimes) {
      return {
        type: 'guidance',
        hint: "Have you handled all the required file types (jpeg, png, gif, pdf, txt, zip)? Are you using the correct MIME types?",
      };
    }
    if (!normalized.includes("octet-stream")) {
      return {
        type: 'guidance',
        hint: "What should your program output if the file extension isn't recognized?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly maps file extensions to MIME types.",
      isCorrect: true,
    };
  }

  if (slug.includes("math_interpreter")) {
    if (!normalized.includes("split(")) {
      return {
        type: 'guidance',
        hint: "How can you break down a mathematical expression like '1 + 2' into its parts?",
      };
    }
    if (!normalized.includes("int(")) {
      return {
        type: 'guidance',
        hint: "How do you convert the operands from strings to numbers?",
      };
    }
    if (!normalized.includes("+") && !normalized.includes("-") && !normalized.includes("*") && !normalized.includes("/")) {
      return {
        type: 'guidance',
        hint: "Your code should handle the basic arithmetic operators. Which ones does it support?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly parses and evaluates arithmetic expressions.",
      isCorrect: true,
    };
  }

  if (slug.includes("meal_time")) {
    if (!code.includes("def convert")) {
      return {
        type: 'guidance',
        hint: "The specification asks for a `convert()` function. What should it take as input and return?",
      };
    }
    if (!code.includes("def main")) {
      return {
        type: 'guidance',
        hint: "The specification suggests a `main()` function. How does that help organize your code?",
      };
    }
    if (!normalized.includes("split(")) {
      return {
        type: 'guidance',
        hint: "Time is provided as a string like '7:30'. How do you split that into hours and minutes?",
      };
    }
    if (!normalized.includes("breakfast") && !normalized.includes("lunch") && !normalized.includes("dinner")) {
      return {
        type: 'guidance',
        hint: "Your code should classify times into breakfast, lunch, or dinner periods. Does it check the right times?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly converts time strings to floats and classifies meals.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 2: LOOPS
// ──────────────────────────────────────────────────────────────────────────────\n

function hintLecture2(slug: string, analysis: CodeAnalysis, code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("camel_case") || slug.includes("camelcase")) {
    if (!normalized.includes("for")) {
      return {
        type: 'guidance',
        hint: "How can you go through each character in the string one by one?",
      };
    }
    if (!normalized.includes(".isupper(") && !normalized.includes(".islower(")) {
      return {
        type: 'guidance',
        hint: "What string method lets you check if a character is uppercase or lowercase?",
      };
    }
    if (!normalized.includes("_")) {
      return {
        type: 'guidance',
        hint: "How should you represent a camelCase boundary in the output?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly loops through characters and inserts underscores at case changes.",
      isCorrect: true,
    };
  }

  if (slug.includes("coke_machine")) {
    if (!normalized.includes("while")) {
      return {
        type: 'guidance',
        hint: "The vending machine should keep accepting coins until the user pays the full amount. What loop structure does that suggest?",
      };
    }
    if (!normalized.includes("amountdue") && !normalized.includes("insert coin")) {
      return {
        type: 'guidance',
        hint: "What should your program display to show the remaining amount due?",
      };
    }
    const coinValues = ["25", "10", "5"];
    const hasCoins = coinValues.some(c => normalized.includes(c));
    if (!hasCoins) {
      return {
        type: 'guidance',
        hint: "What are the values of quarters (25¢), dimes (10¢), and nickels (5¢)?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly implements a coin-acceptance loop.",
      isCorrect: true,
    };
  }

  if (slug.includes("just_setting_up") || slug.includes("twttr")) {
    if (!normalized.includes("aeiou")) {
      return {
        type: 'guidance',
        hint: "Your code should remove vowels. How can you identify or reference all the vowels?",
      };
    }
    if (!normalized.includes("for") && !normalized.includes("replace")) {
      return {
        type: 'guidance',
        hint: "How can you go through the text and remove vowels? What approach would you use?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly removes vowels from the text.",
      isCorrect: true,
    };
  }

  if (slug.includes("nutrition_facts")) {
    if (!normalized.includes("input(")) {
      return {
        type: 'guidance',
        hint: "How do you ask the user for a fruit name?",
      };
    }
    if (!normalized.includes("calories")) {
      return {
        type: 'guidance',
        hint: "What should your output format be? How do you display the calorie count?",
      };
    }
    const caseMethods = [".title(", ".lower(", ".upper(", ".capitalize("];
    const hasCaseMethod = caseMethods.some(m => normalized.includes(m));
    if (!hasCaseMethod) {
      return {
        type: 'guidance',
        hint: "Your code should handle the fruit name regardless of capitalization. What string method can help with case-insensitive comparison?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly looks up and displays calorie information.",
      isCorrect: true,
    };
  }

  if (slug.includes("vanity_plates")) {
    if (!code.includes("def main") || !code.includes("def is_valid")) {
      return {
        type: 'guidance',
        hint: "The specification asks for two functions. What are they, and what should each do?",
      };
    }
    if (!normalized.includes("len(")) {
      return {
        type: 'guidance',
        hint: "Plates have length constraints. How do you check the length of a string?",
      };
    }
    if (!normalized.includes(".isalpha(") && !normalized.includes(".isalnum(") && !normalized.includes(".isdigit(")) {
      return {
        type: 'guidance',
        hint: "How can you verify that characters are letters, digits, or appropriate for a license plate?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly validates vanity plate format.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 3: EXCEPTIONS
// ──────────────────────────────────────────────────────────────────────────────

function hintLecture3(slug: string, analysis: CodeAnalysis, _code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("fuel")) {
    if (!normalized.includes("except")) {
      return {
        type: 'guidance',
        hint: "What happens if the user enters invalid input like '5/0' or 'X/Y'? What try-except structure is required to catch these exceptions?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly uses exceptions to handle invalid fractions.",
      isCorrect: true,
    };
  }

  if (slug.includes("taqueria")) {
    if (!normalized.includes("try") || !normalized.includes("eoferror")) {
      return {
        type: 'guidance',
        hint: "How do you keep asking for menu items until the user stops (EOF)? What try-except structure catches `EOFError`?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly handles multiple orders and stops cleanly on EOF (Control-D).",
      isCorrect: true,
    };
  }

  if (slug.includes("grocery")) {
    if (!normalized.includes(".sort(") && !normalized.includes("sorted(")) {
      return {
        type: 'guidance',
        hint: "The specification requires the grocery list to be sorted alphabetically. What function or list method does Python provide for sorting collections?",
      };
    }
    if (!normalized.includes("eoferror")) {
      return {
        type: 'guidance',
        hint: "How will your program detect when the user has finished inputting items? What try-except block can catch `EOFError`?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly counts, sorts, and displays grocery list items upon EOF.",
      isCorrect: true,
    };
  }

  if (slug.includes("outdated")) {
    if (!normalized.includes("split(")) {
      return {
        type: 'guidance',
        hint: "Dates are inputted as strings like '9/8/1636' or 'September 8, 1636'. How can you split these strings to isolate the month, day, and year?",
      };
    }
    if (!normalized.includes("valueerror") && !normalized.includes("try")) {
      return {
        type: 'guidance',
        hint: "How do you handle invalid dates or month names? What exceptions do you need to try and catch?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly parses both date formats, handles errors, and pads single digits to YYYY-MM-DD.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 4: LIBRARIES
// ──────────────────────────────────────────────────────────────────────────────

function hintLecture4(slug: string, analysis: CodeAnalysis, _code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("emojize")) {
    if (!normalized.includes("importemoji") && !normalized.includes("fromemojiimport")) {
      return {
        type: 'guidance',
        hint: "How do we import third-party modules in Python? Have you installed and imported the `emoji` package?",
      };
    }
    if (!normalized.includes("emojize(")) {
      return {
        type: 'guidance',
        hint: "What function within the `emoji` package converts codes like `:thumbs_up:` into visual emojis? (hint: check `emoji.emojize`).",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly reads text, uses `emoji.emojize()` to convert it, and prints the emojized output.",
      isCorrect: true,
    };
  }

  if (slug.includes("figlet")) {
    if (!normalized.includes("pyfiglet")) {
      return {
        type: 'guidance',
        hint: "Have you imported `pyfiglet` (or the `Figlet` class) to render ASCII art fonts?",
      };
    }
    if (!normalized.includes("sys.argv")) {
      return {
        type: 'guidance',
        hint: "How does python retrieve command-line arguments? What list in the `sys` module stores these inputs?",
      };
    }
    if (!normalized.includes("sys.exit(")) {
      return {
        type: 'guidance',
        hint: "If the user inputs an invalid command-line argument or an invalid font, how do you exit the program with an error status? (hint: check `sys.exit`).",
      };
    }
    if (!normalized.includes("rendertext(")) {
      return {
        type: 'guidance',
        hint: "What method in `pyfiglet` converts a text string into the styled ASCII art output? (hint: check `figlet.renderText()`).",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly validates command-line arguments, sets the font dynamically, and renders Figlet ASCII output.",
      isCorrect: true,
    };
  }

  if (slug.includes("adieu")) {
    if (!normalized.includes("importinflect") && !normalized.includes("frominflectimport")) {
      return {
        type: 'guidance',
        hint: "To format a list of names grammatically with commas and 'and', we can use a library. What package should you import?",
      };
    }
    if (!normalized.includes("eoferror")) {
      return {
        type: 'guidance',
        hint: "How does the program know when to stop prompting the user for names? What exception is raised on Control-D, and how do you handle it?",
      };
    }
    if (!normalized.includes(".join(")) {
      return {
        type: 'guidance',
        hint: "What method in the `inflect` engine formats lists into natural-language lists? (hint: check `p.join()`).",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly prompts for names until EOF, format-joins them with `inflect`, and prints the Adieu lyrics.",
      isCorrect: true,
    };
  }

  if (slug.includes("game") || slug.includes("guessing")) {
    if (!normalized.includes("importrandom") && !normalized.includes("fromrandomimport")) {
      return {
        type: 'guidance',
        hint: "To pick a secret integer, we need random number generation. What module does Python provide for random calculations?",
      };
    }
    if (!normalized.includes("randint(") && !normalized.includes("randrange(")) {
      return {
        type: 'guidance',
        hint: "What function in the `random` module returns a random integer within a specified range?",
      };
    }
    if (!normalized.includes("while")) {
      return {
        type: 'guidance',
        hint: "The game must keep prompting the user to guess until they guess correctly. What type of loop is suitable for an unknown number of repetitions?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly prompts for levels/guesses, loops repeatedly, generates random targets, and displays Too small / Too large / Just right.",
      isCorrect: true,
    };
  }

  if (slug.includes("professor") || slug.includes("little_professor")) {
    if (!normalized.includes("defget_level(")) {
      return {
        type: 'guidance',
        hint: "The specification requires defining a `get_level()` function. What values should it accept, and what does it prompt the user for?",
      };
    }
    if (!normalized.includes("defgenerate_integer(")) {
      return {
        type: 'guidance',
        hint: "The specification requires defining a `generate_integer(level)` function. How do you generate a random 1-digit, 2-digit, or 3-digit number based on the level?",
      };
    }
    if (!normalized.includes("eee")) {
      return {
        type: 'guidance',
        hint: "What should the program print when a student inputs an incorrect answer to an addition problem?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly structures functions for level selection, integer generation, score tracking, and the 3-strike error rules.",
      isCorrect: true,
    };
  }

  if (slug.includes("bitcoin")) {
    if (!normalized.includes("importrequests") && !normalized.includes("fromrequestsimport")) {
      return {
        type: 'guidance',
        hint: "To fetch the current price of Bitcoin, we need to query an external HTTP API. What third-party library lets us send HTTP requests?",
      };
    }
    if (!normalized.includes("sys.argv")) {
      return {
        type: 'guidance',
        hint: "How does the program know the number of Bitcoins the user wants to buy? What sys list contains command-line arguments?",
      };
    }
    if (!normalized.includes(".json(")) {
      return {
        type: 'guidance',
        hint: "How do you parse the raw API text response into a structured Python dictionary? (hint: check the `.json()` method).",
      };
    }
    if (!normalized.includes(",.4f")) {
      return {
        type: 'guidance',
        hint: "The specification requires outputting the USD price formatted to 4 decimal places with a thousands separator. How do you format floats in an f-string?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly fetches JSON data from Coindesk's API, converts inputs to floats, and displays formatted Bitcoin prices.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 6: FILE I/O
// ──────────────────────────────────────────────────────────────────────────────

function hintLecture6(slug: string, analysis: CodeAnalysis, _code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("lines")) {
    if (!normalized.includes("sys.argv")) {
      return {
        type: 'guidance',
        hint: "How does the user specify which file to read? How do you access command-line arguments in Python?",
      };
    }
    if (!normalized.includes("open(")) {
      return {
        type: 'guidance',
        hint: "Before you can read lines, you must open the file. What built-in Python function opens files?",
      };
    }
    if (!normalized.includes("startswith(") && !normalized.includes(".lstrip(")) {
      return {
        type: 'guidance',
        hint: "The program should exclude comments (lines starting with `#`) and blank lines. How can you detect if a stripped or left-stripped line starts with `#`?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly opens files, filters comments and empty lines, and counts lines of executable code.",
      isCorrect: true,
    };
  }

  if (slug.includes("pizza")) {
    if (!normalized.includes("tabulate")) {
      return {
        type: 'guidance',
        hint: "To format a CSV file as a clean ASCII grid, we need to import a specific table library. What package should you use?",
      };
    }
    if (!normalized.includes("sys.argv")) {
      return {
        type: 'guidance',
        hint: "How does the program know which CSV file to read? What sys list stores command-line parameters?",
      };
    }
    if (!normalized.includes("grid")) {
      return {
        type: 'guidance',
        hint: "The specification asks the table to be formatted in a specific style called 'grid'. Have you set this argument in your `tabulate()` call?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly loads the CSV menu and outputs a beautifully formatted grid table.",
      isCorrect: true,
    };
  }

  if (slug.includes("scourgify")) {
    if (!normalized.includes("importcsv") && !normalized.includes("fromcsvimport")) {
      return {
        type: 'guidance',
        hint: "To cleanly read and write spreadsheet files, Python has a built-in module. Have you imported the `csv` module?",
      };
    }
    if (!normalized.includes("dictreader") || !normalized.includes("dictwriter")) {
      return {
        type: 'guidance',
        hint: "How can you read and write CSV files using dictionary rows where columns are keyed by headers? (hint: check `csv.DictReader` and `csv.DictWriter`).",
      };
    }
    if (!normalized.includes("split(")) {
      return {
        type: 'guidance',
        hint: "The input file combines names as 'Last, First'. How do you split a single string based on a comma separator?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly transforms names and houses into first-name-first columns using dict readers/writers.",
      isCorrect: true,
    };
  }

  if (slug.includes("shirt")) {
    if (!normalized.includes("pil") && !normalized.includes("pillow")) {
      return {
        type: 'guidance',
        hint: "To load and modify image files, we use a third-party library. What package should you import? (hint: use the `PIL` package).",
      };
    }
    if (!normalized.includes(".fit(")) {
      return {
        type: 'guidance',
        hint: "The input image must be resized and cropped to match the shirt's size. What function within `ImageOps` fits the image dynamically?",
      };
    }
    if (!normalized.includes(".paste(")) {
      return {
        type: 'guidance',
        hint: "How do you overlay the shirt PNG directly on top of the resized student photo? (hint: check the `.paste()` method on the image object).",
      };
    }
    if (!normalized.includes(".save(")) {
      return {
        type: 'guidance',
        hint: "Once you have overlaid the shirt, how do you write the final merged image back to disk?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly reads command-line images, crops/resizes them, pastes the shirt overlay, and outputs the result.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 7: REGULAR EXPRESSIONS
// ──────────────────────────────────────────────────────────────────────────────

function hintLecture7(slug: string, analysis: CodeAnalysis, _code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("numb3rs")) {
    if (!normalized.includes("defvalidate(")) {
      return {
        type: 'guidance',
        hint: "The specification requires defining a `validate()` function. What parameters does it accept, and what does it return?",
      };
    }
    if (!normalized.includes("importre") && !normalized.includes("fromreimport")) {
      return {
        type: 'guidance',
        hint: "To validate IP addresses using regular expressions, what module must you import?",
      };
    }
    if (!normalized.includes("re.search(") && !normalized.includes("re.match(")) {
      return {
        type: 'guidance',
        hint: "What function in the `re` module searches a string for a match against a regular expression pattern?",
      };
    }
    if (!normalized.includes("25[0-5]") && !normalized.includes("255")) {
      return {
        type: 'guidance',
        hint: "An IP address consists of 4 octets ranging from 0 to 255. How does your regular expression confirm that each octet is at most 255?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly structures validate() and uses regular expressions to enforce valid IP ranges.",
      isCorrect: true,
    };
  }

  if (slug.includes("watch")) {
    if (!normalized.includes("defparse(")) {
      return {
        type: 'guidance',
        hint: "The specification requires defining a `parse()` function. Have you defined it to receive the iframe string?",
      };
    }
    if (!normalized.includes("re.search(")) {
      return {
        type: 'guidance',
        hint: "How do you search for the YouTube src attribute within the HTML iframe code? What regex function helps search strings?",
      };
    }
    if (!normalized.includes("youtu.be")) {
      return {
        type: 'guidance',
        hint: "The returned URL must be simplified in the short format 'https://youtu.be/[video_id]'. How do you construct this from the extracted video ID?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly parses the iframe, extracts the video identifier using groups, and converts it to a short URL.",
      isCorrect: true,
    };
  }

  if (slug.includes("working")) {
    if (!normalized.includes("defconvert(")) {
      return {
        type: 'guidance',
        hint: "The specification requires defining a `convert()` function. What parameters does it accept, and what does it return?",
      };
    }
    if (!normalized.includes("valueerror")) {
      return {
        type: 'guidance',
        hint: "If the input string does not match the required format or represents an invalid time (e.g. 13:00 AM or 9:60 PM), how do you raise a `ValueError`?",
      };
    }
    if (!normalized.includes("am") || !normalized.includes("pm")) {
      return {
        type: 'guidance',
        hint: "A time string is input in 12-hour format with AM or PM. How do you parse the meridian suffix to perform 24-hour military conversion?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly validates the AM/PM inputs, raises ValueErrors for out-of-range times, and outputs zero-padded 24-hour outputs.",
      isCorrect: true,
    };
  }

  if (slug.includes("um")) {
    if (!normalized.includes("defcount(")) {
      return {
        type: 'guidance',
        hint: "The specification requires defining a `count()` function. What parameter should it accept, and what integer value does it return?",
      };
    }
    if (!normalized.includes("findall(") && !normalized.includes("finditer(")) {
      return {
        type: 'guidance',
        hint: "How can you find all occurrences of a pattern in a string? What `re` functions return multiple matches? (hint: check `re.findall()`).",
      };
    }
    if (!normalized.includes("\\bum\\b")) {
      return {
        type: 'guidance',
        hint: "The program must only count 'um' as a standalone word (excluding words like 'yummy' or 'album'). What regex characters specify word boundaries? (hint: check `\\b`).",
      };
    }
    if (!normalized.includes("ignorecase")) {
      return {
        type: 'guidance',
        hint: "The search should match 'um' case-insensitively. What flag can you pass as an argument to ignore casing? (hint: check `re.IGNORECASE`).",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly scans for case-insensitive standalone occurrences of 'um' using regex word boundaries.",
      isCorrect: true,
    };
  }

  if (slug.includes("response")) {
    if (!normalized.includes("validators") && !normalized.includes("validator_collection")) {
      return {
        type: 'guidance',
        hint: "To validate the email, the specification asks you to use either `validators` or `validator_collection`. What package are you importing?",
      };
    }
    if (normalized.includes("importre") || normalized.includes("import re")) {
      return {
        type: 'correction',
        hint: "The specification explicitly forbids writing your own regular expression or using the `re` module. Please delete `import re` and use a validator package instead.",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly uses a third-party validator library to parse inputs without writing custom regex.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LECTURE 8: OBJECT-ORIENTED PROGRAMMING
// ──────────────────────────────────────────────────────────────────────────────

function hintLecture8(slug: string, analysis: CodeAnalysis, _code: string): HintResponse | null {
  const normalized = analysis.normalizedLower;

  if (slug.includes("seasons")) {
    if (!normalized.includes("date")) {
      return {
        type: 'guidance',
        hint: "To represent and subtract dates in Python, we use the `datetime` module. Have you imported `date` from `datetime`?",
      };
    }
    if (!normalized.includes("importinflect") && !normalized.includes("frominflectimport")) {
      return {
        type: 'guidance',
        hint: "To convert numbers of minutes into words (like 'five hundred twenty-five thousand, six hundred'), what library should you use?",
      };
    }
    if (!normalized.includes("sys.exit(")) {
      return {
        type: 'guidance',
        hint: "If the user enters an invalid date format (not YYYY-MM-DD), how do you exit the program cleanly? (hint: check `sys.exit`).",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly performs date subtraction, converts time deltas to minutes, and formats them into natural-language words.",
      isCorrect: true,
    };
  }

  if (slug.includes("jar")) {
    if (!normalized.includes("classjar")) {
      return {
        type: 'guidance',
        hint: "The specification requires defining a `Jar` class. Have you created it with the `class Jar:` statement?",
      };
    }
    if (!normalized.includes("def__init__(")) {
      return {
        type: 'guidance',
        hint: "How does a class initialize new objects? What special constructor method do you need to define inside `Jar`?",
      };
    }
    if (!normalized.includes("defdeposit(") || !normalized.includes("defwithdraw(")) {
      return {
        type: 'guidance',
        hint: "A jar needs deposit and withdraw methods. What signatures did you define for `deposit(self, n)` and `withdraw(self, n)`?",
      };
    }
    if (!normalized.includes("@property")) {
      return {
        type: 'guidance',
        hint: "The specification requires `capacity` and `size` to be implemented as read-only properties. What decorator tells Python a method is a property?",
      };
    }
    if (!normalized.includes("🍪")) {
      return {
        type: 'guidance',
        hint: "The special `__str__` method should represent the jar with cookie emojis. How do you return a string containing `🍪` multiplied by the number of cookies currently in the jar?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly implements the Jar class structure with properties, error raises, deposit/withdrawal methods, and string emoji output.",
      isCorrect: true,
    };
  }

  if (slug.includes("shirtificate")) {
    if (!normalized.includes("fpdf")) {
      return {
        type: 'guidance',
        hint: "To programmatically generate PDF certificates, what third-party package should you import? (hint: use the `fpdf` or `fpdf2` package).",
      };
    }
    if (!normalized.includes('"a4"') && !normalized.includes("'a4'")) {
      return {
        type: 'guidance',
        hint: "The specification states that the PDF certificate format should be A4 portrait. Have you set these parameters in your `FPDF()` constructor?",
      };
    }
    if (!normalized.includes("shirtificate.png")) {
      return {
        type: 'guidance',
        hint: "How do you place the background shirt image on the PDF document? What method in FPDF renders images? (hint: check `.image()`).",
      };
    }
    if (!normalized.includes(".output(")) {
      return {
        type: 'guidance',
        hint: "Once you have drawn the title, image, and student name, how do you save or output the final PDF document on disk?",
      };
    }
    return {
      type: 'positive',
      hint: "✅ Your solution correctly prompts for user names, uses FPDF to construct A4 portraits, draws centered text/images, and outputs the PDF.",
      isCorrect: true,
    };
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// PROGRESSIVE HINT TRANSLATOR
// ──────────────────────────────────────────────────────────────────────────────

function makeHintProgressive(response: HintResponse, context: MentorContext): HintResponse {
  if (response.type !== 'guidance' && response.type !== 'correction') {
    return response;
  }

  const level = Math.floor((context.historyCount ?? 0) / 2);
  if (level <= 0) {
    return response; // Return Socratic/conceptual hint on first try
  }

  let progressiveHint = response.hint;
  const slug = context.problemSlug.toLowerCase();

  // Problem-specific progressive enhancements
  if (slug.includes("indoor_voice")) {
    if (response.hint.toLowerCase().includes("lowercase") || response.hint.toLowerCase().includes("method")) {
      if (level === 1) {
        progressiveHint += "\n\n💡 *Progressive Hint:* You can use the `.lower()` string method. For example, if you have a variable `text`, `text.lower()` will return the lowercase version of it.";
      } else {
        progressiveHint += "\n\n💡 *Progressive Hint:* Try writing: `user_input = input().lower()` to read the user's input and immediately convert it to lowercase.";
      }
    }
  } else if (slug.includes("playback_speed")) {
    if (response.hint.toLowerCase().includes("periods") || response.hint.toLowerCase().includes("transform")) {
      if (level === 1) {
        progressiveHint += "\n\n💡 *Progressive Hint:* The `.replace(old, new)` method replaces occurrences of a substring. E.g., `text.replace(' ', '...')`.";
      } else {
        progressiveHint += "\n\n💡 *Progressive Hint:* Try using: `print(input().replace(' ', '...'))`. This reads the text, replaces all single spaces with three periods, and prints it.";
      }
    }
  } else if (slug.includes("making_faces")) {
    if (response.hint.toLowerCase().includes("convert")) {
      if (level === 1) {
        progressiveHint += "\n\n💡 *Progressive Hint:* A helper function is defined using `def convert(text):` and should return the modified text using `.replace()`.";
      } else {
        progressiveHint += "\n\n💡 *Progressive Hint:* Here is a template:\n```python\ndef convert(text):\n    return text.replace('🙂', '🙂').replace('🙁', '🙁') # replacing emoticons with emojis\n```";
      }
    }
  } else if (slug.includes("numb3rs")) {
    if (response.hint.toLowerCase().includes("regular expression") || response.hint.toLowerCase().includes("validate")) {
      if (level === 1) {
        progressiveHint += "\n\n💡 *Progressive Hint:* An IP address has 4 numbers (0-255) separated by dots. Check out matching `^([0-9]{1,3})\\.([0-9]{1,3})\\...` and then validating each is <= 255.";
      } else {
        progressiveHint += "\n\n💡 *Progressive Hint:* Try writing a regex pattern to extract the four groups: `re.search(r'^([0-9]+)\\.([0-9]+)\\.([0-9]+)\\.([0-9]+)$', ip)` and verify all four integers are in the range 0 to 255.";
      }
    }
  } else if (slug.includes("bitcoin")) {
    if (response.hint.toLowerCase().includes("api")) {
      if (level === 1) {
        progressiveHint += "\n\n💡 *Progressive Hint:* Use `requests.get('https://api.coindesk.com/v1/bpi/currentprice.json')` to fetch the data.";
      } else {
        progressiveHint += "\n\n💡 *Progressive Hint:* After getting the response, call `.json()` on it, and access nested keys: `response.json()['bpi']['USD']['rate_float']`.";
      }
    }
  } else {
    // Generic progressive additions for other problems
    if (level === 1) {
      progressiveHint += "\n\n💡 *Step-by-step:* Let's think about the structure. Have you written out pseudocode or outlined what variables you need?";
    } else {
      progressiveHint += "\n\n💡 *Logic Helper:* Here is the logical breakdown:\n1. Read the input.\n2. Apply the expected operations/conditions.\n3. Return or print the result according to specification.";
    }
  }

  return {
    ...response,
    hint: progressiveHint,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN MENTOR LOGIC
// ──────────────────────────────────────────────────────────────────────────────

export function getMentorHint(context: MentorContext): HintResponse {
  const analysis = analyzeCode(context.studentCode);
  const code = context.studentCode;
  const slug = context.problemSlug.toLowerCase();

  // 1. Apply global rules first (these catch fundamental issues)
  const globalHint = checkGlobalRules(analysis, slug, code);
  if (globalHint) return makeHintProgressive(globalHint, context);

  // 2. Apply lecture-specific rules
  
  if (context.lectureNum === 0) {
    const hint = hintLecture0(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  } else if (context.lectureNum === 1) {
    const hint = hintLecture1(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  } else if (context.lectureNum === 2) {
    const hint = hintLecture2(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  } else if (context.lectureNum === 3) {
    const hint = hintLecture3(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  } else if (context.lectureNum === 4) {
    const hint = hintLecture4(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  } else if (context.lectureNum === 6) {
    const hint = hintLecture6(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  } else if (context.lectureNum === 7) {
    const hint = hintLecture7(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  } else if (context.lectureNum === 8) {
    const hint = hintLecture8(slug, analysis, code);
    if (hint) return makeHintProgressive(hint, context);
  }

  // 3. If no specific hint applies, check for positive feedback on apparently correct solutions
  if (analysis.hasFunctionDef || analysis.hasInput || analysis.hasImport) {
    if (context.message.toLowerCase().includes("check") || 
        context.message.toLowerCase().includes("right") ||
        context.message.toLowerCase().includes("look")) {
      return {
        type: 'positive',
        hint: "Your code structure looks solid. Walk me through what happens step-by-step when you run it. Does the output match the specification?",
        isCorrect: false,
      };
    }
  }

  // 4. Fall back to generic Socratic hints
  const genericHints = [
    "What does your code do step by step? Walk me through the logic.",
    "What is the expected output for the sample input? Does your code produce that?",
    "Have you considered edge cases — what happens with unexpected input?",
    "Try reading the problem description again. What is it specifically asking for?",
    "Can you simplify your approach? What is the minimum code needed to solve this?",
    "What Python built-in functions might help here? Check the docs for `str`, `int`, `list`, etc.",
    "Good thinking! Now verify your logic handles every constraint in the problem.",
    "What do you think is preventing your code from passing? Let's debug that together.",
  ];
  
  return {
    type: 'generic',
    hint: genericHints[Math.floor(Math.random() * genericHints.length)],
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// FAILURE ANALYSIS, PROGRESSIVE HINTS, AND CODE REVIEW EXPORTS
// ──────────────────────────────────────────────────────────────────────────────

export interface FailureAnalysisResult {
  expected: string;
  student: string;
  whyFailed: string;
}

export interface ProgressiveHints {
  hint1: string;
  hint2: string;
  hint3: string;
}

export interface CodeReviewCheck {
  status: 'correct' | 'warning' | 'error';
  message: string;
}

export interface CodeReviewResult {
  checks: CodeReviewCheck[];
  issues: string[];
}

export function getFailureAnalysis(code: string, problemSlug: string): FailureAnalysisResult {
  const analysis = analyzeCode(code);
  const normalized = analysis.normalizedLower;
  const slug = problemSlug.toLowerCase();

  // --- LECTURE 0 ---
  if (slug.includes("indoor_voice")) {
    const hasUpper = normalized.includes(".upper(");
    const hasLower = normalized.includes(".lower(");
    
    let studentOutput = "Hello, World";
    if (hasUpper) studentOutput = "HELLO, WORLD";
    else if (hasLower) studentOutput = "hello, world";

    let whyFailed = "";
    if (hasUpper) {
      whyFailed = "The problem requires lowercase output, but your code converts text to uppercase using upper().";
    } else if (!hasLower) {
      whyFailed = "The problem requires lowercase output, but your code does not convert the text case. You should use the lower() method.";
    } else if (!normalized.includes("input(")) {
      whyFailed = "Your code is missing the input() function to read input from the user.";
    } else if (!normalized.includes("print(")) {
      whyFailed = "Your code is missing the print() function to output the result.";
    } else {
      whyFailed = "Make sure your program reads input, converts it to lowercase, and prints the result exactly.";
    }

    return {
      expected: "hello, world",
      student: studentOutput,
      whyFailed,
    };
  }

  if (slug.includes("playback_speed")) {
    const hasReplace = normalized.includes(".replace(");
    const correctReplace = /\.replace\(["']\s["']\s*,\s*["']\.\.\.["']\)/.test(code) || /\.replace\(["']["']\s["']["']\s*,\s*["']["']\.\.\.["']["']\)/.test(normalized);

    let studentOutput = "This is CS50";
    if (hasReplace && correctReplace) studentOutput = "This...is...CS50";
    else if (hasReplace) studentOutput = "This.is.CS50 (or incorrect dots)";

    let whyFailed = "";
    if (!hasReplace) {
      whyFailed = "The problem requires replacing every space with three periods '...', but your code does not perform any replacement.";
    } else if (!correctReplace) {
      whyFailed = "Your replace() call does not seem to replace spaces with exactly three periods '...'. Check your arguments: replace(' ', '...').";
    } else if (!normalized.includes("input(")) {
      whyFailed = "Your code is missing the input() function to read input from the user.";
    } else if (!normalized.includes("print(")) {
      whyFailed = "Your code is missing the print() function to output the result.";
    } else {
      whyFailed = "Make sure your program reads input, replaces all spaces with three dots, and prints the output.";
    }

    return {
      expected: "This...is...CS50",
      student: studentOutput,
      whyFailed,
    };
  }

  if (slug.includes("making_faces")) {
    const hasConvert = /def\s+convert\s*\(/.test(code);
    const hasMain = /def\s+main\s*\(/.test(code);
    const hasReplace = normalized.includes("replace(");
    const hasEmoji1 = code.includes("🙂") || normalized.includes(":)");
    const hasEmoji2 = code.includes("🙁") || normalized.includes(":(");
    const printsInsteadOfReturns = hasConvert && analysis.hasPrint && !analysis.hasReturn;

    let studentOutput = "Hello :) Goodbye :(";
    if (hasReplace) {
      if (code.includes("🙂") && code.includes("🙁")) studentOutput = "Hello 🙂 Goodbye 🙁";
      else if (code.includes("🙂")) studentOutput = "Hello 🙂 Goodbye :(";
      else if (code.includes("🙁")) studentOutput = "Hello :) Goodbye 🙁";
    }

    let whyFailed = "";
    if (!hasConvert) {
      whyFailed = "The problem requires defining a convert() function that takes a string and returns a modified string.";
    } else if (!hasMain) {
      whyFailed = "The problem requires defining a main() function that prompts the user for input, calls convert(), and prints the result.";
    } else if (printsInsteadOfReturns) {
      whyFailed = "The convert() function should return the converted string, but it prints the output instead.";
    } else if (!hasReplace || !hasEmoji1 || !hasEmoji2) {
      whyFailed = "Your convert() function is not replacing both emoticons (':)' and ':(') with their respective emojis ('🙂' and '🙁').";
    } else {
      whyFailed = "Ensure convert() returns the emoji-replaced string and main() calls convert() and prints it.";
    }

    return {
      expected: "Hello 🙂 Goodbye 🙁",
      student: studentOutput,
      whyFailed,
    };
  }

  if (slug.includes("einstein")) {
    const hasInt = normalized.includes("int(");
    const hasSpeed = normalized.includes("300000000");
    const hasPower = normalized.includes("**") || normalized.includes("*300000000*300000000");

    let studentOutput = "5";
    if (hasInt && hasSpeed) {
      if (hasPower) studentOutput = "450000000000000000";
      else studentOutput = "1500000000 (mass * c without squaring)";
    }

    let whyFailed = "";
    if (!hasSpeed) {
      whyFailed = "Your code is missing the speed of light constant (c = 300000000).";
    } else if (!hasInt) {
      whyFailed = "You must convert the user input from a string to an integer using int() before performing calculations. Otherwise, you cannot perform arithmetic.";
    } else if (!hasPower) {
      whyFailed = "The formula E = mc² requires squaring the speed of light (c²). Your code is missing the exponent operator (** 2) or c * c calculation.";
    } else {
      whyFailed = "Ensure your code computes mass * (300000000 ** 2) and prints the result.";
    }

    return {
      expected: "450000000000000000",
      student: studentOutput,
      whyFailed,
    };
  }

  if (slug.includes("tip_calculator")) {
    const hasDollarsFn = code.includes("def dollars_to_float");
    const hasPercentFn = code.includes("def percent_to_float");
    const hasFloat = normalized.includes("float(");
    const hasDiv = normalized.includes("/100");

    let studentOutput = "dollars_to_float('$50.00') -> $50.00, percent_to_float('15%') -> 15";
    if (hasFloat && hasDiv) {
      studentOutput = "dollars_to_float('$50.00') -> 50.0, percent_to_float('15%') -> 0.15";
    }

    let whyFailed = "";
    if (!hasDollarsFn || !hasPercentFn) {
      whyFailed = "The problem requires defining both dollars_to_float(d) and percent_to_float(p) functions.";
    } else if (!hasFloat) {
      whyFailed = "The dollars_to_float and percent_to_float functions must convert the cleaned string values to decimal numbers using float().";
    } else if (!hasDiv) {
      whyFailed = "The percent_to_float function must divide the percentage value by 100 to convert it to a decimal (e.g. 15% becomes 0.15).";
    } else {
      whyFailed = "Ensure dollars_to_float strips '$' and returns a float, and percent_to_float strips '%' and returns a float divided by 100.";
    }

    return {
      expected: "dollars_to_float('$50.00') -> 50.0, percent_to_float('15%') -> 0.15",
      student: studentOutput,
      whyFailed,
    };
  }

  // --- LECTURE 1 ---
  if (slug.includes("deep_thought")) {
    const has42 = normalized.includes("42");
    const hasSpelled = normalized.includes("forty-two") || normalized.includes("fortytwo") || normalized.includes("forty two");

    let studentOutput = "no";
    if (has42 && hasSpelled) studentOutput = "yes (for 'forty-two' and '42')";
    else if (has42) studentOutput = "yes (only for '42', no for 'forty-two')";

    let whyFailed = "";
    if (!has42 && !hasSpelled) {
      whyFailed = "Your code doesn't seem to check for the correct answer '42' or 'forty-two'.";
    } else if (!hasSpelled) {
      whyFailed = "The problem requires accepting both the digits '42' and the spelled out string 'forty-two' or 'forty two'. Your code only checks for the digit.";
    } else {
      whyFailed = "Make sure your comparisons are case-insensitive and ignore leading/trailing whitespace.";
    }

    return { expected: "yes", student: studentOutput, whyFailed };
  }

  if (slug.includes("home_federal")) {
    const hasHello = normalized.includes("hello");
    const hasH = normalized.includes("startswith") || code.includes("[0]") || normalized.includes(".lower");

    let studentOutput = "$100";
    if (hasHello && hasH) studentOutput = "$0 (for hello), $20 (for howdy), $100 (for other)";
    else if (hasHello) studentOutput = "$0 (for hello), $100 (for howdy - missing starts with h check)";

    let whyFailed = "";
    if (!hasHello) {
      whyFailed = "Your greeting validation is missing the check for exactly 'hello'.";
    } else if (!hasH) {
      whyFailed = "Your code is missing the logic to check if a greeting starts with the letter 'h' (but is not 'hello'). You should use .startswith('h') or [0] == 'h'.";
    } else {
      whyFailed = "Make sure greetings are parsed case-insensitively and whitespace is stripped.";
    }

    return { expected: "$0 (hello) / $20 (starts with h) / $100 (others)", student: studentOutput, whyFailed };
  }

  if (slug.includes("file_extensions")) {
    const hasEnd = normalized.includes("endswith") || normalized.includes("split");
    const hasOctet = normalized.includes("octet-stream");

    let studentOutput = "No mapping / None";
    if (hasEnd && hasOctet) studentOutput = "image/jpeg (for .jpg), text/plain (for .txt), etc.";
    else if (hasEnd) studentOutput = "image/jpeg (for .jpg), missing fallback application/octet-stream";

    let whyFailed = "";
    if (!hasEnd) {
      whyFailed = "Your code is missing file extension parsing logic (like .endswith() or .split('.')).";
    } else if (!hasOctet) {
      whyFailed = "Your code is missing the default fallback MIME type 'application/octet-stream' when the file extension is unrecognized.";
    } else {
      whyFailed = "Ensure all requested extension mappings are checked case-insensitively (e.g., .PDF should map to application/pdf).";
    }

    return { expected: "image/jpeg (for .jpg), application/octet-stream (fallback)", student: studentOutput, whyFailed };
  }

  if (slug.includes("math_interpreter")) {
    const hasSplit = normalized.includes("split(");
    const hasFloatFormat = normalized.includes(".1f") || normalized.includes("round(");

    let studentOutput = "3 (integer output)";
    if (hasSplit && hasFloatFormat) studentOutput = "3.0 (formatted float)";

    let whyFailed = "";
    if (!hasSplit) {
      whyFailed = "Your code is missing split() to partition the input expression 'x y z' into spaces.";
    } else if (!hasFloatFormat) {
      whyFailed = "The specification requires printing the calculated result as a float formatted to 1 decimal place (e.g. 3.0 instead of 3). Use f-strings like {:.1f} or round().";
    } else {
      whyFailed = "Ensure you handle division by float(/) and parse strings to float/integer correctly.";
    }

    return { expected: "3.0", student: studentOutput, whyFailed };
  }

  if (slug.includes("meal_time")) {
    const hasConvert = code.includes("def convert");
    const hasSplit = normalized.includes("split(");

    let studentOutput = "None";
    if (hasConvert && hasSplit) studentOutput = "breakfast / lunch / dinner";

    let whyFailed = "";
    if (!hasConvert) {
      whyFailed = "The specification requires defining a convert(time) function that returns a float representing decimal hours.";
    } else if (!hasSplit) {
      whyFailed = "Inside your convert function, split the string on ':' to separate hours and minutes.";
    } else {
      whyFailed = "Ensure your main logic checks the returned decimal value against the breakfast (7.0 - 8.0), lunch (12.0 - 13.0), and dinner (18.0 - 19.0) boundaries.";
    }

    return { expected: "breakfast / lunch / dinner", student: studentOutput, whyFailed };
  }

  // --- LECTURE 2 ---
  if (slug.includes("camel_case") || slug.includes("camelcase")) {
    const hasLoop = normalized.includes("for") || normalized.includes("while");
    const hasCase = normalized.includes("isupper") || normalized.includes("islower");

    let studentOutput = "camelCase";
    if (hasLoop && hasCase) studentOutput = "camel_case";

    let whyFailed = "";
    if (!hasLoop) {
      whyFailed = "Your code needs a loop (for char in string) to inspect case boundaries character-by-character.";
    } else if (!hasCase) {
      whyFailed = "Use the .isupper() method on characters to detect when a boundary is hit, allowing you to insert an underscore.";
    } else {
      whyFailed = "Ensure all converted uppercase characters are printed as lowercase in snake_case format.";
    }

    return { expected: "camel_case", student: studentOutput, whyFailed };
  }

  if (slug.includes("coke_machine")) {
    const hasLoop = normalized.includes("while");
    const hasCoins = normalized.includes("25") || normalized.includes("10") || normalized.includes("5");

    let studentOutput = "No loop / terminal exit";
    if (hasLoop && hasCoins) studentOutput = "Amount Due: 25 -> Change Owed: 0";

    let whyFailed = "";
    if (!hasLoop) {
      whyFailed = "A while loop is required to keep prompting the user for coins until the cost (50 cents) is satisfied.";
    } else if (!hasCoins) {
      whyFailed = "Make sure your vending machine only accepts coins in denominations of 25, 10, and 5. Ignore other coin inputs.";
    } else {
      whyFailed = "Ensure your loop terminates when amount due reaches <= 0 and outputs the correct change owed.";
    }

    return { expected: "Change Owed: 0 (or correct amount)", student: studentOutput, whyFailed };
  }

  if (slug.includes("twttr") || slug.includes("just_setting_up")) {
    const hasVowels = normalized.includes("aeiou");
    const hasLoop = normalized.includes("for") || normalized.includes("while");

    let studentOutput = "Twitter";
    if (hasLoop && hasVowels) studentOutput = "Twttr";

    let whyFailed = "";
    if (!hasLoop) {
      whyFailed = "A loop is needed to iterate through characters in the input and remove vowels.";
    } else if (!hasVowels) {
      whyFailed = "Your checks are missing vowel identification. Create a list or string of vowels 'aeiouAEIOU' to match against.";
    } else {
      whyFailed = "Make sure you strip out both uppercase and lowercase vowels from the final printed string.";
    }

    return { expected: "Twttr", student: studentOutput, whyFailed };
  }

  if (slug.includes("vanity_plates")) {
    const hasValidFn = code.includes("def is_valid");
    const hasLen = normalized.includes("len(");

    let studentOutput = "CS50 -> Invalid";
    if (hasValidFn && hasLen) studentOutput = "CS50 -> Valid";

    let whyFailed = "";
    if (!hasValidFn) {
      whyFailed = "The specification requires defining an is_valid(s) helper function that returns True or False.";
    } else if (!hasLen) {
      whyFailed = "Your plate checks are missing length constraints (length must be between 2 and 6 characters).";
    } else {
      whyFailed = "Check your vanity conditions: starts with at least two letters, numbers are only at the end, the first number is not '0', and no punctuation is allowed.";
    }

    return { expected: "CS50 -> Valid", student: studentOutput, whyFailed };
  }

  if (slug.includes("nutrition_facts")) {
    const hasDict = normalized.includes("apple") || normalized.includes("calories");
    const hasCase = normalized.includes("lower") || normalized.includes("title");

    let studentOutput = "No nutrition info found";
    if (hasDict && hasCase) studentOutput = "Apple -> Calories: 130";

    let whyFailed = "";
    if (!hasDict) {
      whyFailed = "You should define a dictionary containing fruits (keys) and their calorie counts (values) as specified in the FDA poster.";
    } else if (!hasCase) {
      whyFailed = "Convert user input case (e.g. to lowercase or title case) so fruit names are successfully found regardless of capitalization.";
    } else {
      whyFailed = "Ensure your code prints nothing if the inputted fruit is not in the dictionary.";
    }

    return { expected: "Calories: 130 (for Apple)", student: studentOutput, whyFailed };
  }

  // Fallback
  return {
    expected: "Correct output format",
    student: "Incorrect output or failed static assertion checks",
    whyFailed: "Your code failed to meet one or more required assertions in the test suite.",
  };
}

export function getProgressiveHints(problemSlug: string): ProgressiveHints {
  const slug = problemSlug.toLowerCase();

  // --- LECTURE 0 ---
  if (slug.includes("indoor_voice")) {
    return {
      hint1: "The problem requires converting all letters in the user's input to lowercase. Strings in Python are objects that have built-in methods for casing.",
      hint2: "You should use the `.lower()` string method. You can read the input using `input()`, and call `.lower()` on it to convert the entire string to lowercase.",
      hint3: "Consider using a string method that converts all characters to lowercase. For example:\n```python\ntext = input()\nprint(text.lower())\n```"
    };
  }

  if (slug.includes("playback_speed")) {
    return {
      hint1: "The problem requires replacing every space character with three periods `...`. Python strings have built-in methods to search and replace text.",
      hint2: "You should use Python's `.replace(old, new)` string method, where the first argument `old` is a single space `' '` and the second argument `new` is three periods `'...'`.",
      hint3: "Consider using a string method that replaces spaces with periods. For example:\n```python\ntext = input()\nprint(text.replace(' ', '...'))\n```"
    };
  }

  if (slug.includes("making_faces")) {
    return {
      hint1: "The problem requires writing a function `convert(text)` to replace `:)` and `:(` with emojis, and a `main()` function to run the program. This introduces function structures and return values.",
      hint2: "Inside your `convert` function, use the `.replace()` method twice (or chain them) to replace `:)` with `🙂` and `:(` with `🙁`. The function must `return` the final string.",
      hint3: "Define a convert function that replaces both emoticons and returns the result. For example:\n```python\ndef convert(text):\n    return text.replace(':)', '🙂').replace(':(', '🙁')\n```"
    };
  }

  if (slug.includes("einstein")) {
    return {
      hint1: "The problem requires calculating E = mc², where c is the speed of light constant (300,000,000 meters per second). We need to read input, convert it to an integer, and compute the energy.",
      hint2: "Convert the input string to an integer using `int(input())`. Then multiply it by the speed of light squared. In Python, you can square a number using `** 2` or by multiplying it by itself.",
      hint3: "Squaring a number in Python uses the exponent operator **. For example:\n```python\nmass = int(input())\nc = 300000000\nenergy = mass * (c ** 2)\nprint(energy)\n```"
    };
  }

  if (slug.includes("tip_calculator")) {
    return {
      hint1: "The problem requires implementing two helper functions: `dollars_to_float` and `percent_to_float` to clean input strings and convert them into floats, which are then used in a tip formula.",
      hint2: "In `dollars_to_float(d)`, strip the leading `$` character (e.g. using `.replace('$', '')`) and convert the rest to a float. In `percent_to_float(p)`, strip the trailing `%` character, convert it to a float, and divide by 100 to get a decimal.",
      hint3: "Strip formatting characters and convert to float, then divide the percentage. For example:\n```python\ndef dollars_to_float(d):\n    return float(d.replace('$', ''))\n\ndef percent_to_float(p):\n    return float(p.replace('%', '')) / 100\n```"
    };
  }

  // --- LECTURE 1 ---
  if (slug.includes("deep_thought")) {
    return {
      hint1: "The program should prompt the user and print 'Yes' if they enter '42', 'forty-two', or 'forty two' (case-insensitively). Otherwise, print 'No'.",
      hint2: "First, convert the input using `.lower()` and strip whitespace with `.strip()`. Then use an `if` condition to check if the cleaned string equals any of the accepted responses.",
      hint3: "You can combine checks in a single conditional statement:\n```python\nanswer = input(\"Great Answer? \").lower().strip()\nif answer == \"42\" or answer == \"forty-two\" or answer == \"forty two\":\n    print(\"Yes\")\nelse:\n    print(\"No\")\n```"
    };
  }

  if (slug.includes("home_federal")) {
    return {
      hint1: "The bank prints '$0' if the greeting is exactly 'hello', '$20' if it starts with 'h' (but is not 'hello'), and '$100' otherwise.",
      hint2: "Clean the greeting first (lowercase and strip spaces). Check if it equals 'hello' first. If not, use `.startswith('h')` to catch other greetings starting with 'h'.",
      hint3: "Use an if-elif-else construct to classify the greetings correctly:\n```python\ngreeting = input(\"Greeting: \").lower().strip()\nif greeting.startswith(\"hello\"):\n    print(\"$0\")\nelif greeting.startswith(\"h\"):\n    print(\"$20\")\nelse:\n    print(\"$100\")\n```"
    };
  }

  if (slug.includes("file_extensions")) {
    return {
      hint1: "The program checks a filename's extension and prints its corresponding Media Type (MIME type). If unrecognized, print 'application/octet-stream'.",
      hint2: "Use `.endswith()` to check for `.gif`, `.jpg`, `.jpeg`, `.png`, `.pdf`, `.txt`, and `.zip` extensions. Remember to clean case boundaries using `.lower()` and `.strip()`.",
      hint3: "You can write a series of checks:\n```python\nfilename = input(\"File name: \").lower().strip()\nif filename.endswith(\".gif\"):\n    print(\"image/gif\")\nelif filename.endswith(\".jpg\") or filename.endswith(\".jpeg\"):\n    print(\"image/jpeg\")\n# ... continue other checks ...\nelse:\n    print(\"application/octet-stream\")\n```"
    };
  }

  if (slug.includes("math_interpreter")) {
    return {
      hint1: "The program parses arithmetic expressions like '1 + 1' and prints the floating-point result formatted to 1 decimal place.",
      hint2: "Use `.split(\" \")` to separate the input string into three parts: `x`, `y` (operator), and `z`. Convert `x` and `z` to integers, perform the operator matching, and print the formatted float.",
      hint3: "Format floats in Python using f-strings or round():\n```python\nx, y, z = input(\"Expression: \").split(\" \")\nx = float(x)\nz = float(z)\nif y == \"+\":\n    result = x + z\n# ... handle other operators ...\nprint(f\"{result:.1f}\")\n```"
    };
  }

  if (slug.includes("meal_time")) {
    return {
      hint1: "The program takes a 24-hour time string (e.g. '7:30') and determines if it is breakfast, lunch, or dinner time.",
      hint2: "Implement a function `convert(time)` that splits the string by `:` and returns the decimal hour (e.g., `'7:30'` -> `7.5`). In `main`, call `convert` and check if the result falls in the designated ranges.",
      hint3: "Here is the structure for `convert`:\n```python\ndef convert(time):\n    hours, minutes = time.split(\":\")\n    return float(hours) + float(minutes) / 60\n```"
    };
  }

  // --- LECTURE 2 ---
  if (slug.includes("camel_case") || slug.includes("camelcase")) {
    return {
      hint1: "The program converts a camelCase string into a snake_case string (e.g. `firstName` -> `first_name`).",
      hint2: "Iterate through each character of the string. If the character is uppercase (check with `.isupper()`), print an underscore `_` followed by the character in lowercase. Otherwise, print it as-is.",
      hint3: "Loop and print characters without default newlines using the `end=\"\"` parameter in `print()`:\n```python\ncamel = input(\"camelCase: \")\nfor char in camel:\n    if char.isupper():\n        print(\"_\" + char.lower(), end=\"\")\n    else:\n        print(char, end=\"\")\nprint() # Print final newline\n```"
    };
  }

  if (slug.includes("coke_machine")) {
    return {
      hint1: "The machine prompts the user to insert coins (25, 10, 5) until they satisfy the 50 cent cost, then prints the change owed.",
      hint2: "Use a `while` loop that runs as long as the remaining amount due is greater than 0. Check if the inputted coin value is in `[25, 10, 5]`, decrement the due amount, and print the status.",
      hint3: "Track progress using variables:\n```python\ndue = 50\nwhile due > 0:\n    print(f\"Amount Due: {due}\")\n    coin = int(input(\"Insert Coin: \"))\n    if coin in [25, 10, 5]:\n        due -= coin\nprint(f\"Change Owed: {abs(due)}\")\n```"
    };
  }

  if (slug.includes("twttr") || slug.includes("just_setting_up")) {
    return {
      hint1: "The program prompts the user for text and outputs the text with all vowels (A, E, I, O, U) removed.",
      hint2: "Iterate through the string with a `for` loop. Check if the lowercase version of the character is NOT inside the string `'aeiou'`. If so, print the character; otherwise, ignore it.",
      hint3: "Loop and filter characters:\n```python\ntext = input(\"Input: \")\nfor char in text:\n    if char.toLowerCase() not in \"aeiou\":\n        print(char, end=\"\")\nprint()\n```"
    };
  }

  if (slug.includes("vanity_plates")) {
    return {
      hint1: "The program validates license plates according to rules: length 2-6, starts with 2 letters, numbers only at end, first number not '0', no punctuation.",
      hint2: "Implement `is_valid(s)`. Check length with `len(s)`. Check the first two characters with `.isalpha()`. Check that punctuation is excluded with `.isalnum()`. Scan for the first number digit and verify it is not '0', and that all characters after it are also numbers.",
      hint3: "Here is a conceptual breakdown for number checks:\n```python\n# Verify first number condition\nfor i in range(len(s)):\n    if s[i].isdigit():\n        if s[i] == '0':\n            return False\n        # Remaining characters must be digits\n        return s[i:].isdigit()\n```"
    };
  }

  if (slug.includes("nutrition_facts")) {
    return {
      hint1: "The program prompts the user for a fruit and prints the calories from the FDA poster. If the fruit is not on the poster, it prints nothing.",
      hint2: "Define a dictionary mapping fruit strings (e.g. `'apple'`) to their calories. Convert the user input to lowercase or title case, perform a dictionary lookup, and print the results if found.",
      hint3: "Dictionary lookup in Python:\n```python\nfruits = { \"apple\": 130, \"banana\": 110, \"sweet cherries\": 100 }\nuser_fruit = input(\"Item: \").lower()\nif user_fruit in fruits:\n    print(f\"Calories: {fruits[user_fruit]}\")\n```"
    };
  }

  // Fallback progressive hints
  return {
    hint1: "Let's review the programming concepts. Check what the problem requires: does it ask for specific functions, inputs, or outputs?",
    hint2: "Break down the problem into smaller parts: first read the input, then process it (e.g., using string methods, loops, or math), and finally output the result.",
    hint3: "Review the lectures or notes on these topics. A general structure in Python is:\n```python\n# Read input\nval = input()\n# Process and print\nprint(val)\n```"
  };
}

export function reviewStudentCode(code: string, problemSlug: string): CodeReviewResult {
  const analysis = analyzeCode(code);
  const normalized = analysis.normalizedLower;
  const slug = problemSlug.toLowerCase();
  
  const checks: CodeReviewCheck[] = [];
  const issues: string[] = [];

  // Check 1: Reads User Input
  const needsInput = ["indoor_voice", "playback_speed", "making_faces", "einstein", "deep_thought", "home_federal", "file_extensions", "math_interpreter", "meal_time", "camel_case", "coke_machine", "twttr", "nutrition_facts"].some(p => slug.includes(p));
  if (needsInput) {
    if (analysis.hasInput) {
      checks.push({ status: "correct", message: "Correctly reads user input" });
    } else {
      checks.push({ status: "error", message: "Missing input() call to read user input" });
      issues.push("Your code does not prompt the user for input. Use the input() function.");
    }
  }

  // Check 2: Prints Output
  if (analysis.hasPrint) {
    checks.push({ status: "correct", message: "Prints output" });
  } else {
    checks.push({ status: "error", message: "Missing print() call to output results" });
    issues.push("Your code needs to output the result to the console using the print() function.");
  }

  // Check 3: Boolean comparisons
  if (code.includes("== True") || code.includes("== False")) {
    checks.push({ status: "warning", message: "Explicit boolean comparison detected" });
    issues.push("Potential Issue: You are comparing explicitly against True or False (e.g. x == True). In Python, you can just write 'if x:' or 'if not x:'.");
  }

  // Check 4: Unused variables
  const lines = analysis.codeWithoutComments.split("\n");
  const assignedVars: string[] = [];
  const varRegex = /\b([a-zA-Z_]\w*)\s*=[^=]/;
  for (const line of lines) {
    const match = line.match(varRegex);
    if (match) {
      const varName = match[1];
      if (!["self", "True", "False", "None", "int", "float", "str"].includes(varName) && varName.length > 1) {
        assignedVars.push(varName);
      }
    }
  }

  const uniqueAssigned = [...new Set(assignedVars)];
  const unusedVars: string[] = [];
  for (const v of uniqueAssigned) {
    const escapedVar = v.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const appearances = analysis.codeWithoutComments.match(new RegExp(`\\b${escapedVar}\\b`, 'g'));
    if (appearances && appearances.length === 1) {
      unusedVars.push(v);
    }
  }

  if (unusedVars.length > 0) {
    checks.push({ status: "warning", message: `Unused variables: ${unusedVars.join(", ")}` });
    issues.push(`Potential Issue: The variable(s) [${unusedVars.join(", ")}] are assigned but never used.`);
  }

  // Check 5: Function-based print vs return
  const isFuncProblem = requiresReturn(slug);
  if (isFuncProblem) {
    if (analysis.hasFunctionDef) {
      if (analysis.hasPrint && !analysis.hasReturn) {
        checks.push({ status: "error", message: "Prints inside helper function where return is expected" });
        issues.push("Potential Issue: Helper function prints output instead of returning it.");
      } else if (analysis.hasReturn) {
        checks.push({ status: "correct", message: "Helper function returns value" });
      } else {
        checks.push({ status: "warning", message: "Missing return statement in helper function" });
        issues.push("Potential Issue: Helper function does not seem to return a value.");
      }
    } else {
      checks.push({ status: "error", message: "Missing required function definition" });
      issues.push("Potential Issue: This problem requires you to define specific functions.");
    }
  }

  // --- PROBLEM SPECIFIC REVIEW RULES ---
  
  // Lecture 0
  if (slug.includes("indoor_voice")) {
    if (normalized.includes(".upper(")) {
      checks.push({ status: "error", message: "Usage of .upper() detected" });
      issues.push("Potential Issue: You are using upper() but the problem expects lowercase output.");
    } else if (normalized.includes(".lower(")) {
      checks.push({ status: "correct", message: "Uses lowercase conversion (.lower())" });
    } else {
      checks.push({ status: "warning", message: "Missing lowercase conversion" });
      issues.push("Potential Issue: You are not converting the text to lowercase. You should use the lower() method.");
    }
  }

  if (slug.includes("playback_speed")) {
    if (normalized.includes(".replace(")) {
      const correctReplace = /\.replace\(["']\s["']\s*,\s*["']\.\.\.["']\)/.test(code) || /\.replace\(["']["']\s["']["']\s*,\s*["']["']\.\.\.["']["']\)/.test(normalized);
      if (correctReplace) {
        checks.push({ status: "correct", message: "Uses .replace() correctly to insert ellipses" });
      } else {
        checks.push({ status: "warning", message: "Incorrect replacement target/value" });
        issues.push("Potential Issue: Your replace() parameters might be incorrect. Make sure you replace spaces with '...'.");
      }
    } else {
      checks.push({ status: "error", message: "Missing replace() method" });
      issues.push("Potential Issue: You need to use the replace() string method to swap spaces with periods.");
    }
  }

  if (slug.includes("making_faces")) {
    const hasReplace = normalized.includes("replace(");
    const hasEmoji1 = code.includes("🙂") || normalized.includes(":)");
    const hasEmoji2 = code.includes("🙁") || normalized.includes(":(");
    const hasConvert = /def\s+convert\s*\(/.test(code);
    const hasMain = /def\s+main\s*\(/.test(code);

    if (hasConvert) {
      checks.push({ status: "correct", message: "Defined convert() function" });
    } else {
      checks.push({ status: "error", message: "Missing convert() function" });
      issues.push("Potential Issue: You must define a convert() function.");
    }

    if (hasMain) {
      checks.push({ status: "correct", message: "Defined main() function" });
    } else {
      checks.push({ status: "warning", message: "Missing main() function" });
      issues.push("Potential Issue: It is recommended to define a main() function.");
    }

    if (hasReplace && hasEmoji1 && hasEmoji2) {
      checks.push({ status: "correct", message: "Emoji replacement logic active" });
    } else {
      checks.push({ status: "error", message: "Missing emoticon replacement logic" });
      issues.push("Potential Issue: Your convert() function does not replace both emoticons with emojis.");
    }
  }

  if (slug.includes("einstein")) {
    const hasSpeed = normalized.includes("300000000");
    const hasInt = normalized.includes("int(");
    const hasFormula = normalized.includes("**") || normalized.includes("*300000000*300000000");

    if (hasSpeed) {
      checks.push({ status: "correct", message: "Uses speed of light constant" });
    } else {
      checks.push({ status: "error", message: "Missing speed of light constant" });
      issues.push("Potential Issue: Speed of light constant (300000000) is missing.");
    }

    if (hasInt) {
      checks.push({ status: "correct", message: "Converts input to integer" });
    } else {
      checks.push({ status: "error", message: "Missing integer conversion" });
      issues.push("Potential Issue: You must convert mass to an integer with int().");
    }

    if (hasFormula) {
      checks.push({ status: "correct", message: "Uses exponent operator or squaring formula" });
    } else {
      checks.push({ status: "error", message: "Missing exponent operator or squared calculation" });
      issues.push("Potential Issue: Squaring c is required (E = mc²). Use c ** 2.");
    }
  }

  if (slug.includes("tip_calculator")) {
    const hasDollars = code.includes("def dollars_to_float");
    const hasPercent = code.includes("def percent_to_float");
    const hasFloat = normalized.includes("float(");
    const hasDiv = normalized.includes("/100");

    if (hasDollars && hasPercent) {
      checks.push({ status: "correct", message: "Defined helper functions" });
    } else {
      checks.push({ status: "error", message: "Missing dollars_to_float or percent_to_float" });
      issues.push("Potential Issue: You must define both dollars_to_float and percent_to_float.");
    }

    if (hasFloat) {
      checks.push({ status: "correct", message: "Converts string variables to float numbers" });
    } else {
      checks.push({ status: "error", message: "Missing float conversion" });
      issues.push("Potential Issue: Convert values to float numbers using float().");
    }

    if (hasDiv) {
      checks.push({ status: "correct", message: "Divides percent value by 100" });
    } else {
      checks.push({ status: "error", message: "Missing tip calculation arithmetic" });
      issues.push("Potential Issue: You must divide percentage values by 100.");
    }
  }

  // Lecture 1
  if (slug.includes("deep_thought")) {
    const has42Check = normalized.includes("42") && (normalized.includes("forty-two") || normalized.includes("fortytwo") || normalized.includes("forty two"));
    if (has42Check) {
      checks.push({ status: "correct", message: "Checks for multiple forms of '42'" });
    } else {
      checks.push({ status: "error", message: "Incomplete answer validation" });
      issues.push("Potential Issue: Check for '42', 'forty-two', and 'forty two' (case-insensitively).");
    }
  }

  if (slug.includes("home_federal")) {
    const hasStartH = normalized.includes("startswith") || code.includes("[0]");
    if (hasStartH) {
      checks.push({ status: "correct", message: "Checks for greeting prefix rules" });
    } else {
      checks.push({ status: "error", message: "Missing greeting prefix validation" });
      issues.push("Potential Issue: Make sure to check if the greeting starts with 'h' (but is not 'hello').");
    }
  }

  if (slug.includes("file_extensions")) {
    const hasOctet = normalized.includes("octet-stream");
    if (hasOctet) {
      checks.push({ status: "correct", message: "Includes default octet-stream fallback" });
    } else {
      checks.push({ status: "error", message: "Missing unrecognized extension fallback" });
      issues.push("Potential Issue: Output 'application/octet-stream' if the extension is not matched.");
    }
  }

  if (slug.includes("math_interpreter")) {
    const hasSplit = normalized.includes("split(");
    const hasFloatOutput = normalized.includes(".1f") || normalized.includes("round(");
    if (hasSplit && hasFloatOutput) {
      checks.push({ status: "correct", message: "Parses operands and formats decimal output" });
    } else {
      if (!hasSplit) {
        checks.push({ status: "error", message: "Missing split operation" });
        issues.push("Potential Issue: Use split() to extract variables and operators.");
      }
      if (!hasFloatOutput) {
        checks.push({ status: "warning", message: "Missing float formatting" });
        issues.push("Potential Issue: The result should be formatted to 1 decimal place (e.g. 3.0).");
      }
    }
  }

  if (slug.includes("meal_time")) {
    const hasConvert = code.includes("def convert");
    if (hasConvert) {
      checks.push({ status: "correct", message: "Defined convert() helper function" });
    } else {
      checks.push({ status: "error", message: "Missing convert() function" });
      issues.push("Potential Issue: You must define a convert(time) helper function that returns hours as a float.");
    }
  }

  // Lecture 2
  if (slug.includes("camel_case") || slug.includes("camelcase")) {
    const hasLoop = normalized.includes("for") || normalized.includes("while");
    const hasUpperCheck = normalized.includes("isupper");
    if (hasLoop && hasUpperCheck) {
      checks.push({ status: "correct", message: "Loops characters and checks for uppercase boundaries" });
    } else {
      checks.push({ status: "error", message: "Missing loop or case checking" });
      issues.push("Potential Issue: Loop through each character and check if it is uppercase using isupper().");
    }
  }

  if (slug.includes("coke_machine")) {
    const hasLoop = normalized.includes("while");
    const hasCondition = normalized.includes(">") || normalized.includes("<") || normalized.includes("==") || normalized.includes("!=");
    if (hasLoop && hasCondition) {
      checks.push({ status: "correct", message: "Loops coin acceptance state until total is reached" });
    } else {
      checks.push({ status: "error", message: "Missing coin acceptance loop" });
      issues.push("Potential Issue: Vending machine should repeatedly request coins using a while loop.");
    }
  }

  if (slug.includes("twttr") || slug.includes("just_setting_up")) {
    const hasAeiou = normalized.includes("aeiou");
    if (hasAeiou) {
      checks.push({ status: "correct", message: "Contains checks for vowels (aeiou)" });
    } else {
      checks.push({ status: "error", message: "Missing vowel check definition" });
      issues.push("Potential Issue: Check characters against a string containing all vowels ('aeiouAEIOU').");
    }
  }

  if (slug.includes("vanity_plates")) {
    const hasValidFn = code.includes("def is_valid");
    if (hasValidFn) {
      checks.push({ status: "correct", message: "Defined is_valid() function" });
    } else {
      checks.push({ status: "error", message: "Missing is_valid() function definition" });
      issues.push("Potential Issue: You must define an is_valid(s) validation function.");
    }
  }

  if (slug.includes("nutrition_facts")) {
    const hasDict = normalized.includes("apple") || normalized.includes("calories") || code.includes("{");
    if (hasDict) {
      checks.push({ status: "correct", message: "FDA poster fruit dictionary initialized" });
    } else {
      checks.push({ status: "error", message: "Missing FDA fruits database dictionary" });
      issues.push("Potential Issue: Define a dictionary mapping fruits to their calories.");
    }
  }

  if (checks.filter(c => c.status === 'correct').length === checks.length && issues.length === 0) {
    checks.push({ status: "correct", message: "Code matches structural expectations!" });
  }

  return { checks, issues };
}


