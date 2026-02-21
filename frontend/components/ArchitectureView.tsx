type Props = {
  content?: string | null;
};

export default function ArchitectureView({ content }: Props) {
  if (!content || content.trim() === "") {
    return (
      <div>
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
          Run the pipeline to generate the architecture overview. Diagrams and system overview will render here.
        </p>
      </div>
    );
  }
  return (
    <div className="architecture-view">
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
