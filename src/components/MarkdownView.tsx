// Read-only markdown renderer styled for the dark + light app theme.
// Used in NotesTab (and anywhere else a saved user note is displayed).

import ReactMarkdown from "react-markdown";

interface Props {
  body: string;
}

export default function MarkdownView({ body }: Props) {
  return (
    <div className="md-view">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
