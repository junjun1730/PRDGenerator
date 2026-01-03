# CLAUDE.md

Automated development workflow guide for AI PRD Generator project.
Claude Code reads this document and executes tasks automatically.

---

## 📦 Project Context

```json
{
  "name": "AI PRD Generator",
  "purpose": "3-stage questionnaire → Auto-generate PRD",
  "stack": ["Next.js 15", "React 19", "TypeScript", "Zustand", "Tailwind"],
  "language": "Korean (UI text)",
  "paradigm": "TDD + Functional Programming"
}
```

**Commands**:

```bash
npm run dev    # Dev server (localhost:3000)
npm test       # Run tests (Vitest)
npm run build  # Production build
```

---

## 🤖 Agent Workflow Protocol

### Execution Trigger

When Claude Code receives a task, **always follow this protocol**:

```
User Request → Classify Task Type → Execute Protocol → Report Status
```

---

## 🔀 Task Classification & Routing

### 1️⃣ Feature Development (NEW)

**Trigger**: "new feature", "add component", "implement form", etc.

**Protocol**: `PROTOCOL_FEATURE_DEV`

````yaml
Step 1: Planning
  - Read: docs/scenarios/ (existing scenarios for reference)
  - Create: docs/scenarios/{feature-name}.md
  - Content:
      - Happy Path (normal scenarios)
      - Edge Cases (boundary conditions)
      - Error States (error handling)
  - Format:
      ```markdown
      # [Feature Name]

      ## Test Scenarios

      ### Happy Path
      - Input: {specific values}
      - Expected: {expected behavior}
      - Validation: {Zod rules}

      ### Edge Cases
      - Empty input → error message
      - Max length exceeded → truncate

      ### Error States
      - Network failure → retry UI
      ```

Step 2: Test Writing (RED)
  - Read: docs/scenarios/{feature-name}.md
  - Create: src/**/__tests__/{feature-name}.test.ts(x)
  - Rules:
      - Use Vitest + React Testing Library
      - Mock all external dependencies
      - One assertion per test case
  - Execute: npm test {feature-name}
  - Verify: Tests MUST fail (RED state)
  - Report: "✗ {N} tests failing as expected"

Step 3: Implementation (GREEN)
  - Read:
      - Failed test output
      - src/lib/types/questionnaire.ts (type definitions)
      - tokens.json (design system)
  - Create: Minimum code to pass tests
  - Execute: npm test {feature-name}
  - Verify: Tests MUST pass (GREEN state)
  - Report: "✓ {N} tests passing"

Step 4: Refactoring (REFACTOR)
  - Apply:
      - Design tokens from tokens.json
      - Animation patterns (progressive reveal)
      - TypeScript strict mode compliance
  - Execute: npm test (full test suite)
  - Verify: All tests still pass
  - Report: "✓ Refactored, all tests passing"

Step 5: Documentation Update
  - Update: process/checklist.md
  - Mark completed tasks with [x]
  - Add new tasks if discovered
````

**Output Template**:

```
🎯 Task: {feature-name}

📋 Scenario Created: docs/scenarios/{feature-name}.md
🔴 Tests Written: {N} failing tests
🟢 Implementation: All tests passing
🔵 Refactored: Design tokens applied
📝 Checklist Updated: process/checklist.md

Files Changed:
- docs/scenarios/{feature-name}.md
- src/**/{feature-name}.tsx
- src/**/__tests__/{feature-name}.test.tsx
```

---

### 2️⃣ Bug Fix

**Trigger**: "fix bug", "resolve error", "test failure", etc.

**Protocol**: `PROTOCOL_BUG_FIX`

```yaml
Step 1: Reproduce
  - Read: Error logs / user report
  - Create: Minimal reproduction test
  - Execute: npm test
  - Verify: Test fails (confirms bug)

Step 2: Fix
  - Apply minimal change
  - Execute: npm test
  - Verify: Test passes

Step 3: Regression Check
  - Execute: npm test (full suite)
  - Verify: No other tests broken
```

---

### 3️⃣ Refactoring Only

**Trigger**: "clean up code", "improve performance", "apply design tokens", etc.

**Protocol**: `PROTOCOL_REFACTOR`

```yaml
Step 1: Baseline
  - Execute: npm test
  - Verify: All tests passing before refactor

Step 2: Refactor
  - Apply changes
  - Maintain behavior (no logic changes)

Step 3: Validation
  - Execute: npm test
  - Verify: All tests still passing
```

---

### 4️⃣ Documentation

**Trigger**: "write docs", "update README", "add comments", etc.

**Protocol**: `PROTOCOL_DOCS`

```yaml
Step 1: Update Target Files
  - README.md (user-facing)
  - CLAUDE.md (agent-facing)
  - process/checklist.md (task tracking)
  - docs/scenarios/ (test scenarios)

Step 2: Verify Links
  - Check all internal references
  - Validate code examples compile
```

---

## 📐 Architecture Reference

### State Management (Zustand)

```typescript
// src/lib/store/useQuestionnaireStore.ts
// Single global store with automatic localStorage sync

const store = useQuestionnaireStore();

// Actions (all immutable updates)
store.updateStage1({ serviceName: "value" }); // Partial update
store.setCurrentStage(2);
store.resetQuestionnaire();
```

### Component Architecture

```
src/
├── components/
│   ├── layout/           # Header, Container, FloatingActions
│   ├── ui/               # Button, Input, Card, Modal (reusable)
│   └── questionnaire/    # Stage1Form, Stage2Form, Stage3Form
├── lib/
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript definitions
│   └── utils/            # cn(), validators
└── app/
    ├── page.tsx          # Homepage (SSG)
    └── api/              # API routes (planned)
```

### Type System

```typescript
// src/lib/types/questionnaire.ts
// All form data follows these types

interface Stage1Data {
  serviceName: string;
  features: string[];
  screens: string[];
  userJourney: string;
  tone: "formal" | "casual" | "friendly";
}

interface Stage2Data {
  /* Design elements */
}
interface Stage3Data {
  /* Technical constraints */
}
```

---

## 🎨 Design System Rules

### Design Tokens (`tokens.json`)

```javascript
// All styling references tokens.json
import tokens from "@/tokens.json";

// ✅ Correct
className = "bg-brand-500 shadow-interactive-md transition-normal";

// ❌ Wrong (hard-coded values)
className = "bg-blue-500 shadow-lg duration-300";
```

### Animation Patterns

**Progressive Question Reveal**:

```typescript
// Questions appear sequentially (when user completes previous question)
<div
  className="animate-slideInUp opacity-0"
  style={{
    animationDelay: `${index * 150}ms`,
    animationFillMode: "forwards",
  }}
>
  <Question />
</div>
```

**Interactive States**:

```typescript
// Input focus
className =
  "focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring";

// Button hover
className =
  "hover:scale-102 active:scale-98 transition-transform duration-normal";
```

### Responsive Utilities

```typescript
// Mobile-first approach
className = "px-4 sm:px-6 lg:px-8"; // 320px → 640px → 1024px

// Container wrapper
className = "container-responsive"; // max-w-7xl + responsive padding
```

---

## 🧪 Testing Standards

### Test Structure

```typescript
// Component Test Template
import { render, screen, fireEvent } from "@testing-library/react";

describe("ComponentName", () => {
  // Happy Path
  it("should render with default props", () => {
    render(<Component />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
  });

  // User Interaction
  it("should handle click event", () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Edge Case
  it("should disable button when loading", () => {
    render(<Component isLoading />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Mocking Convention

```typescript
// API mocking
vi.mock("@/lib/api", () => ({
  generatePRD: vi.fn().mockResolvedValue({ content: "PRD" }),
}));

// Zustand store mocking
vi.mock("@/lib/store/useQuestionnaireStore", () => ({
  useQuestionnaireStore: vi.fn(() => ({
    stage1: { serviceName: "Test" },
    updateStage1: vi.fn(),
  })),
}));
```

---

## 🚨 Error Handling Protocol

### Error Classification

```yaml
Syntax Error:
  - Fix immediately
  - Run: npm run lint

Type Error:
  - Check: src/lib/types/
  - Fix type definitions
  - Run: npx tsc --noEmit

Test Failure:
  - If RED phase → Expected (continue)
  - If GREEN phase → Bug (fix)
  - If Refactor phase → Regression (revert)

Build Error:
  - Check: next.config.js, tailwind.config.ts
  - Verify: All imports valid
  - Run: npm run build
```

---

## 📊 Status Reporting Format

Report in this format after completing each task:

````markdown
## Task Completion Report

### Task: {task-name}

**Type**: Feature | Bug Fix | Refactor | Docs
**Status**: ✅ Complete | ⚠️ Partial | ❌ Failed

### Changes

- 📝 Files Modified: {count}
- ✅ Tests Added: {count}
- 🎨 Design Tokens Applied: Yes/No

### Test Results

```bash
npm test
✓ {N} tests passing
✗ {N} tests failing (if any)
```
````

### Next Steps

- [ ] Task 1
- [ ] Task 2

````

---

## 🔗 Critical File References

| File | Purpose | When to Read |
|------|---------|--------------|
| `tokens.json` | Design system | Every styling task |
| `src/lib/types/questionnaire.ts` | Type definitions | Every form implementation |
| `process/checklist.md` | Task tracking | Start/end of each task |
| `docs/scenarios/*.md` | Test scenarios | Before writing tests |
| `prompt/initial.md` | Original PRD | When requirements unclear |

---

## 🎯 Success Criteria

All tasks must meet these conditions to be considered complete:

- ✅ All tests passing (`npm test`)
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ No ESLint warnings (`npm run lint`)
- ✅ Design tokens applied (no hard-coded values)
- ✅ Korean language used (all UI text)
- ✅ Responsive design (320px ~ 1920px+)
- ✅ Documentation updated (`process/checklist.md`)

---

## 🔄 Iterative Improvement

This document itself is subject to improvement:

- If protocol is inefficient → Propose improvements
- When new patterns discovered → Suggest document updates
- When instructions unclear → Request clarification

**Update Protocol**:
```yaml
When to Update CLAUDE.md:
  - New workflow pattern discovered
  - Repeated manual intervention needed
  - Protocol execution failure rate > 20%

How to Update:
  - Propose changes in PR description
  - Get approval before merging
  - Update related docs (README, checklist)
````

---

## 🌐 Language Convention

**Korean UI Text**: All user-facing content must be in Korean

```typescript
// ✅ Correct
<Button>제출하기</Button>;
const errorMessage = "입력값이 유효하지 않습니다";

// ❌ Wrong
<Button>Submit</Button>;
const errorMessage = "Invalid input";
```

**Code & Comments**: English for code, comments, and technical documentation

```typescript
// ✅ Correct
// Validate user input before submission
const validateInput = (value: string) => { ... }

// ❌ Wrong (Korean comments in code)
// 사용자 입력 검증
const validateInput = (value: string) => { ... }
```

**Exception**: This CLAUDE.md and technical docs can be in English for international collaboration
