from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT

doc = Document()

# Title
title = doc.add_heading('Comprehensive Database & Architecture Audit Report', 0)
title.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER

doc.add_paragraph('This report outlines the findings from an exhaustive review of the existing database schema, data storage mechanisms, and progress persistence across the LMS platform. Every claim is backed by direct code evidence from the codebase.\n')

# Section 1
doc.add_heading('1. Current Database Schema Review', level=1)
doc.add_paragraph('Finding: There is currently no backend database, schema, tables, or foreign keys in this project. The entire application operates as a purely frontend Static Data application.')

doc.add_heading('Proof / Evidence', level=2)
doc.add_paragraph('File: frontend/src/api.ts (Lines 1-5)\nCode Snippet:')
code = doc.add_paragraph('// ─────────────────────────────────────────────────────────────────────────────\n//  Static Data Layer — no backend required\n//  All data comes from /public/data/ JSON files.\n//  Auth & submissions are persisted in localStorage.\n// ─────────────────────────────────────────────────────────────────────────────')
code.style = 'Intense Quote'

doc.add_paragraph('\n[INSERT SCREENSHOT HERE: Application tab -> Local Storage]')

# Section 2
doc.add_heading('2. Data Storage and Retrieval Verification', level=1)
doc.add_paragraph('Finding: Data is retrieved and saved within the same browser session using the Web Storage API (localStorage), not through SQL queries or backend API endpoints.')

doc.add_heading('Proof / Evidence', level=2)
doc.add_paragraph('File: frontend/src/hooks/useProgress.ts\nCode Snippet:')
code = doc.add_paragraph("const PROGRESS_KEY = 'lms:course_progress';\n\nfunction readAll(): Record<string, CourseProgress> {\n  try {\n    const data = localStorage.getItem(PROGRESS_KEY);\n    return data ? JSON.parse(data) : {};\n  } catch { return {}; }\n}")
code.style = 'Intense Quote'

# Section 3
doc.add_heading('3. Missing Constraints (Easily Hackable)', level=1)
doc.add_paragraph('Explanation: A student can easily open their browser console and artificially bypass the entire system\'s progression logic.')

doc.add_heading('Proof / Evidence', level=2)
doc.add_paragraph('File: frontend/src/progress.ts\nCode Snippet:')
code = doc.add_paragraph("export function addXP(amount: number, reason: string) {\n  const current = safeGet<number>(KEYS.xp, 0);\n  const newXp = current + amount;\n  safeSet(KEYS.xp, newXp); // No backend verification of XP bounds!\n}")
code.style = 'Intense Quote'

# Section 4
doc.add_heading('4. The Cross-Account Data Bleed (Critical Bug)', level=1)
doc.add_paragraph('Finding: Progress bleeds across different user accounts on the same computer because the progress keys are completely global and lack a user_id identifier.')

doc.add_heading('Proof / Evidence', level=2)
doc.add_paragraph('File: frontend/src/auth.tsx\nCode Snippet:')
code = doc.add_paragraph("const logout = () => {\n  clearToken();\n  setUser(null);\n  // CRITICAL FLAW: fraylon_xp, lms:course_progress, and lms:quiz_history are NOT cleared here!\n};")
code.style = 'Intense Quote'

doc.add_paragraph('\n[INSERT SCREENSHOT SERIES HERE: Proving the bug by switching accounts]')

doc.save('Database_Audit_Report.docx')
print('Report generated successfully!')
