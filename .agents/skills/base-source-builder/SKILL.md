---
name: base-source-builder
description: Builds a standard base source quickly for Java, Python, or VueJS projects. Use when creating a new project skeleton, standardizing folder/file naming, or setting up default formatting and required starter files.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
onKeywords: base source, boilerplate, scaffold, starter, skeleton, java, python, vue, vuejs, project structure, formatter, naming convention
---

# Base Source Builder

> Build the smallest correct base source first. Standardize structure, formatting, and naming before adding features.

## Scope

This skill supports ONLY:

- Java
- Python
- VueJS

If the request is for another stack, stop and say this skill does not cover it.

---

## Default Execution Rules

1. Detect which of the three supported stacks matches the request.
2. Before creating files, ask the user which tech stack variant they want within the supported ecosystem when it is not already explicit.
3. If the user does not specify a variant, use these defaults:
   - Java -> Spring Boot on Java 17
   - Python -> FastAPI layered base source on Python 3.12
   - VueJS -> Vue 3 + Vite + TypeScript + Pinia + Tailwind CSS
4. Read [references/common-standards.md](references/common-standards.md) first.
5. Read ONLY the matching stack reference:
   - [references/java-base.md](references/java-base.md)
   - [references/python-base.md](references/python-base.md)
   - [references/vuejs-base.md](references/vuejs-base.md)
6. Create the full base source with:
   - standard directory layout
   - required starter files
   - default formatter and lint rules already configured
   - naming conventions applied from the start
7. Prefer the modern default tooling defined in the stack reference unless the user explicitly asks otherwise.

## Stack Clarification Questions

Ask concise clarification questions before scaffolding when the user only says "Java", "Python", or "VueJS" without enough detail.

- Java:
  - "Do you want Spring Boot with Maven or Spring Boot with Gradle?"
  - "Which Java version should this project use? Recommended: 17 or 21."
- Python:
  - "Do you want a minimal FastAPI base source or a layered FastAPI base source with `router/service/core`?"
  - "Which Python version should this project use? Recommended: 3.11 or 3.12."
- VueJS:
  - "Which Vue version do you want to use?"
  - "Which Node.js version should this project target?"
  - "Which CSS library or styling approach do you want: plain CSS, Tailwind CSS, or Vuetify?"
  - "Do you want router and test setup included from the start?"

If the user gives no preference, continue with the default stack for that ecosystem.

## Version Selection Rules

- Java and Python version prompts should recommend the most common LTS or near-LTS project choices first.
- Do not hard-limit the user to only the recommended versions.
- If the user provides another version explicitly, accept it and scaffold for that version when the stack supports it.
- If the requested version is unusual or risky for the selected framework, continue but warn about compatibility checks.
- If the user gives no version, use the documented default for that ecosystem.

## Environment Preparation Rules

- Before scaffolding VueJS, check whether Node.js is available.
- If Node.js is missing, install it automatically before generating the base source.
- Use the user-requested Node.js version when provided.
- If no version is given, use the default version defined in the VueJS reference.
- After installation, verify both `node -v` and `npm -v`.
- Do not skip environment validation for VueJS scaffolding.

## VueJS Default Choice

If the user does not provide a styling preference for VueJS, use:

- Vue 3
- Node.js 22 LTS
- Vite + TypeScript
- Tailwind CSS
- Router included
- Test setup included

---

## Output Rules

- Generate a runnable, production-sane starter that follows the reference architecture for the chosen stack.
- Do not add optional modules unless they are needed to make the base source coherent.
- Include formatter config in the initial scaffold, not as a follow-up.
- Keep names predictable and boring. Avoid clever directory names.
- Add a short README only if the user asks for one or the task clearly needs setup instructions.
- Prefer the standard folders and layers defined in the stack reference over overly minimal scaffolds.

---

## Validation Checklist

- [ ] Supported stack is Java, Python, or VueJS
- [ ] Tech stack preference was confirmed or a documented default was applied
- [ ] Required runtime environment was checked before scaffolding
- [ ] Directory names follow the naming rules
- [ ] File names follow the naming rules
- [ ] Required files for the chosen stack exist
- [ ] Formatter/linter defaults are configured
- [ ] Entry point exists and matches the chosen stack
- [ ] Tests directory exists if the stack reference requires it
