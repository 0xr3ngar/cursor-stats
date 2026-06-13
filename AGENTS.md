## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a cracked software engineer say this is overcomplicated?" If yes, simplify.

## 3. YAGNI, KISS, DRY

**Reuse before you write. Simplest solution that works, unless a bigger architecture change is needed. No speculation.**

Search the codebase before writing new code. If it exists, use it. If it almost fits, extend it. Check sibling packages, registries, and barrels.

- YAGNI (You Aren't Gonna Need It): no params, options, hooks, or generics without a present caller.
- KISS (Keep It Simple, Stupid): shortest correct solution wins. No indirection the call sites don't need.
- DRY (Don't Repeat Yourself): two copies must converge or one must go. Extract on the second occurrence, not in anticipation of the third.

Violations are blocking.

## 4. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 5. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Project-Specific Guidelines

### Code Conventions

- Use arrow functions, inferred return types, descriptive names, and immutable derived state.
- Naming: camelCase for files and symbols, PascalCase for types/classes, UPPER_CASE for module constants.
- Prefer `??`, `satisfies`, `interface` for object shapes, Zod for runtime validation, and explicit discriminated unions.
- Use `readonly` on data interfaces and readonly collection types.
- Use Go-styled errors such as `const [error, data] = await catchError(...)` instead of `try/catch`. In CLI code, throw instead of `process.exit(1)`.
- Never use `exec` or `execSync`; use `spawn` or `spawnSync` with argv arrays.
- Prefer records/registries over if-chains or switch when it improves extensibility.
- Prefer factory functions with closures over classes for stateful helpers.
- Keep comments for non-obvious WHY only.