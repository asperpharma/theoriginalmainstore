```markdown
# theoriginalmainstore Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the core development patterns and conventions used in the `theoriginalmainstore` TypeScript repository. It covers file organization, code style, commit practices, and testing approaches to ensure consistency and maintainability across the codebase. While no specific framework or automated workflows are detected, this guide provides practical standards and commands for everyday development tasks.

## Coding Conventions

### File Naming
- Use **PascalCase** for all file names.
  - **Example:** `ProductList.ts`, `UserProfile.ts`

### Import Style
- Use **alias imports** to reference modules.
  - **Example:**
    ```typescript
    import { Product } from 'models/Product';
    ```

### Export Style
- Use **named exports** for all modules.
  - **Example:**
    ```typescript
    export function calculateTotal() { ... }
    export const TAX_RATE = 0.07;
    ```

### Commit Message Patterns
- Prefix feature commits with `feat`.
  - **Example:** `feat: add product search functionality`
- Keep commit messages concise (average ~34 characters).

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new feature or module  
**Command:** `/add-feature`

1. Create a new file using PascalCase (e.g., `NewFeature.ts`).
2. Use alias imports to bring in dependencies.
3. Export functions or constants using named exports.
4. Write a corresponding test file named `NewFeature.test.ts`.
5. Commit changes with a message prefixed by `feat:`.

### Refactoring Code
**Trigger:** When improving or restructuring existing code  
**Command:** `/refactor`

1. Identify the file(s) to refactor.
2. Ensure new or updated files follow PascalCase naming.
3. Update imports/exports to maintain alias and named conventions.
4. Update or add tests as necessary.
5. Commit changes with a clear, concise message.

### Writing Tests
**Trigger:** When adding or updating tests for modules  
**Command:** `/write-test`

1. Create a test file matching the pattern `*.test.ts` (e.g., `Cart.test.ts`).
2. Write test cases for exported functions and components.
3. Run tests using the project's preferred test runner (framework unknown).
4. Commit test files with an appropriate message.

## Testing Patterns

- Test files follow the pattern `*.test.ts`.
- Place test files alongside or within a dedicated `tests` directory.
- Each test file targets a specific module or feature.
- Testing framework is not specified; use standard TypeScript-compatible test runners (e.g., Jest, Mocha) as appropriate.

**Example:**
```typescript
// Product.test.ts
import { calculateTotal } from 'utils/Cart';

describe('calculateTotal', () => {
  it('should sum product prices', () => {
    // test implementation
  });
});
```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /add-feature   | Scaffold and implement a new feature/module  |
| /refactor      | Refactor existing code following conventions |
| /write-test    | Add or update tests for a module             |
```