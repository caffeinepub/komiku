# Specification

## Summary
**Goal:** Refactor the Chapter Grabbing UI in the admin panel to perform HTML fetching entirely on the frontend using allorigins.win as the primary proxy, with a fallback to corsproxy.io, instead of calling the backend grabComicPages function.

**Planned changes:**
- Remove the backend `grabComicPages` function call from `ChapterGrabbingPage.tsx`
- Fetch HTML from the admin-entered source URL via `https://api.allorigins.win/get?url=<encoded_url>` directly from the frontend
- Parse the returned HTML client-side to extract image URLs from `img` tags matching manga page patterns (large images, numbered filenames, CDN paths)
- If allorigins.win fails (network error, non-200, or timeout), automatically retry using `https://corsproxy.io/?<encoded_url>` as a fallback proxy
- Display a clear error message if both proxies fail
- Show successfully extracted image URLs in a preview grid rendering the actual images
- Allow the admin to reorder and remove images from the preview grid before saving
- Saving the confirmed page list still calls the existing backend chapter creation mutation

**User-visible outcome:** Admins can grab comic chapter pages entirely from the frontend by entering a source URL; the app tries allorigins.win first, falls back to corsproxy.io if needed, previews the extracted images in a reorderable grid, and saves the final selection using the existing backend mutation.
