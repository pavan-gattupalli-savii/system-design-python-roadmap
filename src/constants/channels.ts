// ── REFERENCE CHANNELS ─────────────────────────────────────────────────────────
// Displayed in the Overview tab → "Key Channels & References" section.
// Add, remove, or reorder entries here — the UI renders whatever is in this array.
import type { Channel } from "../data/models";

export const CHANNELS: Channel[] = [
  { name: "ByteByteGo",           url: "https://youtube.com/@ByteByteGo",                        desc: "Visual system design walkthroughs" },
  { name: "Hussein Nasser",       url: "https://youtube.com/@hnasr",                             desc: "Deep dives on networking & databases" },
  { name: "Gaurav Sen",           url: "https://youtube.com/@gkcs",                              desc: "System design interview prep" },
  { name: "ArjanCodes",           url: "https://youtube.com/@ArjanCodes",                        desc: "Python design patterns & best practices" },
  { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer",   desc: "GitHub reference — bookmark this" },
  { name: "refactoring.guru",     url: "https://refactoring.guru",                               desc: "Design patterns with Python examples" },
  { name: "Use The Index, Luke",  url: "https://use-the-index-luke.com",                         desc: "SQL indexing deep dive — free" },
  { name: "Google SRE Book",      url: "https://sre.google/sre-book/table-of-contents/",         desc: "Reliability engineering by Google — free" },
];
