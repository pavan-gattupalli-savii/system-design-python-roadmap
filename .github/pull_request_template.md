<!--
  Thanks for contributing to the System Design Roadmap!
  Use this template when adding a new reading to src/data/readings.ts.
  Fill in all sections below before opening the PR.
-->

## 📖 Reading Addition PR

### Resource being added

| Field        | Value |
|--------------|-------|
| **Title**    |       |
| **URL**      |       |
| **Type**     |       |
| **Difficulty** |     |
| **Topics**   |       |
| **Added By** |       |

---

### Description
<!-- Why is this resource valuable? What does it teach? Who should read it? -->


### Related Issue
<!-- If this was suggested via a GitHub Issue, link it here: Closes #<number> -->


---

### Contributor Checklist

- [ ] I have added my entry to `src/data/readings.ts` following the exact same format as existing entries
- [ ] `id` is the next sequential number (no gaps or duplicates)
- [ ] `type` is one of the allowed types: `Blog · YouTube · LinkedIn · Book · Paper · Course · Newsletter · Thread · Docs · Website · Podcast · Tool · Repo · Slide · Case Study`
- [ ] `topics` are **lowercase kebab-case** strings in an array, e.g. `["cap-theorem", "redis"]`
- [ ] `difficulty` is one of `"Beginner"`, `"Intermediate"`, `"Advanced"` (or omitted)
- [ ] `upvotes` is set to `0` for new entries
- [ ] `addedOn` is today's date in `YYYY-MM-DD` format
- [ ] The URL is publicly accessible and correct
- [ ] No existing entry covers the same resource (I checked the file)
- [ ] I ran `npm run build` locally and it succeeds with no errors

---

### Entry preview

<!--
  Paste the exact JSON object you added to readings.ts here so the reviewer can
  quickly verify it without opening the file:

  {
    id:          8,
    type:        "Blog",
    title:       "How Uber Scales Their Real-Time Marketplace",
    url:          "https://eng.uber.com/...",
    addedBy:     "Your Name",
    githubUser:  "your-github-handle",
    topics:      ["microservices", "real-time", "scale"],
    difficulty:  "Advanced",
    upvotes:     0,
    addedOn:     "2026-04-25",
    notes:       "Deep-dive into surge pricing and driver-matching architecture.",
  }
-->

```ts
// paste your entry here
```

---

### Maintainer Review Notes
<!-- Maintainer fills this in during review -->
