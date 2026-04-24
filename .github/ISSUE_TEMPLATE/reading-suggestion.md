---
name: "📖 Reading Suggestion"
about: "Suggest a resource to be added to the community Readings section"
title: "[Reading] <paste your title here>"
labels: ["reading-suggestion", "needs-review"]
assignees: ["pavan-gattupalli-savii"]
---

<!--
  Thanks for contributing! Fill in all the fields below.
  The maintainer will review, and if approved the resource will be merged into
  src/data/readings.ts and appear on the site automatically.
-->

## Resource Details

**Title**  
<!-- Short, human-readable title for the resource -->


**URL**  
<!-- Full https:// link -->


**Type**  
<!-- Pick one: Blog · YouTube · LinkedIn · Book · Paper · Course · Newsletter · Thread · Docs · Website · Podcast · Tool · Repo · Slide · Case Study -->


**Difficulty**  
<!-- Pick one: Beginner · Intermediate · Advanced -->


**Topics / Tags**  
<!-- Comma-separated lowercase kebab-case, e.g. `caching, redis, rate-limiting` -->


**Your Name (Added By)**  
<!-- How you want to appear in the table -->


**Your GitHub Username** *(optional — used for avatar + profile link)*  
<!-- e.g. pavan-gattupalli-savii -->


**One-line description / why it's useful** *(optional)*  
<!-- e.g. "Great visual breakdown of consistent hashing with real-world examples" -->


---

## Checklist

- [ ] The resource is publicly accessible (no paywall without noting it)
- [ ] The URL works and points to the correct page
- [ ] Topics are in lowercase kebab-case (e.g. `cap-theorem`, not `CAP Theorem`)
- [ ] I have read at least part of this resource and found it genuinely useful
- [ ] No duplicate — I checked the existing readings in `src/data/readings.ts`

---

<!--
  MAINTAINER NOTE:
  If approved, add an entry to src/data/readings.ts following the existing shape:

  {
    id:          <next available number>,
    type:        "<Type>",
    title:       "<Title>",
    url:          "<URL>",
    addedBy:     "<Name>",
    githubUser:  "<github-username>",   // optional
    topics:      ["<tag1>", "<tag2>"],
    difficulty:  "<Beginner|Intermediate|Advanced>",  // optional
    upvotes:     0,
    addedOn:     "<YYYY-MM-DD>",
    notes:       "<one-liner>",         // optional
  },
-->
