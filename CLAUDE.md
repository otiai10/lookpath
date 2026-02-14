# CLAUDE.md

Zero-dependency TypeScript library for finding executables in PATH (npm equivalent of Go's `exec.LookPath`). The entire implementation is ~89 lines in `src/index.ts`.

## Commands

```bash
npm ci                  # Install dependencies
npm run build           # Compile TypeScript (rm -rf ./lib && tsc)
npm run lint            # ESLint on src and tests
npm test                # Run Jest tests
npm test -- --coverage  # Tests with coverage
npm run validate        # Build + smoke-test CLI
```

Full CI check: `npm run build && npm run validate && npm run lint && npm test -- --coverage`

## Code Conventions

- Return `undefined` instead of throwing — graceful "not found" semantics
- JSDoc on all functions (`@private` for internal helpers)
- `Promise.all()` for parallel filesystem checks
- Platform detection via `process.platform` for Windows-specific behavior (PATHEXT, `Path` vs `PATH`)
- camelCase functions/variables, PascalCase interfaces
- `@typescript-eslint/explicit-function-return-type` is disabled — return types are inferred

## Testing

Tests in `tests/lookpath.spec.ts` use fixture files in `tests/data/` with specific permission bits. The `beforeAll` hook sets `goodbye_world` to non-executable (0o644). Some tests are platform-conditional (Unix-only executability checks, Windows/macOS case-insensitivity).
