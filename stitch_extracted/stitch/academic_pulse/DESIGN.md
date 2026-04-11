# Design System Specification: The Academic Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Academic Curator."** 

To move beyond the generic "social media grid," we are adopting an editorial approach that treats campus life as a curated collection of experiences rather than a chaotic feed. We achieve a premium, high-end feel by breaking the traditional container-heavy layout in favor of **Intentional Asymmetry** and **Soft Layering**. 

The goal is to provide a "breathable" interface where the purple primary tone acts as a sophisticated anchor, not a loud interruption. We avoid the "boxed-in" look by using negative space as a structural element, allowing content to feel integrated into the page rather than trapped within it.

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, intellectual purple (`#534AB7`), supported by a sophisticated range of neutral surfaces that prioritize legibility and calm.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning content. To separate a sidebar from a main feed, or a header from a hero section, you must use **Background Color Shifts**. For example, a `surface-container-low` navigation bar should sit directly against a `surface` background. The transition of tone creates the boundary, maintaining a modern, "limitless" aesthetic.

### Surface Hierarchy & Nesting
Depth is built through physical stacking, moving from dark/low to light/high:
- **Base Layer:** `background` (#f8f9fa)
- **Secondary Sections:** `surface-container-low` (#f3f4f5)
- **Primary Content Cards:** `surface-container-lowest` (#ffffff)
- **Active/Hover Overlays:** `surface-bright` (#f8f9fa)

### The "Glass & Gradient" Rule
To add "soul" to the interface, main CTA buttons and featured campus announcements should utilize a subtle linear gradient: `primary` (#3b309e) to `primary_container` (#534ab7) at a 135-degree angle. For floating navigation or mobile headers, apply **Glassmorphism**: use `surface` at 80% opacity with a `24px` backdrop-blur to allow the campus feed colors to bleed through softly.

## 3. Typography: The Editorial Voice
Our typography pairing balances the structural authority of **Manrope** with the utilitarian precision of **Inter**.

*   **The Display & Headline (Manrope):** Use `display-lg` through `headline-sm` for hero titles and section headers. Manrope’s geometric yet warm curves provide a "Modern University" feel. Use `headline-md` with intentional asymmetry—offsetting it to the left or right of the main content column to create an editorial look.
*   **The Content (Inter):** All `body` and `label` styles use Inter. It is the workhorse of the system, ensuring that even dense academic threads remain readable.
*   **Visual Hierarchy:** Use `label-md` in all-caps with `0.05em` letter-spacing for category tags (e.g., "FACULTY," "HOUSING") to provide an authoritative, organized tone.

## 4. Elevation & Depth: Tonal Layering
We reject the heavy drop-shadows of the early web. In this system, depth is felt, not seen.

*   **The Layering Principle:** To "lift" a card, do not reach for a shadow first. Instead, place a `surface-container-lowest` card on top of a `surface-container` background. The slight shift in lightness creates a natural, sophisticated lift.
*   **Ambient Shadows:** If a card requires a floating state (e.g., a modal or a primary post creation tool), use an expansive, "whisper" shadow: `0px 20px 40px rgba(25, 28, 29, 0.06)`. Note that the shadow is tinted with the `on-surface` color to ensure it looks like a real physical shadow.
*   **The Ghost Border Fallback:** For accessibility in input fields, use the "Ghost Border"—the `outline-variant` token at **20% opacity**. This provides a guide for the eye without creating a hard visual "cage."

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. `xl` roundedness. No border. Text is `on_primary`.
*   **Secondary:** `surface-container-high` background with `primary` text. This creates a "soft" button that doesn't compete with the main action.
*   **Tertiary:** Ghost style. No background or border. Use `title-sm` typography in `primary` color.

### Cards & Lists
*   **The Rule of Three:** No dividers. Separate list items using `16px` of vertical white space. 
*   **Campus Feed Cards:** Use `surface-container-lowest` with `md` roundedness. Content should be padded with at least `24px` to ensure the "Curator" aesthetic.

### Chips (Interests & Tags)
*   **Filter Chips:** `surface-container-high` background, `0.25rem` (sm) roundedness. 
*   **Action Chips:** `primary_fixed` background with `on_primary_fixed` text for high-contrast labels.

### Input Fields
*   **Styling:** `surface-container-low` background, no border, `sm` roundedness. On focus, the background shifts to `surface-container-lowest` with a `2px` `primary` bottom-accent line only.

### Social Context Components
*   **The "Thread-Line":** To show conversation nesting, use a `2px` wide vertical stroke of `surface-variant` rather than a full box.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts (e.g., a wide left column for the feed and a narrow, floating right column for "Campus Events").
*   **Do** use `surface-dim` for inactive states or footer backgrounds to ground the layout.
*   **Do** prioritize white space over lines. If the layout feels messy, add `8px` of padding rather than adding a border.
*   **Do** use `tertiary` (warm amber/gold tones) sparingly for high-value alerts or "Student Choice" awards to provide a premium contrast to the purple.

### Don't
*   **Don't** use pure black (#000). Always use `on_surface` (#191c1d) for text to maintain softness.
*   **Don't** use 100% opaque `outline` colors for borders. It breaks the "Academic Curator" softness.
*   **Don't** crowd the edges. Every component should have a "safe zone" of at least `16px` from the next element.
*   **Don't** use standard "drop shadows" on buttons. If a button needs to feel raised, use a subtle `primary_container` glow (low-opacity shadow in the primary color).