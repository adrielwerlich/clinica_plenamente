## Follow-up Plan: Per-Image Feed Cropping

Give admins a free-form crop selection for every carousel image and render that selected region consistently in the public feed. The current square `aspectRatio: '1 / 1'` plus `objectFit: 'cover'` in `FeedCard` crops uploaded portrait graphics without giving admins control. User selected individual free-form crop controls (not fixed ratio presets) and a neutral frame background.

**Steps**
1. Add optional crop metadata to `FeedImage`, represented as normalized source-image coordinates (`x`, `y`, `width`, `height` from 0 to 100) plus the resulting crop aspect ratio. Existing image documents without crop metadata should default to the full image bounds.
2. Add a crop editor per image in `FeedEditor`: preview each source image, allow a freely resizable/movable crop rectangle without a fixed aspect ratio, reset crop, and show each image's crop preview. Preserve current remove-all, individual remove, and drag reordering behavior.
3. Persist crop metadata alongside each Base64 image document. New image uploads start with a full-image crop; editing a post updates metadata only, preserving the original Base64 so admins can revise crop later without additional image storage or degradation.
4. Replace the public feed's fixed square/`object-fit: cover` rendering with a crop-aware image frame. Compute frame ratio from the saved crop and render only the selected region, centered in a neutral background; carousel items may have different frame heights as their crop ratios differ. Keep arrows and count overlays aligned to the frame.
5. Add focused tests for free-form crop coordinate persistence, legacy images with no crop metadata, per-image different crop ratios, edited/reset crops, and consistency between admin preview and public crop display. Test desktop and narrow mobile widths for clipping, overflow, and carousel layout shifts.

**Relevant files**
- `src/types/feed.ts` — optional normalized crop geometry/aspect ratio on `FeedImage`.
- `src/pages/Admin/FeedEditor.tsx` — per-image crop UI and unsaved-change integration.
- `src/services/feedService.ts` — persist crop metadata in feed image documents during create/edit.
- `src/pages/Feed/Feed.tsx` — crop-aware public image frame replacing fixed square cover rendering.
- `package.json` — add a small established crop UI dependency if choosing a library; recommended `react-image-crop` because it supports a movable/resizable free-form selection. Verify React 19 compatibility before adding it.

**Decisions**
- Crop is configured independently per carousel image and is not restricted to presets/aspect ratios.
- Store normalized crop metadata and retain the source Base64; do not permanently crop/re-encode and discard the source.
- Crop selection determines each slide's display aspect ratio. This means carousel frame height can change between slides; avoid stretching/cropping beyond the selected region.
- A neutral background fills only any unavoidable frame gaps.

**Verification**
1. Build and run focused tests for crop math, save/load, legacy records, and rendering.
2. Manually crop portrait and landscape graphics differently in one carousel; save, revisit edit, adjust/reset crops, and confirm all slides show the same selected regions on desktop and mobile.
3. Confirm crop changes do not rewrite Base64 data or push Firestore image documents over the existing size budget.
