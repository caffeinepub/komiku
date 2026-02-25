# Specification

## Summary
**Goal:** Fix the 'actor not available' error on the Claim Admin button and the admin panel content not rendering after authentication in AdminLayout.tsx.

**Planned changes:**
- In `AdminLayout.tsx`, add a readiness check/await mechanism before calling `claimAdmin` to ensure the backend actor is fully initialized, handling the race condition between Internet Identity auth and actor initialization
- If the actor is still unavailable after retries, display a user-friendly error message instead of the raw 'actor not available' error
- Disable or show a loading indicator on the Claim Admin button while the actor is not yet initialized
- Fix admin panel content (sidebar navigation links, dashboard, comics, chapters, etc.) not rendering after successful authentication with a confirmed admin principal
- In `useQueries.ts` or actor initialization logic, add a guard/loading state that blocks mutation calls until the actor is non-null and expose a ready state to `AdminLayout.tsx`

**User-visible outcome:** Clicking the Claim Admin button no longer throws an error — it waits for the actor to be ready or shows a friendly message if it fails. After logging in as admin, the admin panel sidebar navigation and content render correctly instead of showing a blank panel.
