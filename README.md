# Concept Dock

Customizable dashboard: add shapes, resize them, add text/images, and link each shape to a page. Built from [spec1.md](private/specifications/dashboard/spec1.md) using the best of **Figma** (design), **Claude** ([dashboard.jsx](private/specifications/dashboard/dashboard.jsx)), and **Codex** ([PR #1: launch-sequence](https://github.com/ilakkmanoharan/launch-sequence/pull/1)).

- **Comparison doc:** [private/specifications/dashboard/COMPARISON.md](private/specifications/dashboard/COMPARISON.md)
- **Links (Figma, PR, spec):** [private/specifications/dashboard/IMPLEMENTATION_LINKS.md](private/specifications/dashboard/IMPLEMENTATION_LINKS.md)

## Run the dashboard

```bash
cd app && npm install && npm run dev
```

Then open the URL shown (e.g. http://localhost:5173).

**Features:** Click **+ Add Shape** to add circles, rounded squares, arrows, post-its, lines, etc. Drag shapes, resize (select then drag the blue handle), double-click to edit text. When a shape is selected you can set an **Image URL** and a **Link URL** (Enter button opens that link in a new tab, or the in-app page if no link). Layout is saved to localStorage.
