# Code Review Skills

## Critical for Vibe Coding
Every line of AI-generated code must be validated. The AI does not run your tests.

## Review Checklist

### Correctness
- [ ] Does it handle all edge cases? (empty, null, boundary values)
- [ ] Are there off-by-one errors?
- [ ] Does it match the spec exactly?
- [ ] Are return types correct?
- [ ] Are side effects intended?

### Security
- [ ] No hardcoded credentials/secrets
- [ ] Input validation present
- [ ] No SQL injection XSS risks
- [ ] Proper error handling (no swallowed exceptions)

### Performance
- [ ] No O(n²) when O(n) or O(log n) is possible
- [ ] No unnecessary iterations
- [ ] Proper data structures used
- [ ] No memory leaks (event listeners, subscriptions)

### Maintainability
- [ ] Clear variable names
- [ ] Consistent style with repo
- [ ] Comments explain *why*, not *what*
- [ ] Functions do one thing
- [ ] Error messages are useful

## Vibe-Specific Validation
1. **Read the generated code** - never accept without reading
2. **Run it** - verify it compiles/executes
3. **Test it** - run existing tests, write new ones for edge cases
4. **Check integration** - does it fit with existing code?

## Red Flags
- Code that "looks right" but wasn't in the context you provided
- Solutions that are overly complex
- Missing error handling
- Hardcoded values that should be configurable
- Copied code without attribution (if that matters for your project)

## Quick Test Strategy
```bash
# If tests exist
git stash       # save current changes
npm test        # run existing tests
git stash pop   # restore changes

# If no tests, manually verify:
# 1. Normal case
# 2. Edge cases
# 3. Error cases
```