type Props = {
  content?: string | null;
  emptyMessage?: string;
};

export default function RiskPanel({ content, emptyMessage = "Run the pipeline to generate content." }: Props) {
  if (!content || content.trim() === "") {
    return (
      <div>
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
          {emptyMessage}
        </p>
      </div>
    );
  }
  return (
    <div className="risk-panel">
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        {content}
      </pre>
    </div>
  );
}
