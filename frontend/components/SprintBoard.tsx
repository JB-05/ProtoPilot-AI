import type { Sprint } from "@/lib/apiClient";

type Props = {
  sprints: Sprint[];
};

export default function SprintBoard({ sprints }: Props) {
  if (!sprints || sprints.length === 0) {
    return (
      <div>
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
          Run the pipeline to generate sprints and tasks. Tasks and backlog will render here.
        </p>
      </div>
    );
  }
  return (
    <div className="sprint-board">
      {sprints.map((sprint) => (
        <div key={sprint.id} className="sprint-board__sprint">
          <h3 className="sprint-board__sprint-title">
            {sprint.name || `Sprint ${sprint.sprint_index}`}
          </h3>
          <ul className="sprint-board__task-list" style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {sprint.tasks.map((task) => (
              <li key={task.id} className="sprint-board__task" style={{ marginBottom: "0.5rem" }}>
                <strong>{task.title}</strong>
                {task.description && (
                  <span style={{ display: "block", color: "#555", fontSize: "0.85rem" }}>
                    {task.description}
                  </span>
                )}
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "0.25rem",
                    fontSize: "0.75rem",
                    color: "#777",
                  }}
                >
                  {task.task_type && <span>{task.task_type}</span>}
                  {task.estimated_effort && (
                    <span style={{ marginLeft: "0.5rem" }}>• {task.estimated_effort}</span>
                  )}
                  {task.status && (
                    <span style={{ marginLeft: "0.5rem" }}>• {task.status}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
