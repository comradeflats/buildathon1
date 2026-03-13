---
name: debug
description: Use when debugging or fixing code that has been copy-pasted. It analyzes the errors, implements a solution, and ALWAYS finishes by running npm run build to ensure the code builds without errors.
---

# Debugger

## Overview

This skill provides a systematic approach for diagnosing and fixing issues in copy-pasted code. Often, pasted code introduces mismatched imports, missing dependencies, undefined variables, or syntax errors. 

## Workflow

When invoked to debug copy-pasted code, strictly follow this procedure:

### 1. Analyze the Context
- Review the provided copy-pasted code and any associated error messages (e.g., from the terminal or browser console).
- Look for missing imports, syntax errors, mismatched brackets, or incompatible type definitions.
- If the error isn't immediately obvious, read the target file's existing code to understand how the pasted code integrates with the rest of the application.

### 2. Formulate and Implement the Fix
- Formulate a clear plan for what needs to be changed.
- Use the provided file editing tools (`replace`, `write_file`) to apply the surgical fix to the exact lines that need modification.
- Ensure the fix strictly aligns with the project's existing architectural and stylistic conventions.

### 3. MANDATORY: Verify with Build
- **This step is non-negotiable.** After implementing the solution, you must verify that the codebase compiles successfully.
- Run the build command (typically `npm run build`) using the shell execution tool.
- If the build fails, repeat steps 1-3 based on the new error output. Do not stop until the build passes without any errors.
