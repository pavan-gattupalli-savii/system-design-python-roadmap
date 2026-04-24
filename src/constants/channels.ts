// ── REFERENCE CHANNELS ─────────────────────────────────────────────────────────
// Displayed in the Overview tab → "Key Channels & References" section.
// Add, remove, or reorder entries here — the UI renders whatever is in this array.
import type { Channel } from "../data/models";

export const CHANNELS_PYTHON: Channel[] = [
  { name: "ByteByteGo",           url: "https://youtube.com/@ByteByteGo",                        desc: "Visual system design walkthroughs" },
  { name: "Hussein Nasser",       url: "https://youtube.com/@hnasr",                             desc: "Deep dives on networking & databases" },
  { name: "Gaurav Sen",           url: "https://youtube.com/@gkcs",                              desc: "System design interview prep" },
  { name: "ArjanCodes",           url: "https://youtube.com/@ArjanCodes",                        desc: "Python design patterns & best practices" },
  { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer",   desc: "GitHub reference — bookmark this" },
  { name: "refactoring.guru",     url: "https://refactoring.guru",                               desc: "Design patterns with Python examples" },
  { name: "Use The Index, Luke",  url: "https://use-the-index-luke.com",                         desc: "SQL indexing deep dive — free" },
  { name: "Google SRE Book",      url: "https://sre.google/sre-book/table-of-contents/",         desc: "Reliability engineering by Google — free" },
];

export const CHANNELS_JAVA: Channel[] = [
  { name: "ByteByteGo",           url: "https://youtube.com/@ByteByteGo",                        desc: "Visual system design walkthroughs" },
  { name: "Hussein Nasser",       url: "https://youtube.com/@hnasr",                             desc: "Deep dives on networking & databases" },
  { name: "Amigoscode",           url: "https://youtube.com/@amigoscode",                        desc: "Spring Boot, Java & cloud tutorials" },
  { name: "Daily Code Buffer",    url: "https://youtube.com/@DailyCodeBuffer",                   desc: "Spring Boot & microservices tutorials" },
  { name: "Java Brains",          url: "https://youtube.com/@JavaBrainsChannel",                 desc: "Java fundamentals, Spring & concurrency" },
  { name: "TechWorld with Nana",  url: "https://youtube.com/@TechWorldwithNana",                 desc: "Docker, Kubernetes & DevOps" },
  { name: "Marco Codes",          url: "https://youtube.com/@MarcoCodes",                        desc: "Modern Java 21 patterns & performance" },
  { name: "Baeldung",             url: "https://baeldung.com",                                   desc: "The definitive Spring & Java tutorials site" },
  { name: "Vlad Mihalcea",        url: "https://vladmihalcea.com",                               desc: "JPA, Hibernate & database performance" },
  { name: "microservices.io",     url: "https://microservices.io/patterns/index.html",           desc: "Chris Richardson's microservice pattern catalog" },
  { name: "refactoring.guru",     url: "https://refactoring.guru",                               desc: "Design patterns with Java examples" },
  { name: "Use The Index, Luke",  url: "https://use-the-index-luke.com",                         desc: "SQL indexing deep dive — free" },
];

/** Convenience map — index by language id */
export const CHANNELS_BY_LANG: Record<string, Channel[]> = {
  python: CHANNELS_PYTHON,
  java:   CHANNELS_JAVA,
};

/** Back-compat default (Python) */
export const CHANNELS = CHANNELS_PYTHON;
