<!--
  Thanks for contributing to the System Design Roadmap!
  Use this template when adding a new reading to src/data/readings.ts.
  Fill in all sections below before opening the PR.

  ℹ️  AUTO-DEPLOY: Once this PR is merged into main, a GitHub Action
  automatically rebuilds the site and deploys it to GitHub Pages — no
  manual step needed!

  ℹ️  GITHUB USERNAME: Don't add `githubUser` to your entry. The maintainer
  will fill it in from your GitHub profile when merging, so your avatar and
  profile link appear on the site automatically.
-->

## 📖 Reading Contribution

### Resource being added

| Field          | Value |
|----------------|-------|
| **Title**      |       |
| **URL**        |       |
| **Type**       |       |
| **Difficulty** |       |
| **Topics**     |       |
| **Your Name (addedBy)** | |

---

### Why is this resource valuable?
<!-- What does it teach? Who should read it? One to three sentences. -->


### Related Issue
<!-- If suggested via a GitHub Issue, link it: Closes #<number> -->


---

### Contributor Checklist

- [ ] Added entry to `src/data/readings.ts` following the existing format
- [ ] `id` is the next sequential number (no gaps or duplicates)
- [ ] `type` is one of: `Blog · YouTube · LinkedIn · Book · Paper · Course · Newsletter · Thread · Docs · Website · Podcast · Tool · Repo · Slide · Case Study`
- [ ] `topics` are **lowercase kebab-case** strings, e.g. `["cap-theorem", "redis"]`
- [ ] `difficulty` is `"Beginner"`, `"Intermediate"`, or `"Advanced"` (or field omitted)
- [ ] `upvotes` is `0` for new entries
- [ ] `addedOn` is today's date `YYYY-MM-DD`
- [ ] **No `githubUser` field** — maintainer adds this from your PR profile
- [ ] URL is publicly accessible
- [ ] Not a duplicate — I checked `src/data/readings.ts`
- [ ] `npm run build` passes locally (optional but recommended)

---

### Entry preview

<!--
  Paste the exact object you added. Leave out githubUser — maintainer adds it.

  {
    id:         8,
    type:       "Blog",
    title:      "How Uber Scales Their Real-Time Marketplace",
    url:        "https://eng.uber.com/...",
    addedBy:    "Your Name",
    topics:     ["microservices", "real-time", "scale"],
    difficulty: "Advanced",
    upvotes:    0,
    addedOn:    "2026-04-25",
    notes:      "Deep-dive into surge pricing and driver-matching architecture.",
  }
-->

```ts
// paste your entry here
```

---

### Maintainer Notes
<!-- Fill in when reviewing: add githubUser from PR author's profile -->
