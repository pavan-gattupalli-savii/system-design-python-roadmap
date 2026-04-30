# Contributing to System Design Python Roadmap

Thank you for your interest in contributing! This project is a living resource — new concepts, curated readings, and real interview experiences make it more valuable for everyone.

---

## Ways to Contribute

| Type | Effort | Impact |
|------|--------|--------|
| 🧠 Add a Concept | Medium | High |
| 📚 Suggest a Reading | Low | Medium |
| 💬 Share an Interview Experience | Low | High |
| 🐛 Report a Bug or Typo | Very low | Medium |

---

## Dev Setup

```bash
# 1. Clone the repo
git clone https://github.com/pavan-gattupalli-savii/system-design-python-roadmap.git
cd system-design-python-roadmap

# 2. Install dependencies
npm install

# 3. Start the dev server (frontend only — no backend needed for concept work)
npm run dev
# → http://localhost:5173
```

The concepts section is entirely frontend — zero API calls. All content lives in `src/data/concepts/`.

---

## Adding a Concept

### Step 1 — Create the data file

Copy the template below to `src/data/concepts/your-topic.ts`:

```typescript
import type { Concept } from "./index";

export const yourTopic: Concept = {
  slug:     "your-topic",           // URL-safe, kebab-case, unique
  title:    "Your Topic Title",
  emoji:    "🔧",                   // pick a relevant emoji
  category: "Architecture",         // "Networking" | "LLD" | "Database" | "Architecture" | "Distributed Systems"
  tagline:  "One punchy sentence that describes this concept",
  roadmapKeywords: ["keyword1", "keyword2"],  // for roadmap highlighting
  related:  ["caching", "load-balancing"],    // slugs of related concepts

  sections: [
    {
      heading: "What Is It?",
      body: `Explain the concept in 2-3 paragraphs. Be concrete. Use examples.
Include a diagram on the first section if possible.`,
      diagram: "your-diagram-key",   // optional — see diagram guide below
    },
    {
      heading: "How It Works",
      body: `Step-by-step explanation. Use numbered steps in the body text.`,
    },
    {
      heading: "Comparison Table",
      table: {
        cols: ["Option", "Pros", "Cons"],
        rows: [
          ["Option A", "Fast", "Expensive"],
          ["Option B", "Cheap", "Slower"],
        ],
      },
    },
    {
      heading: "Key Takeaways",
      bullets: [
        "Point one",
        "Point two",
      ],
      callout: {
        kind: "note",  // "note" | "warning" | "tip"
        text: "A highlighted callout box for important caveats or tips.",
      },
    },
  ],
};
```

### Step 2 — Add an SVG diagram (optional but encouraged)

Create `src/components/concepts/diagrams/YourDiagram.tsx`:

```tsx
export function YourDiagram() {
  const W = 700, H = 280;
  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
        style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        {/* Use inline SVG elements: rect, circle, line, text, path */}
        {/* Colour palette — use CSS variables for dark/light mode: */}
        {/* Text: var(--text-heading), var(--text-secondary), var(--text-muted) */}
        {/* Dark fills: #1e293b, #0f172a */}
        {/* Accent colours: #6366f1 (blue), #34d399 (green), #fbbf24 (yellow), #f87171 (red) */}
      </svg>
    </div>
  );
}
```

Add a `<marker>` for arrow heads in `<defs>` — see existing diagrams for the pattern.

### Step 3 — Register everything in `src/data/concepts/index.ts`

1. Add your `DiagramKey` to the union type (if you added a diagram):
   ```typescript
   export type DiagramKey =
     | "existing-keys"
     | "your-diagram-key";   // ← add here
   ```
2. Import your concept:
   ```typescript
   import { yourTopic } from "./your-topic";
   ```
3. Add it to the `CONCEPTS` array:
   ```typescript
   export const CONCEPTS: Concept[] = [
     ...existingConcepts,
     yourTopic,   // ← add here
   ];
   ```

### Step 4 — Register the diagram in `src/components/concepts/ConceptDiagram.tsx`

```typescript
import { YourDiagram } from "./diagrams/YourDiagram";

// In the switch statement:
case "your-diagram-key": return <YourDiagram />;
```

### Step 5 — Test locally

```bash
npm run dev
# Navigate to /app/concepts and find your new concept in the sidebar
```

### Step 6 — Open a Pull Request

- Title: `feat(concepts): add [Topic Name] concept`
- Description: briefly explain what the concept covers and why it's useful for system design interviews

---

## Adding a Reading

Readings live in `src/data/readings.ts`. Each entry is:

```typescript
{
  title: "Article or Book Title",
  url:   "https://...",
  type:  "article",   // "article" | "paper" | "book" | "video"
  tags:  ["distributed systems", "consensus"],
  notes: "One sentence on why this is worth reading",
}
```

Open a PR with title: `feat(readings): add [Title]`

---

## Sharing an Interview Experience

Interview experiences are in `src/data/interviews.ts`. Add an entry:

```typescript
{
  company:    "Company Name",
  level:      "L5 / Senior",
  round:      "System Design",
  question:   "Design a distributed rate limiter",
  approach:   "What approach did you take? What trade-offs did you discuss?",
  outcome:    "Offer / No-offer / Unknown",
  year:       2024,
}
```

Anonymise any identifying details. Open a PR with title: `feat(interviews): add [Company] experience`

---

## Code Conventions

- **Styles**: always inline (`style={{ ... }}`). No CSS classnames, no new `.css` files.
- **Dark mode**: use CSS custom properties for text/bg — `var(--text-heading)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--bg-panel)`, `var(--border)`. Hard-code colour hex only for SVG accent colours.
- **TypeScript**: no `any`. Follow existing interfaces exactly.
- **Diagrams**: keep SVGs self-contained. Use `viewBox`, set `width="100%"`, and wrap in a `div` with `overflowX: "auto"`.
- **No external dependencies**: the concepts section has zero runtime dependencies beyond React. Keep it that way — it must build to a static site.
- **Lint**: `npm run lint` must pass before you open a PR.

---

## Questions?

Open a [GitHub Discussion](https://github.com/pavan-gattupalli-savii/system-design-python-roadmap/discussions) or connect on [LinkedIn](https://www.linkedin.com/in/iamgpavan/).
