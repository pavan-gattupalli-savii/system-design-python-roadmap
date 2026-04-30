// InvertedIndex — documents → tokenize → inverted index → query lookup

export function InvertedIndex() {
  const W = 700, H = 320;

  const docs = [
    { id: "doc1", text: '"distributed systems scale"', col: "#6366f1" },
    { id: "doc2", text: '"systems design patterns"',   col: "#34d399" },
    { id: "doc3", text: '"scale with distributed db"', col: "#fbbf24" },
  ];

  const index: Array<{ term: string; postings: string[] }> = [
    { term: "design",      postings: ["doc2"] },
    { term: "distributed", postings: ["doc1", "doc3"] },
    { term: "patterns",    postings: ["doc2"] },
    { term: "scale",       postings: ["doc1", "doc3"] },
    { term: "systems",     postings: ["doc1", "doc2"] },
  ];

  const queryTerms = ["distributed", "scale"]; // intersection → doc1, doc3

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="ii-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
          <marker id="ii-yel" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
          </marker>
        </defs>

        <text x={350} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Inverted Index — Full-Text Search</text>

        {/* ── DOCUMENTS ── */}
        <text x={75} y={38} textAnchor="middle" fontSize={10} fontWeight={700} fill="#64748b">CORPUS</text>
        {docs.map((d, i) => (
          <g key={i}>
            <rect x={14} y={48 + i * 60} width={120} height={44} rx={6} fill={d.col + "18"} stroke={d.col + "80"} strokeWidth={1.5} />
            <text x={74} y={66 + i * 60} textAnchor="middle" fontSize={9} fontWeight={700} fill={d.col}>{d.id}</text>
            <text x={74} y={80 + i * 60} textAnchor="middle" fontSize={7.5} fill="#94a3b8">{d.text}</text>
          </g>
        ))}

        {/* Tokenize arrows */}
        {docs.map((d, i) => (
          <line key={i} x1={134} y1={70 + i * 60} x2={202} y2={70 + i * 60}
            stroke={d.col + "60"} strokeWidth={1.2} markerEnd="url(#ii-arr)" />
        ))}

        {/* Tokenize / Analyze box */}
        <rect x={202} y={50} width={90} height={160} rx={6} fill="#1e293b" stroke="#334155" />
        <text x={247} y={120} textAnchor="middle" fontSize={8} fontWeight={700} fill="#64748b" transform="rotate(-90 247 120)">
          tokenize · normalize · stem
        </text>

        {/* ── INVERTED INDEX ── */}
        <text x={390} y={38} textAnchor="middle" fontSize={10} fontWeight={700} fill="#64748b">INVERTED INDEX</text>
        {index.map((entry, i) => {
          const isQuery = queryTerms.includes(entry.term);
          const y = 50 + i * 48;
          return (
            <g key={i}>
              {/* Pipe from tokenizer to term */}
              <line x1={292} y1={y + 18} x2={300} y2={y + 18} stroke="#33415560" strokeWidth={1} markerEnd="url(#ii-arr)" />

              {/* Term box */}
              <rect x={300} y={y} width={70} height={36} rx={4}
                fill={isQuery ? "#fbbf2420" : "#1e293b"}
                stroke={isQuery ? "#fbbf24" : "#334155"}
                strokeWidth={isQuery ? 2 : 1.5} />
              <text x={335} y={y + 22} textAnchor="middle" fontSize={9} fontWeight={700}
                fill={isQuery ? "#fbbf24" : "#94a3b8"}>{entry.term}</text>

              {/* Posting list arrow */}
              <line x1={370} y1={y + 18} x2={390} y2={y + 18} stroke="#33415580" strokeWidth={1} markerEnd="url(#ii-arr)" />

              {/* Postings */}
              {entry.postings.map((p, pi) => {
                const docInfo = docs.find(d => d.id === p);
                const highlighted = isQuery;
                return (
                  <g key={pi}>
                    <rect x={390 + pi * 64} y={y} width={56} height={36} rx={4}
                      fill={highlighted ? (docInfo?.col || "#94a3b8") + "25" : "#1e293b"}
                      stroke={(docInfo?.col || "#94a3b8") + (highlighted ? "cc" : "60")}
                      strokeWidth={highlighted ? 2 : 1} />
                    <text x={418 + pi * 64} y={y + 14} textAnchor="middle" fontSize={8} fontWeight={700}
                      fill={docInfo?.col || "#94a3b8"}>{p}</text>
                    <text x={418 + pi * 64} y={y + 26} textAnchor="middle" fontSize={6.5} fill="#475569">pos:[1,3]</text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Query + result box */}
        <rect x={10} y={288} width={680} height={26} rx={5} fill="#fbbf2415" stroke="#fbbf2450" />
        <text x={350} y={303} textAnchor="middle" fontSize={8.5} fill="#fbbf24" fontWeight={700}>
          Query: "distributed scale"
        </text>
        <text x={350} y={309} textAnchor="middle" fontSize={7.5} fill="#94a3b8">
          → lookup "distributed" [doc1,doc3] ∩ "scale" [doc1,doc3] → Result: doc1, doc3 (ranked by BM25 score)
        </text>
      </svg>
    </div>
  );
}
