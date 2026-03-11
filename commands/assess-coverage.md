# assess-coverage

Analyze test coverage gaps and identify high-priority files needing tests. Focus on recent changes and uncovered core functionality.

## Workflow

### Step 1: Generate Coverage Data

First, ensure coverage data exists:

```bash
npm run test:coverage
```

### Step 2: Analyze Coverage Gaps

Run the gap analysis script to identify files with lowest coverage:

```bash
node scripts/analyze-coverage-gaps.js
```

### Step 3: Identify Recent Changes (if applicable)

Check which files have been recently modified:

```bash
git diff --name-only HEAD~10 -- 'src/**/*.ts' 'src/**/*.tsx' | grep -v '.test.'
```

Cross-reference recent changes with coverage gaps to prioritize testing efforts.

## Coverage Tools Reference

| Script | Purpose |
|--------|---------|
| `scripts/analyze-coverage-gaps.js` | Lists files with lowest coverage, sorted by priority |
| `scripts/check-coverage-json.js` | Validates coverage against baselines using JSON output |
| `scripts/check-coverage.js` | Pre-push hook coverage validation |
| `scripts/coverage-config.js` | Baseline thresholds (do not lower these values) |

## Baseline Thresholds

From `scripts/coverage-config.js`:

- **Statements**: 80%
- **Branches**: 81%
- **Functions**: 69%
- **Lines**: 80%

## Priority Assessment Criteria

When identifying high-priority gaps, consider:

### 1. Core Functionality (Highest Priority)
Files in these directories are critical:
- `src/services/` - Business logic (AccountService, SyncService, etc.)
- `src/lib/watermelondb/repositories/` - Data access layer
- `src/utils/` - Pure utility functions (should have near 100% coverage)
- `src/hooks/` - Custom React hooks with business logic

### 2. Recent Changes (High Priority)
- Files modified in the last 10 commits
- Files in open PRs or feature branches
- New features lacking test coverage

### 3. Risk Assessment
- Files with complex branching logic (low branch coverage)
- Files with many uncovered functions
- Files with >50 statements and <70% coverage

## Output Format

When reporting coverage gaps, provide:

1. **Summary**: Overall coverage status vs baselines
2. **Priority List**: Top 5-10 files needing immediate attention
3. **Recommendations**: Specific functions/branches to test
4. **Quick Wins**: Small files that can quickly improve coverage

Example output format:

```
## Coverage Assessment

### Current Status
- Statements: 82.5% (baseline: 80%) ✅
- Branches: 78.2% (baseline: 81%) ❌
- Functions: 71.0% (baseline: 69%) ✅
- Lines: 81.3% (baseline: 80%) ✅

### Priority Files (Core + Low Coverage)
1. src/services/SyncService.ts - 45% statements, 30% branches
  - Missing: error handling paths, retry logic
2. src/utils/dateUtils.ts - 60% functions
  - Missing: edge cases for timezone handling

### Recent Changes Needing Tests
- src/screens/Dashboard.tsx (modified 2 commits ago)
- src/hooks/useAccountBalance.ts (new file)

### Quick Wins
- src/utils/formatters.ts - 5 untested pure functions
```

## Commands Reference

```bash
# Full coverage report with HTML output
npm run test:coverage

# Validate against baselines
npm run coverage:check

# Analyze gaps
node scripts/analyze-coverage-gaps.js

# Test specific file with coverage
npx jest --coverage src/services/AccountService.ts

# View HTML report
open coverage/lcov-report/index.html
```

## Integration with Testing Workflow

After identifying gaps, use the `/test` command to write tests for priority files.

Reference: @TESTING.md @CONTRIBUTING.md


