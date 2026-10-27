# CircuitForge Developer Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished `/developers` experience that takes a CircuitForge user from the Hash Preimage template to a passing and failing test, generated Cairo, export, and an optional Starknet Sepolia deployment path.

**Architecture:** Keep the guide inside the existing Next.js application rather than adding a documentation framework. Store guide facts in a typed content module, render them through small presentation components, and keep the page static except for lightweight copy/section interactions. Use the current CircuitForge visual language and link into the existing editor rather than duplicating editor behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, Vitest for focused content/component-independent checks, existing CircuitForge editor and deployment routes.

**Spec:** `docs/superpowers/specs/2026-10-27-developer-guide-design.md`

## Global Constraints

- Audience is only developers using CircuitForge to build, test, export, and deploy circuits.
- Do not add contributor setup, internal architecture, an API reference, MCP, SDK, search, changelog, or a documentation framework.
- The no-wallet Hash Preimage walkthrough is the primary success path; Sepolia deployment is optional.
- Use exact current UI labels and only claim behavior supported by the implementation.
- Preserve the existing black/cyan visual identity and existing dependencies unless a test-only dependency is required.
- Treat server-funded class declaration and user-wallet contract deployment as separate steps.
- Do not claim that AI assistance is a security review or that gas estimates are transaction quotes.
- Do not block delivery on repeating the previously working live wallet deployment; the user will run the final production wallet test before applying.

## Review Focus

- A developer with no Starknet wallet must be able to identify and complete the entire primary walkthrough without deployment prompts.
- Mobile readers must be able to navigate the guide without the sticky desktop sidebar covering content.
- Section links and calls to action must use valid `/developers#...` and `/editor` destinations.
- Block counts and names must agree with the actual 19-block toolbox and remain consistent across the guide, landing page, and README.
- Failure guidance must distinguish local validation/test failures from compiler, declaration, wallet, and deployment failures.

---

## File Structure

- Create `circuitforge/src/content/developerGuide.ts`: typed, factual guide content and block reference; no JSX.
- Create `circuitforge/src/content/developerGuide.test.ts`: assertions for section IDs, primary-path ordering, block counts, destinations, and troubleshooting coverage.
- Create `circuitforge/src/components/Developers/DeveloperHeader.tsx`: responsive guide header and section navigation.
- Create `circuitforge/src/components/Developers/WalkthroughStep.tsx`: numbered step layout with expected-result treatment.
- Create `circuitforge/src/components/Developers/CodeWindow.tsx`: accessible, selectable Cairo/terminal-style excerpt presentation.
- Create `circuitforge/src/components/Developers/EditorIllustration.tsx`: lightweight visual representation of the Hash Preimage block graph without coupling to Blockly.
- Create `circuitforge/src/app/developers/page.tsx`: page composition and metadata-facing content.
- Modify `circuitforge/src/components/Landing/LandingPage.tsx`: add the `Developers` navigation link and correct the block-count claim.
- Modify `README.md`: correct the block-count claim only.
- Modify `circuitforge/package.json` and lockfile: add the focused test command and test dependency.

### Task 1: Lock Guide Facts in a Tested Content Model

**Files:**
- Create: `circuitforge/src/content/developerGuide.ts`
- Create: `circuitforge/src/content/developerGuide.test.ts`
- Modify: `circuitforge/package.json`
- Modify: `circuitforge/package-lock.json`

**Interfaces:**
- Produces: `GuideSection`, `WalkthroughStep`, `BlockCategory`, `TroubleshootingItem`, `guideSections`, `walkthroughSteps`, `blockCategories`, `troubleshootingItems`, and `limitations` exports.
- Consumers: Tasks 2 and 3 import these exports without redefining guide copy or block facts.

- [ ] **Step 1: Add Vitest and a focused test command**

Add `vitest` as a dev dependency and `"test": "vitest run"` to `circuitforge/package.json`; update the lockfile with `npm install` from `circuitforge/`.

- [ ] **Step 2: Write failing content-model tests**

Create tests asserting:

- `guideSections` has unique IDs and includes `quickstart`, `cairo`, `export`, `deploy`, `blocks`, `troubleshooting`, and `limitations`.
- `walkthroughSteps` starts with Templates and orders test success before deliberate failure, Cairo inspection, and export.
- every editor CTA targets `/editor`.
- `blockCategories` totals exactly 19 and category counts are `3, 5, 2, 4, 4, 1`.
- troubleshooting includes validation, disabled tests, hash mismatch, compiler, wallet, network/funds, deployment, and browser-save/export cases.
- limitations include testnet status, hosted compiler dependency, estimate disclaimer, AI disclaimer, and browser-local save behavior.

- [ ] **Step 3: Run the test and confirm it fails**

Run: `npm test -- src/content/developerGuide.test.ts`

Expected: FAIL because `developerGuide.ts` and its exports do not exist.

- [ ] **Step 4: Implement the typed content module**

Use exact interface names from the Interfaces block. Encode the eight-step Hash Preimage walkthrough, the 19-block reference, troubleshooting items, and limitations from the approved spec. Keep deployment copy explicit that the server declares the class and the connected wallet deploys the instance.

- [ ] **Step 5: Run the focused test**

Run: `npm test -- src/content/developerGuide.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the content contract**

```bash
git add circuitforge/package.json circuitforge/package-lock.json circuitforge/src/content/developerGuide.ts circuitforge/src/content/developerGuide.test.ts
git commit -m "test: define developer guide content contract"
```

### Task 2: Build the Reusable Guide Presentation Components

**Files:**
- Create: `circuitforge/src/components/Developers/DeveloperHeader.tsx`
- Create: `circuitforge/src/components/Developers/WalkthroughStep.tsx`
- Create: `circuitforge/src/components/Developers/CodeWindow.tsx`
- Create: `circuitforge/src/components/Developers/EditorIllustration.tsx`

**Interfaces:**
- Consumes: `GuideSection` and `WalkthroughStep` from Task 1.
- Produces: `DeveloperHeader({ sections })`, `WalkthroughStepView({ step, children? })`, `CodeWindow({ label, code, language? })`, and `EditorIllustration()` React components.
- Consumers: Task 3 composes all four components on `/developers`.

- [ ] **Step 1: Write component source with accessibility constraints**

Implement the four exact component interfaces. Use semantic navigation, ordered step headings, selectable `<pre><code>` output, visible keyboard focus, and decorative SVG/CSS elements marked appropriately for assistive technology.

- [ ] **Step 2: Add responsive behavior**

Make the desktop header expose section links and `Open editor`; make narrow layouts retain home, current-page label, and editor action without horizontal overflow. Ensure `EditorIllustration` scales without fixed viewport assumptions.

- [ ] **Step 3: Run static checks**

Run: `npm run lint`

Expected: no errors in the new components.

- [ ] **Step 4: Commit the component layer**

```bash
git add circuitforge/src/components/Developers
git commit -m "feat: add developer guide components"
```

### Task 3: Compose the `/developers` User Journey

**Files:**
- Create: `circuitforge/src/app/developers/page.tsx`

**Interfaces:**
- Consumes: every content export from Task 1 and every presentation component from Task 2.
- Produces: static `/developers` route with stable anchors matching `guideSections`.

- [ ] **Step 1: Implement the outcome-led page opening**

Add the title `Build and test your first ZK circuit.`, the two prerequisite labels, `Start the walkthrough`, and `Open the editor`. The walkthrough CTA targets `#quickstart`; the editor CTA targets `/editor`.

- [ ] **Step 2: Implement the Hash Preimage walkthrough**

Render all eight steps from the content model. Include the visual block graph, a concise mapping from the graph to generated Cairo, explicit passing/failing expected-result treatments, and export choices. Do not invent hash values; explain use of the in-product Hash Helper when an exact captured value is unavailable.

- [ ] **Step 3: Implement optional deployment guidance**

Separate wallet prerequisites from the no-wallet quickstart. Present compile, server-funded declare, and wallet-funded deploy as distinct stages, and link successful transactions/contracts to the Voyager behavior already exposed by the editor.

- [ ] **Step 4: Implement block reference, troubleshooting, and limitations**

Render the 19-block reference as compact category groups, troubleshooting as a responsive symptom/cause/action table or stacked mobile equivalent, and the candid limitation list without marketing claims.

- [ ] **Step 5: Pin review-focus behavior with tests**

Extend `developerGuide.test.ts` to assert that primary walkthrough steps do not require a wallet, deployment is marked optional, all section-link anchors resolve to declared section IDs, and failure categories remain distinct.

- [ ] **Step 6: Run focused tests and build**

Run: `npm test -- src/content/developerGuide.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: Next.js build succeeds and includes `/developers` as a static route.

- [ ] **Step 7: Commit the page**

```bash
git add circuitforge/src/app/developers/page.tsx circuitforge/src/content/developerGuide.test.ts
git commit -m "feat: add CircuitForge developer guide"
```

### Task 4: Connect the Landing Page and Correct Public Claims

**Files:**
- Modify: `circuitforge/src/components/Landing/LandingPage.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `/developers` route from Task 3.
- Produces: visible public navigation into the guide and consistent 19-block claims.

- [ ] **Step 1: Add the landing-page Developers link**

Place a `Developers` link beside the existing `Launch Editor` action while preserving `Launch Editor` as the primary action. Ensure the navigation collapses cleanly on narrow screens.

- [ ] **Step 2: Correct block-count claims**

Replace the landing page's `16 block types` and README's `18 drag-and-drop blocks` with `19 block types`, matching the implemented toolbox.

- [ ] **Step 3: Run consistency and destination tests**

Extend `developerGuide.test.ts` to read the landing-page and README source and assert that neither stale block count remains and that the landing page links to `/developers`.

- [ ] **Step 4: Run all checks**

Run: `npm test`

Expected: PASS.

Run: `npm run lint`

Expected: no new errors.

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 5: Commit navigation and consistency fixes**

```bash
git add README.md circuitforge/src/components/Landing/LandingPage.tsx circuitforge/src/content/developerGuide.test.ts
git commit -m "docs: connect and align developer onboarding"
```

### Task 5: Browser QA and Production Handoff

**Files:**
- Modify if needed: files from Tasks 2-4 only for observed defects.

**Interfaces:**
- Consumes: complete `/developers` route and linked landing page.
- Produces: browser-verified desktop/mobile guide ready for the existing Vercel project.

- [ ] **Step 1: Start the local application**

Run: `npm run dev` from `circuitforge/` and open `/developers` in the browser.

Expected: page loads without console errors.

- [ ] **Step 2: Verify the primary desktop journey**

Check header anchors, the eight-step reading order, selectable code, block reference count, troubleshooting content, limitations, landing-page Developers navigation, and `/editor` links.

- [ ] **Step 3: Verify mobile and reduced-motion presentation**

Check a narrow mobile viewport for navigation overflow, table readability, clipped code, illustration scaling, and keyboard-focus visibility; verify reduced-motion behavior introduces no required animation.

- [ ] **Step 4: Re-run final automated verification**

Run: `npm test && npm run lint && npm run build`

Expected: all commands succeed with no new warnings attributable to this change.

- [ ] **Step 5: Commit QA repairs if any**

```bash
git add circuitforge/src/app/developers circuitforge/src/components/Developers circuitforge/src/content/developerGuide.ts circuitforge/src/content/developerGuide.test.ts circuitforge/src/components/Landing/LandingPage.tsx README.md
git commit -m "fix: polish developer guide experience"
```

- [ ] **Step 6: Production handoff**

Push through the repository's normal Vercel-connected branch only after the user requests or approves the external push. The user performs the final wallet-backed Sepolia deployment test before sending the Saifuro application.

