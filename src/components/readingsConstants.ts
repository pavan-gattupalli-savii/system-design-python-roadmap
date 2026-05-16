// Shared style maps for ReadingsTab + its lazy row/card chunks.

export const TYPE_ICONS: Record<string, string> = {
  Blog: "✍️", YouTube: "▶️", LinkedIn: "💼", Book: "📖", Paper: "📄",
  Course: "🎓", Newsletter: "📬", Thread: "🧵", Docs: "📘", Website: "🌐",
  Podcast: "🎙️", Tool: "🔧", Repo: "⭐", Slide: "🖥️", "Case Study": "🔬",
};

export const DIFF_STYLE: Record<string, { bg: string; tx: string }> = {
  Beginner:     { bg: "var(--badge-green-bg)",  tx: "var(--badge-green-tx)"  },
  Intermediate: { bg: "var(--badge-amber-bg)",  tx: "var(--badge-amber-tx)"  },
  Advanced:     { bg: "var(--badge-indigo-bg)", tx: "var(--badge-indigo-tx)" },
};
