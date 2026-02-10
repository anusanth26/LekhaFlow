# Frontend Unit Testing Report - LekhaFlow

## 1. Testing Strategy Overview

This report documents the unit and integration testing strategy implemented for the **LekhaFlow** frontend application (`apps/web`). The objective of this test suite is to ensure the reliability of core business logic (geometry/state), synchronization reliability (CRDT), and UI interaction flows (tool selection/auth).

### Testing Stack
-   **Test Runner**: `vitest` (Fast, Vite-native, watch mode support)
-   **Component Testing**: `@testing-library/react` + `@testing-library/user-event` (Realistic user interaction simulation)
-   **DOM Environment**: `happy-dom` (Faster execution than `jsdom` for virtual DOM rendering)
-   **Matchers**: `@testing-library/jest-dom` (Standard DOM assertions)

### Rationale: Isolation & Deterministic Math
Interactive canvas applications rely heavily on precise coordinate mathematics. By testing the **Geometry Layer (`element-utils.ts`)** and **State Management (`canvas-store.ts`)** in isolation:
1.  **Deterministic Verification**: We validate complex hit-testing logic without the unpredictability of browser resizing or pixel rendering.
2.  **Speed**: Unit tests execute in milliseconds, providing instant feedback on logic errors.
3.  **Conflict-Free Verification**: The synchronization layer (`useYjsSync.ts`) is tested with mocked WebSocket providers to simulate collaborative scenarios (race conditions, remote updates) efficiently without needing a real backend or multiple browser instances.

---

## 2. Test Coverage Breakdown

### Geometry Layer (`element-utils.test.ts`)
Validates pure functions responsible for hit-testing and element creation.
-   **Hit-Testing Accuracy**: Verifies `isPointInRectangle` and `isPointNearLine` handle buffer zones correctly.
-   **Negative Scaling Handling**: Tests "flip logic" (e.g., dragging a rectangle from bottom-right to top-left results in negative width/height) to ensure correct normalization.
-   **Selection Logic**: Confirms that clicking inside or near an element correctly identifies it.

### State Management (`canvas-store.test.ts`)
Validates the Zustand store which holds local application state.
-   **State Integrity**: Ensures `activeTool` updates correctly and resets selection when changing tools.
-   **Action-Driven Transitions**: Verifies add/update/delete actions modify the store as expected.
-   **No State Leakage**: Each test starts with a fresh store instance, preventing side-effects from previous tests.
-   **Bulk Operations**: Tests rapid deletion or modification of multiple elements.

### Real-Time Sync (`useYjsSync.test.ts`)
Validates the custom hook managing Yjs integration.
-   **CRDT Mocks**: Simulates various collaborative scenarios by mocking user actions on a shared `Y.Doc`.
-   **Conflict-Free Updates**: Verifies that remote updates (from simulated other clients) merge correctly into local state without overwriting local uncommitted changes.
-   **"Last-Local" Undo/Redo**: Confirms that undo operations only affect the local user's actions, respecting collaborative intent.
-   **Presence**: Validates that cursor updates for remote users are tracked correctly.

### UI Interaction (`ui-integration.test.tsx`)
Validates React components and user flows.
-   **Tool Selection**: Simulates clicks on the Toolbar and asserts visual feedback (active class styling) and store updates.
-   **Zoom Controls**: Tests boundary enforcement (min/max zoom) and reset functionality.
-   **Keyboard Hotkeys**: Verifies that global hotkeys (`R`, `V`, `Esc`) trigger the correct store actions via event listeners.
-   **Routing Guards**: Uses `vi.mock` on `next/navigation` to assert that unauthenticated users are redirected to login, while authenticated users can access the canvas.

---

## 3. Edge Case Matrix

The test suite explicitly handles the following critical edge cases:

| Component | Scenario | Expected Behavior |
| :--- | :--- | :--- |
| **Geometry** | Zero-dimension elements | Hit-testing returns `false` (no selection possible). |
| **Geometry** | Negative width/height | Logic normalizes coordinates; hit-testing works on flipped shape. |
| **State** | Deleting non-existent ID | Operation is ignored; application does not crash. |
| **Sync** | Concurrent remote update | Local state reflects latest remote change immediately (CRDT merge). |
| **Sync** | Disconnect/Reconnect | Data hydration re-syncs state from provider seamlessly. |
| **Auth** | Token Expiration (401) | `onAuthStateChange` detects logout; user redirected to `/login`. |
| **Zoom** | Excessive Zoom In (>500%) | Zoom level capped at 5x. |
| **Zoom** | Excessive Zoom Out (<10%) | Zoom level capped at 0.1x. |

---

## 4. Performance & Reliability Notes

### Test Isolation
To guarantee reliability and prevent flaky tests:
-   **Store Reset**: A `resetStore()` helper function is called in `beforeEach` to clear Zustand state entirely.
-   **Mock Clearing**: `vi.clearAllMocks()` runs before every test to ensure spy call counts are accurate.
-   **Hoisting**: `vi.hoisted` is used for module mocks (like `next/navigation` and `yjs`) to prevent temporal dead zone issues during test file execution.

### Deterministic Validation
-   **Parameterized Tests**: `test.each()` is used extensively in geometry tests to run dozens of coordinate permutations, ensuring robust math verification without code duplication.
-   **Mocked Time**: Where necessary, Vitest timers can be used to control debounce behavior (though current tests rely on direct state assertions).

---

## 5. Execution Guide

### Running the Tests
Execute the full test suite using the standard `test` script or directly via `vitest`:

```bash
# Run all tests once
npx vitest run

# Run tests in watch mode (development)
npx vitest
```

### Expected Output
Upon successful execution, Vitest should report **passing** status for all test files:

```
✓ test/element-utils.test.ts (19 tests)
✓ test/canvas-store.test.ts (10 tests)
✓ test/useYjsSync.test.ts (6 tests)
✓ test/ui-integration.test.tsx (23 tests)

Test Files  4 passed (4)
Tests       58 passed (58)
```

### Coverage Report
To generate a coverage report (optional setup required in vitest config):

```bash
npx vitest run --coverage
```
