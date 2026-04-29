import type { Concept } from "./index";

export const lldSymbols: Concept = {
  slug:     "lld-symbols",
  title:    "UML / LLD Diagram Symbols",
  emoji:    "📐",
  category: "LLD",
  tagline:  "What every arrow and box in a class diagram actually means",
  roadmapKeywords: ["uml", "lld", "class diagram", "low level design", "design patterns", "solid"],
  related:  ["latency"],

  sections: [
    {
      heading: "Why Do These Matter?",
      body: `Low-Level Design (LLD) interviews expect you to draw class diagrams that clearly communicate ownership, dependencies, and lifecycles between objects. Using the wrong symbol sends the wrong signal — a composition arrow when you mean aggregation changes the meaning entirely.

The good news: once you internalize 6 relationships, you can read and draw any class diagram correctly.`,
      callout: {
        kind: "note",
        text: "UML (Unified Modeling Language) is the standard. When your interviewer says 'draw a class diagram', they expect UML notation. These symbols are not company-specific — they are universal.",
      },
    },

    {
      heading: "The Class Box — Building Block of Every Diagram",
      body: `Every entity in an LLD diagram is a class box. It is a rectangle divided into three compartments (though lower compartments can be omitted when not relevant):

1. Top section — Class name (bold, centred). If the class is abstract, the name is in italics.
2. Middle section — Attributes (fields), one per line. Format: visibility name: Type
3. Bottom section — Methods (operations), one per line. Format: visibility name(params): ReturnType

Visibility symbols:
+ means public   − means private   # means protected   ~ means package-level`,
      diagram: "lld-symbols",
      bullets: [
        "Interface: same rectangle but with «interface» stereotype label above the name, or a small lollipop circle on the line",
        "Abstract class: class name written in italics",
        "Enum: «enumeration» stereotype label above the name",
      ],
    },

    {
      heading: "The 6 Relationships You Must Know",
      body: `This is where most people get confused. There are 6 ways two classes can relate, and each has a distinct arrow. The key question to always ask: if Class A is destroyed, what happens to Class B?`,
      table: {
        cols: ["Relationship", "Arrow Style", "Strength", "Destroyed together?", "Example"],
        rows: [
          ["Association",  "A ——→ B  (solid, open arrowhead)",       "Weakest",   "No",  "Student knows Teacher"],
          ["Dependency",   "A - - → B  (dashed, open arrowhead)",    "Very weak", "No",  "OrderService uses PaymentDTO"],
          ["Aggregation",  "A ◇——→ B  (solid, hollow diamond at A)", "Weak",      "No",  "Team has Players (players survive without team)"],
          ["Composition",  "A ◆——→ B  (solid, filled diamond at A)", "Strong",    "Yes", "House has Rooms (rooms die with house)"],
          ["Inheritance",  "A ——▷ B  (solid, hollow triangle at B)", "N/A",       "N/A", "Dog extends Animal"],
          ["Realization",  "A - -▷ B  (dashed, hollow triangle at B)","N/A",      "N/A", "Duck implements Flyable"],
        ],
      },
    },

    {
      heading: "Association — 'Knows About'",
      body: `An association simply means one class holds a reference to another. It is the most general relationship — use it when an object uses another object but neither owns nor creates it.

The arrow points from the class that holds the reference to the class being referenced. You can add multiplicity labels (1, *, 0..1, 1..*) near the arrowheads to show cardinality.`,
      bullets: [
        "Bidirectional association: no arrowheads, or arrowheads on both ends",
        "Unidirectional: single arrowhead showing direction of navigation",
        "Example: a Student is associated with many Courses. A Course is associated with many Students.",
        "In code: the referencing class holds the other as a field or method parameter",
      ],
      callout: {
        kind: "tip",
        text: "Association is the default relationship. If you are unsure which to use and the two classes simply know about each other, use association and annotate it with the cardinality.",
      },
    },

    {
      heading: "Aggregation vs Composition — The Most Confused Pair",
      body: `Both aggregation and composition are 'has-a' relationships shown with a diamond at the owning end. The diamond is the key visual difference from a plain association arrow, and the fill tells you ownership strength.

Aggregation (◇ hollow diamond): the child can exist independently of the parent. If you delete the parent, the child survives. Think of a Team and its Players — if the team disbands, the players are still people.

Composition (◆ filled diamond): the child cannot exist without the parent. If you delete the parent, the child is destroyed too. Think of a House and its Rooms — if you demolish the house, the rooms cease to exist.

In code, composition usually means the parent is responsible for creating and destroying the child object (it is newed up inside the constructor, not passed in). Aggregation usually means the child is passed in from outside (dependency injection).`,
      callout: {
        kind: "warning",
        text: "The filled vs hollow diamond is the only visual difference between composition and aggregation. Get this wrong in an interview and you're implying a completely different lifecycle. When in doubt, ask yourself: 'Can the child survive without the parent?' If yes → aggregation (hollow). If no → composition (filled).",
      },
    },

    {
      heading: "Inheritance — 'Is-A'",
      body: `Inheritance (generalisation) is shown with a solid line and a hollow triangle (open arrowhead) pointing at the parent class. It represents the is-a relationship: a Dog is-a Animal.

The arrow always points from the child (subclass) to the parent (superclass). The hollow triangle sits at the parent end.

Realization is the interface equivalent: a class realizing (implementing) an interface. Same hollow triangle, but the line is dashed.`,
      bullets: [
        "Solid line + hollow triangle → class extending another class (extends in Java/TypeScript)",
        "Dashed line + hollow triangle → class implementing an interface (implements)",
        "Multiple realization arrows are fine — a class can implement many interfaces",
        "Multiple inheritance lines are rare in most OOP languages (Java/C# forbid it for classes)",
      ],
    },

    {
      heading: "Dependency — 'Uses Temporarily'",
      body: `A dependency is the weakest, most transient relationship. Class A depends on Class B if A uses B but does not hold a long-lived reference — typically B appears only as a method parameter, a local variable, or a return type.

Drawn as a dashed line with an open arrowhead, pointing from the using class to the used class.`,
      bullets: [
        "A service method that takes a DTO as a parameter and returns a response DTO — dependency",
        "A class that calls a static utility method — dependency on that utility class",
        "If B changes its interface, A may need to change — that is why it is called a dependency",
        "Prefer to minimise dependencies; too many dashed arrows signal a tightly coupled design",
      ],
    },

    {
      heading: "Quick Reference Cheat Sheet",
      body: `Use this table as a fast lookup when drawing or reading a diagram.`,
      table: {
        cols: ["Arrow", "Name", "Line", "Head", "Diamond", "Meaning"],
        rows: [
          ["——→",   "Association",  "Solid",  "Open arrow",     "—",             "A knows B / uses B long-term"],
          ["- -→",  "Dependency",   "Dashed", "Open arrow",     "—",             "A uses B temporarily (method param)"],
          ["◇——→",  "Aggregation",  "Solid",  "Open arrow",     "Hollow at A",   "A has B; B can exist alone"],
          ["◆——→",  "Composition",  "Solid",  "Open arrow",     "Filled at A",   "A owns B; B dies with A"],
          ["——▷",   "Inheritance",  "Solid",  "Hollow triangle","—",             "A extends B (is-a)"],
          ["- -▷",  "Realization",  "Dashed", "Hollow triangle","—",             "A implements B (interface)"],
        ],
      },
    },
  ],
};
