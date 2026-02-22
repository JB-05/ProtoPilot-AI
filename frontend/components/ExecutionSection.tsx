"use client";

import type { Sprint } from "@/lib/apiClient";
import ArchitectureView from "./ArchitectureView";
import SprintBoard from "./SprintBoard";

type Props = {
  architectureContent: string | null;
  sprints: Sprint[];
};

export default function ExecutionSection({ architectureContent, sprints }: Props) {
  return (
    <section className="execution-section" aria-labelledby="execution-heading">
      <h2 id="execution-heading" className="execution-section__title">
        Execution Plan
      </h2>
      <div className="execution-section__grid">
        <div className="pipeline-result__card">
          <h3 className="pipeline-result__card-title">Architecture</h3>
          <ArchitectureView content={architectureContent} />
        </div>
        <div className="pipeline-result__card">
          <h3 className="pipeline-result__card-title">Sprint Board</h3>
          <SprintBoard sprints={sprints} />
        </div>
      </div>
    </section>
  );
}
